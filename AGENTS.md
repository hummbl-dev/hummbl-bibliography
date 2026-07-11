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
GitHub Actions workflows: `validate.yml`, `ci.yml`, `doi-enrichment.yml`, `security-audit.yml`, `stats-report.yml`, `validate-models.yml`. Validation runs on every PR; DOI enrichment and stats reports run on schedule.

## Direct-to-Main Policy

This repo is public (GitHub Actions are free) and main has no branch protection. Most work goes directly to main without a PR. The operator trusts local peer review (multi-agent review, `npm test`, `npm run type-check`) over CI gates.

### Tier 1 — Direct to main (no PR needed)
- Toolkit bug fixes and regression tests (covered by `npm test`)
- Dependency bumps (Dependabot or manual)
- Documentation updates (README, SITREP, AGENTS.md, docs/)
- Stats refreshes and bibliography validation warnings
- ESM/CJS conversions, refactors with passing tests
- Workflow file edits that don't change security posture

**Requirements before push:**
1. `npm test` passes locally (or `npm --prefix toolkit test`)
2. `npm run type-check` passes (if TypeScript files touched)
3. Commit message follows Conventional Commits
4. No secrets, credentials, or PII in the diff

### Tier 2 — PR recommended (operator reviews before merge)
- New bibliography entries (`.bib` file additions)
- Changes to `package.json` dependencies (not just devDeps)
- New GitHub Actions workflows or changes to trigger conditions
- Changes to security-audit or branch protection settings
- Anything touching `.github/workflows/security-audit.yml`

### Tier 3 — PR required (never direct to main)
- License changes
- Changes to `AGENTS.md` project scope or conventions
- Force pushes or history rewrites on main
- Deleting branches or tags
- Anything the operator explicitly flags as high-stakes

### Rationale
- Actions minutes are free for public repos. The cost of PRs here is friction, not money.
- CI runs on push to main anyway — skipping PRs doesn't skip CI, it just skips the pre-merge gate.
- The operator's local review process (Devin/Codex subagent verification, `npm test`) is trusted over CI for routine work.
- Tier 2 and 3 exist for changes where the cost of a mistake is higher than the friction of a PR.
