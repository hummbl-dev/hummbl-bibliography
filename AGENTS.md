# AGENTS.md — hummbl-bibliography

## Project
**hummbl-bibliography** — HUMMBL Bibliography: provenance corpus, BibTeX citations, and position papers for Base120, HCC, BKI, and AI governance research. 260 curated academic works across 13 thematic tiers, mapped to 6 cognitive transformations. TeX/BibTeX + Node.js toolkit, Apache 2.0.

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
