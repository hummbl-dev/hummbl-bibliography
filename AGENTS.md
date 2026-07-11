# AGENTS.md — hummbl-bibliography

## Project
**hummbl-bibliography** — HUMMBL Bibliography: provenance corpus, BibTeX citations, and position papers for Base120, HCC, BKI, and AI governance research. 260 curated academic works across 13 thematic tiers, mapped to 6 cognitive transformations. TeX/BibTeX + Node.js toolkit, MIT.

## Scope
- In scope: Bibliography management system with 260 entries across 13 tiers (Canonical, Empirical, Applied, Agentic, Engineering, Governance, Emerging, Cognition, Economics, Collaboration, Security, Complexity, Reasoning). BibTeX source files, validation toolkit, DOI enrichment, duplicate detection, HUMMBL transformation keyword extraction, statistics reporting.
- Out of scope: Runtime reasoning engine, agent orchestration, governance enforcement. This is a provenance and citation corpus.

## Setup
```bash
git clone https://github.com/hummbl-dev/hummbl-bibliography.git
cd hummbl-bibliography
cd toolkit && npm install && cd ..
```
The root `package.json` delegates to the `toolkit/` package. After installing toolkit dependencies, root commands work directly.

## Testing
```bash
npm test              # Full test suite
npm run validate      # Validate all bibliography files
npm run check-dups    # Check for duplicates
npm run stats         # Generate statistics report
npm run keywords      # Extract HUMMBL transformation keywords
npm run find-dois     # Find missing DOIs
```

## Conventions
- BibTeX is the canonical source format; entries in `bibliography/` directory
- Each entry requires: abstract (150–300 words), HUMMBL transformation tags (P, IN, CO, DE, RE, SY)
- 13 thematic tiers, 20 entries each
- Mappings in `mappings/`; sources in `sources/`; reports in `reports/`
- Commit format: Conventional Commits
- Branch naming: `type/agent/short-desc`

## CI
GitHub Actions workflows: `validate.yml`, `ci.yml`, `doi-enrichment.yml`, `security-audit.yml`, `stats-report.yml`, `validate-models.yml`, `acronym-lint.yml`. Validation runs on push to main/develop and on PRs (path-filtered). Stats report runs on a weekly schedule; DOI enrichment is manual-trigger only (`workflow_dispatch`).

## Direct-to-Main Policy

This repo is public (GitHub Actions are free) and main has no branch protection. Most work goes directly to main without a PR. The operator trusts local peer review (multi-agent review, `npm test`, `npm run type-check`) over CI gates.

**Known limitation:** Tier 3 rules (no force push, no branch deletion) are honor-system only — without branch protection, the platform cannot enforce them. The policy relies on agent compliance and operator oversight.

### Tier 1 — Direct to main (no PR needed)
- Toolkit bug fixes and regression tests (covered by `npm test`)
- devDependency bumps (Dependabot or manual)
- Documentation updates (README, SITREP, docs/) — excludes AGENTS.md governance sections
- Stats refreshes and bibliography validation warnings
- ESM/CJS conversions, refactors with passing tests (no new public API, no new files, no changed exports)
- Workflow cosmetic edits only (comments, names, step ordering, runner image bumps). Anything touching `permissions:`, `secrets.`, `with:`, or trigger keys → Tier 2

**Requirements before push:**
1. `npm test` passes locally (or `npm --prefix toolkit test`). Do not bypass with `--no-verify`.
2. `npm run type-check` passes (if TypeScript files touched)
3. `npm run build` passes (if `toolkit/src/**` or `tsconfig.json` changed and `dist/` is committed)
4. `npm audit --omit=dev --audit-level=high` passes (if any dependency changed)
5. Commit message follows Conventional Commits
6. No secrets, credentials, or PII in the diff (verified by manual review — no automated scanner wired)

### Tier 2 — PR required (operator may waive in-commit)
- New bibliography entries (`.bib` file additions) or bulk bibliography reorganization
- Production `dependencies` bumps in `package.json` (not devDeps)
- npm script changes in `package.json` (`postinstall`/`prepare`/`preinstall` → Tier 3)
- New GitHub Actions workflows or changes to trigger conditions
- Changes to `permissions:`, `secrets.`, or `with:` keys in any workflow
- Anything touching `.github/workflows/security-audit.yml`
- `tsconfig.json` changes (can weaken the type-check gate)
- `.gitignore` changes (can leak secrets/artifacts)
- `.husky/` hook changes (can bypass local validation)
- File renames/moves (break imports, CI path filters, package.json main/exports)
- `toolkit/src/validate.js` changes (the core validator — semantic changes → Tier 3)
- New source files under `toolkit/src/` (not covered by existing tests)

**Waiver:** The operator may waive Tier 2 in writing. Include `Operator-approved direct commit: <reason>` in the commit body.

### Tier 3 — PR required (never direct to main, no waiver)
- License changes
- Changes to AGENTS.md Scope, Conventions, CI, or Direct-to-Main Policy sections (typos in Project/Setup/Testing sections are Tier 1)
- `postinstall`/`prepare`/`preinstall` npm script additions or changes
- Force pushes or history rewrites on main
- Deleting branches or tags
- Anything the operator explicitly flags as high-stakes

**Waiver:** Tier 3 items may be committed directly only when the operator gives explicit written assent in the commit message body: `Operator-approved Tier 3 direct commit: <reason>`. This makes the waiver auditable.

### Rationale
- Actions minutes are free for public repos. The cost of PRs here is friction, not money.
- CI runs on push to main anyway — skipping PRs doesn't skip CI, it just skips the pre-merge gate.
- The operator's local review process (Devin/Codex subagent verification, `npm test`) is trusted over CI for routine work.
- Tier 2 and 3 exist for changes where the cost of a mistake is higher than the friction of a PR.
- CI's npm audit is non-blocking (`continue-on-error: true`), so local `npm audit` is the only real gate for vulnerable dep bumps.
