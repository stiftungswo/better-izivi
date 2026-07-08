# Integration tests

Black-box HTTP tests for the Better-iZivi Rails API, written in TypeScript so
they are unaffected by the Ruby/Rails upgrade they exist to guard (see
`RailsUpgradeProcess.md`, step 1). They hit a running instance of the API
over the network and assert on status codes and response shapes — they know
nothing about the Ruby process behind the API.

## Running

1. Start the API against a database with the schema loaded:

   ```sh
   docker compose up -d mysql api
   docker exec better_izivi_api bin/rails db:create db:schema:load
   ```

   `rails db:seed` is **not** required and does not need to have run
   (though it's harmless if it has — see below).

2. Install dependencies and run the suite:

   ```sh
   npm install
   npm test
   ```

   By default the suite targets the API at `http://localhost:28000` and
   MySQL at `localhost:23306` (root, no password, `better_izivi_development`)
   — the ports/credentials `docker-compose.yml` exposes. Override with
   `API_BASE_URL` / `TEST_DB_HOST` / `TEST_DB_PORT` / `TEST_DB_USER` /
   `TEST_DB_PASSWORD` / `TEST_DB_NAME` if needed.

## Why this doesn't rely on `rails db:seed`

A Jest `globalSetup` (`globalSetup.js`) connects to MySQL directly and
inserts, over raw SQL, the one thing the API has no endpoint to create (a
`RegionalCenter`) and the one privileged account self-registration can never
produce (an admin user). This is deliberate: `rails db:seed` is Ruby
application code that goes through the same models, validations and gems
this suite exists to protect against regressions in. It has already broken
silently once on `develop` — see the `service_days` seed fix in this branch,
which nobody noticed because nothing exercises `db:seed` in CI or in specs
(RSpec uses factories, not seeds). If seeding breaks again mid-upgrade, this
suite should still be able to stand itself up, using only the schema and a
running server.

Every other fixture (civil servants, service specifications, services,
expense sheets, holidays) is created by the tests themselves through the API
under test, following the same self-registration / admin-create flows a real
client would use.

## Route coverage

Every `rails routes` entry that's part of the actual API surface is
exercised, cross-checked route by route against `bin/rails routes` — including
both self-service Devise paths (`/v1/users/sign_in`, `/sign_out`, `/password`,
`/validate`, and the bare `/v1/users` collection route for
`registrations#update` / `#destroy`, which is a separate code path from the
admin-facing `/v1/users/:id`) and every domain resource's index/show/create/
update/destroy, PDF/XML exports, and calculator endpoints.

One thing is out of scope, not overlooked: Sidekiq's mounted web UI and the
default Rails ActiveStorage routes are Rails/gem scaffolding, not application
code — grepping the codebase for `has_one_attached` / `has_many_attached`
turns up nothing, confirming ActiveStorage isn't actually used by this
domain.

Everything else, including `GET /v1/expenses_sheet_sick_days_dime`, is
covered — see below for how that one works.

## Testing the DIME integration for real

`expenses_sheet_sick_days_dime` calls out to an external service (DIME) via
`AuthenticateInDime`, which hardcodes `use_ssl = true` and
`verify_mode = OpenSSL::SSL::VERIFY_PEER`. The real `API_URI_DIME` staging
host isn't reachable from here, so `dimeSickDays.test.ts` stands up its own
mock instead of skipping the endpoint:

1. `src/dimeMock.ts` generates a throwaway self-signed cert (`openssl req`)
   and starts a local HTTPS server implementing the three DIME endpoints
   `AuthenticateInDime` calls (`/v2/employees/sign_in`, `/v2/employees`
   search, `/v2/project_efforts`), recording every request it receives.
2. `src/dockerDime.ts` recreates the `api` container (`docker compose up -d
   --force-recreate api`) with `API_URI_DIME` pointed at the mock via the
   docker-compose bridge network's gateway IP (read off the running container
   with `docker inspect`, since docker-compose.yml doesn't pin a subnet and
   Docker may assign a different one per machine — reachable from inside the
   container as "the host"), then installs the mock's cert into the
   container's trust store (`docker exec -u root ... update-ca-certificates`)
   so the hardcoded `VERIFY_PEER` check passes.
3. Tests hit `/v1/expenses_sheet_sick_days_dime` for real and assert both the
   response *and* that the mock actually received the expected requests
   (the user's email in the search filter, the expense sheet's own date
   range — not the parent service's — in the project-efforts query).
4. `afterAll` always recreates the `api` container again with no override,
   restoring the real `API_URI_DIME` default from `docker-compose.yml`,
   before the next test file runs.

This required one small, backwards-compatible change to `docker-compose.yml`:
`API_URI_DIME` is now `${API_URI_DIME:-https://dime-apir-develop.stiftungswo.ch}`
instead of a hardcoded literal, so it can be overridden per-invocation without
touching the file again. Nothing changes for anyone who doesn't set that
env var.

Because this test file recreates a shared container twice, it needs the
`docker` CLI and `openssl` on whatever machine runs the suite, plus
permission to `docker exec -u root` into the `api` container. If it's
interrupted mid-run (e.g. `Ctrl-C`), the `api` container may be left pointed
at the (by-then-stopped) mock — rerun `docker compose up -d --force-recreate
api` to restore it.

## Notes

- Tests that need a "regular user" register a brand-new civil servant per
  test via the public registration endpoint, so nothing here mutates shared
  state other tests depend on. The suite doesn't need to run against a
  freshly wiped database between runs, but a persistent database will
  accumulate the users/services/holidays each run creates.
- A couple of tests are written against, and comment on, existing quirks in
  the API (e.g. `HolidaysController` has no admin restriction;
  `PaymentsController#create` returns `200` instead of `201` due to a
  `render state: :created` typo). These are captured as the current
  contract, not asserted as correct — the goal of this suite is to catch
  behavior changes during the Rails upgrade, not to fix pre-existing bugs.
- `ExpenseSheetCalculators::SuggestionsCalculator#calculate_to_pay_days`
  divides by a service specification's `work_clothing_expenses` without a
  zero guard (unlike its sibling method a few lines below, which has one) —
  it 500s on `/hints` if that field is `0`. `fixtures.ts` sets it to a
  non-zero value for exactly this reason.
- `Payment#payment_timestamp` is floored to the whole second and is the only
  thing a payment is grouped/keyed by, so two `POST /v1/payments` calls
  landing in the same wall-clock second collide into one payment.
  `payments.test.ts` waits for a fresh second before each one — this suite
  runs fast enough for the collision to happen for real, not just in theory.
- The password-reset test reads the token out of the email `letter_opener`
  (this dev environment's `ActionMailer` delivery method) writes to
  `api/tmp/letter_opener/<id>/rich.html` — see `src/mail.ts`. Devise only
  ever stores a digest of the token in the DB, so the delivered email is the
  only place the raw value appears. `docker-compose.yml` bind-mounts `./api`
  into the container, so this directory is also readable from the host.
