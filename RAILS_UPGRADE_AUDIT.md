# Rails Upgrade — Step 2 Audit (2026-07-08)

Snapshot of `develop` at commit `8fef3922`, taken before touching any gem or Rails config, per step 2 of `RAILS_UPGRADE_PROCESS.md`. Step 1 (the TypeScript integration test harness, `integration-tests/`) is merged and green.

## Current versions

| Component | Version | Target |
|---|---|---|
| Ruby | 2.7.5 (EOL since 2023-03-31 — confirmed by `brakeman`) | 3.4.x |
| Rails | 6.1.6.1 | 8.0.x |
| Bundler | 2.1.4 | current (2.5+) |
| MariaDB (dev/CI) | 10.3.14 | 10.11+ / 11.x |

Path: `6.1 → 7.0 → 7.1 → 8.0`, one major version at a time, per step 3.

## Test suite baseline

- **829 examples, 0 failures, 4 pending** (`bundle exec rspec`, full suite, seed 65520)
  - The 4 pending are all the same known gap: `Pdfs::ServiceAgreement::FormFiller` French-locale rendering is `xcontext`-skipped (`spec/services/pdfs/service_agreement/form_filler_spec.rb:102`) — pre-existing, not caused by this audit.
- **Coverage: 84.57% (1842/2178 LOC)**, `SimpleCov.minimum_coverage 80` enforced in `spec/spec_helper.rb`. No `:nocov:` tags anywhere in `app/`.
- **RuboCop: 0 offenses** on the full codebase (rubocop 1.35, rubocop-rails 2.15, rubocop-rspec 2.12). `.rubocop_todo.yml` is small (44 lines, 2 cop exclusions) — low pre-existing debt to carry through the upgrade.
- **Brakeman: 1 warning** (the Ruby EOL one above), 0 other security findings.
- Integration test harness (`integration-tests/`, TypeScript/Jest, independent of Ruby): **69/69 passing** against the current app — this is the safety net for the whole upgrade.

## Weakest coverage (below 90% line coverage)

| File | Coverage | Lines | Risk |
|---|---|---|---|
| `app/services/subscribe_to_newsletter.rb` | 0% | 19 | Low use, but zero signal if it breaks silently |
| `app/services/pdfs/expenses_overview_service.rb` | 0% | 207 | Largest gap by far — a whole PDF export path with no unit coverage |
| `app/services/authenticate_in_dime.rb` | 0% | 69 | External DIME integration — only covered end-to-end via `integration-tests/tests/dimeSickDays.test.ts`, no RSpec unit coverage of its SSL/error-handling branches |
| `app/controllers/v1/expenses_overview_controller.rb` | 50% | 26 | Also has a known order-dependent flaky spec (`spec/requests/v1/expenses_overview_controller_spec.rb:84`, historically flaky per commit `0703c2ff`) |
| `app/controllers/v1/payments_list_controller.rb` | 84% | 19 | — |
| `app/controllers/devise_overrides/registrations_controller.rb` | 86% | 29 | — |
| `app/services/short_service_calculator.rb` | 88% | 34 | — |

These are good candidates for step 8 (coverage improvement pass) — `authenticate_in_dime.rb` and `expenses_overview_service.rb` especially, since they're both entirely untested at the unit level and sit on business-critical paths (external auth call, and a PDF export).

## Gems most likely to break across 6.1 → 8.0

Ranked by expected risk, per step 5's triage order:

1. **`sentry-raven` (3.1.2)** — hard blocker. This gem was deprecated in favor of `sentry-ruby`/`sentry-rails` years ago and predates modern Rails error-reporting hooks; it will very likely need replacing outright, not just version-bumping.
2. **`sidekiq` (~> 6.5) / `sidekiq-cron` (~> 1.9)** — Sidekiq 7+ is required for Rails 7.1+/8 compatibility (Redis client changes, `Sidekiq::Job` rename). The newly-added `sidekiq-cron` schedule (`config/schedule.yml`, PR #569/#570) needs re-verification after this bump — re-run the same manual smoke test used when it was introduced (`perform_now` + real Sidekiq-queue execution).
3. **`devise` (4.8.1) / `devise-jwt` (0.9.0) / `warden-jwt_auth` (0.6.0)`** — auth stack, historically the riskiest category per the process doc. `devise-jwt` and `warden-jwt_auth` are both fairly thin wrappers with a small maintenance history; check their compatibility matrices before bumping Rails past 7.0.
4. **`bootsnap` (1.13.0)** — needs a recent version for Ruby 3.4 (older bootsnap versions don't support newer YJIT/Ruby internals).
5. **`rack-cors` (1.1.1)** — Rails 7+ default middleware stack changed; verify CORS still applies to the same paths (this app restricts it to `/assets/*` plus `FRONTEND_URL` — see `config/environments/production.rb:98-104`).
6. **PDF/export stack** (`hexapdf`, `prawn`, `prawn-table`, `pdf-forms`, `docx`, `sepa_king`) — not Rails-coupled, low risk, but exercised almost entirely through the integration test harness (`exports.test.ts`) rather than unit specs, so lean on that suite here.
7. **`mysql2`** — currently constrained to `< 0.6.0`; Rails 7.1+ dropped support for older `mysql2` versions, so this constraint will need loosening in lockstep with the Rails bump.

## CI/Docker assumptions to update (step 9 preview)

- `api/dev.Dockerfile` and `api/prod.Dockerfile` both pin `FROM ruby:2.7.5` and `BUNDLER_VERSION=2.1.4`.
- `.github/workflows/ci.yml` builds the backend image from `api/dev.Dockerfile` (so the same Ruby bump covers CI) but still uses `actions/checkout@v2` (GitHub already flags this as deprecated — forced onto Node 24 runners) and, on the frontend side, `node:10` / `cypress/browsers:node10.16.3-chrome80-ff73`, both long EOL. Frontend isn't in scope for the Rails/Ruby upgrade itself, but if Docker base images are being touched anyway it's worth a follow-up ticket.
- `docker-compose.semaphore.yml` is still the literal filename CI shells out to (`ci.yml:71`), despite Semaphore CI itself having been retired (branch protection already cleaned up, see PR history) — worth renaming once this upgrade branch is out of the way, per step 9's "rename CI compose files that reference old service names."
- Local dev/CI both run MariaDB `10.3.14`; no evidence of version-specific SQL elsewhere, but bump this alongside Rails per step 9.

## Summary

The codebase is in a good starting position for this: clean RuboCop, 0 unexpected RSpec failures, 84.57% coverage with an enforced 80% floor, and a fresh 69-test black-box integration suite as an independent safety net. The main risk concentration is the auth (`devise`/`devise-jwt`/`warden-jwt_auth`) and background-job (`sidekiq`/`sidekiq-cron`) stacks, plus one outright-deprecated gem (`sentry-raven`) that should be swapped for `sentry-ruby` rather than upgraded in place. Proceed to step 3 (incremental Rails bump, 6.1 → 7.0 first) next.
