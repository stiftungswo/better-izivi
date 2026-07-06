# Rails Major Version Upgrade Process

A repeatable process for upgrading a Rails API app across multiple major versions (e.g. Rails 6 → 8, Ruby 2.7 → 3.4).

---

## 1. Write an integration test harness first

Before touching any gem or config, write a suite of end-to-end integration tests against the running API. These are your safety net for the entire upgrade — if they pass at the end, the upgrade didn't break user-visible behavior.

Use a language independent of the app (TypeScript/Jest works well for a Rails API) so the test runner is unaffected by Ruby or Rails changes. Cover:

- Every major resource: CRUD operations, authentication, edge cases
- Any business-critical exports or report endpoints (PDFs, XLSX, etc.)
- Error cases (unauthorized, validation failures, missing records)

Run these against the **current** app first and get them all green. Commit them. They are now the contract you must not break.

The integration tests also expose gaps in your existing behavior — undocumented response shapes, implicit assumptions about status codes — that are better discovered now than mid-upgrade.

---

## 2. Audit before touching Rails

Before changing a line of code, document the current state:

- Ruby version, Rails version, all gem versions
- Test suite pass rate and coverage percentage
- Which parts of the codebase have zero or weak coverage
- Which gems are likely to have breaking changes (auth, serialization, background jobs, pagination, soft-delete)
- CI pipeline assumptions (Ruby version in Dockerfile, CI config, database version)

Write this down. You will reference it constantly.

---

## 3. Upgrade Rails incrementally — one major version at a time

Never jump directly from Rails 6.0 to 8.0. Step through each major version:

```
6.0 → 6.1 → 7.0 → 7.1 → 8.0
```

For each step:

1. Update the `rails` gem version in Gemfile
2. Run `bundle update rails` (plus closely coupled gems like `activerecord`, `actionpack`)
3. Run `bin/rails app:update` to get new initializers, config defaults, and framework defaults — review every change
4. Run the test suite. Fix failures before moving to the next version.
5. Commit the working state at each version before proceeding

The framework itself ships a migration guide for each version pair. Read it. The defaults that change between versions are often the source of subtle runtime breakage.

---

## 4. Upgrade Ruby separately from Rails

Upgrading Ruby and Rails at the same time makes it hard to attribute failures. Prefer:

- Upgrade Rails to the target version first (still on old Ruby if compatible)
- Then bump Ruby
- Or: upgrade Ruby first, fix Ruby-level breakage, then upgrade Rails

The biggest Ruby 2 → 3 breaking change is **keyword argument separation**. Methods that accepted `**options` as a positional hash now require explicit keyword syntax at call sites. The interpreter error messages are clear; the fix is mechanical.

---

## 5. Resolve gem compatibility

After bumping Rails and Ruby, many gems will either fail to install or install but behave differently. Triage order:

1. **Hard blockers** — gems that won't install at all (incompatible version constraints). Update or replace them.
2. **Silent behavior changes** — gems that install but changed their API (read changelogs between your old and new pinned version).
3. **Soft-delete, serialization, and auth gems** are historically the riskiest here. Test them explicitly.

Pin gems that are not yet compatible to an older version and file a ticket to revisit later. Don't let one incompatible gem block the whole upgrade.

---

## 6. Fix the test suite

After the upgrade, the test suite will have failures. Work through them in priority order:

1. **Factory/fixture failures** — often caused by changed validations or renamed columns
2. **Controller spec failures** — Rails 8 changed parameter handling (`params.require` behavior), response codes, and some middleware defaults
3. **Model spec failures** — scope changes, validation changes, enum syntax changes (Rails 7+ uses keyword syntax)
4. **Service/integration failures** — usually logic that relied on implicit behavior that changed

Do not use unsafe autocorrect (`rubocop -A`) during this phase. It will silently change `params.require(:x)` to `params.expect(:x)` and break working tests without obvious errors.

Get to green before moving on.

---

## 7. Fix linting

RuboCop and its extension gems (rubocop-rails, rubocop-rspec, rubocop-performance) ship new cops with major releases. After upgrading them:

1. Run `bundle exec rubocop` on the **entire codebase**, not just changed files
2. Apply only **safe autocorrect** (`--autocorrect`, not `-A`)
3. Regenerate `rubocop_todo.yml` with `--auto-gen-config --auto-gen-only-exclude --exclude-limit 1000 --no-offense-counts`
4. After regenerating, check that any glob patterns you relied on (`spec/services/**/*`) were not replaced with individual file lists — the generator does this and it makes the todo brittle

Run the full linter before every push. CI will check everything; local spot-checks will not catch it.

---

## 8. Improve test coverage

The upgrade is a good forcing function to close coverage gaps that accumulated over time:

- Identify untested services (often the worst offenders — zero specs, hidden behind `:nocov:` tags)
- Write unit specs for each service, testing all public methods and meaningful edge cases
- Remove `:nocov:` tags from code that is now tested
- Fill in empty controller spec stubs (index, show, create, update, destroy, unauthorized)
- Add missing model specs (associations, validations)

Measure before and after. A 5–10 point coverage gain is achievable in a single pass.

---

## 9. Update Docker and CI

- Bump the base image (e.g. `ruby:3.4`)
- If you added a non-root user for security, `chown` the app directory **before** switching to that user — otherwise Rails can't write to `tmp/` or `log/` at runtime
- Update database versions in docker-compose (MySQL 5.7 → 8.x, Postgres 14 → 16, etc.)
- Update `actions/checkout` and other GitHub Actions to current versions
- Rename or update CI compose files if they reference old service names

---

## 10. PR review cycle

Open the PR early (draft if needed) to get CI running. Expect multiple rounds:

- First CI run reveals linting failures you missed locally
- Code review (automated or human) finds gaps in test assertions, missing guards, Docker issues
- Reply to every comment — either "fixed in commit X" or a clear reason why it's out of scope
- Keep the branch rebased or at least conflict-free against the target branch

---

## Key lessons

- **Run linting on the full codebase before every push.** Not just changed files. The entire thing.
- **Never use unsafe autocorrect (`-A`) during an active upgrade.** It changes semantics, not just style.
- **Step through major versions one at a time** and commit a passing state at each step.
- **Read gem changelogs** between your pinned versions, especially for auth, serialization, and soft-delete gems.
- **Write integration tests before the first gem bump** — they are your contract, not your afterthought.
- **Test coverage gaps become visible during upgrades** — take the opportunity to close them.
- **Docker non-root users need explicit `chown`** after `COPY` and before `USER`.
