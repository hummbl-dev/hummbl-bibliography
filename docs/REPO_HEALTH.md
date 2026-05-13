# Repository Health Contract

## Ownership

- **Repository**: `hummbl-dev/hummbl-bibliography`
- **Canonical URL**: `https://github.com/hummbl-dev/hummbl-bibliography`
- **Owner**: HUMMBL Team
- **Stewardship scope**: Curated bibliography data, HUMMBL transformation mappings, validation tooling, and quality reports.

## Lifecycle

- **Status**: Active public repository.
- **Default branch**: `main`.
- **Release posture**: Documentation and data updates may land continuously through pull requests. Toolkit behavior changes should include validation evidence in the PR body.
- **Archive trigger**: Archive only if another HUMMBL repository becomes the declared source of truth for bibliography entries and this repository is explicitly marked superseded.

## Source Of Truth

- `bibliography/` is the source of truth for BibTeX entries.
- `docs/QUALITY_STANDARDS.md` is the source of truth for citation and metadata requirements.
- `docs/TRANSFORMATION_GUIDE.md` is the source of truth for HUMMBL transformation tagging.
- `docs/GAP_ANALYSIS.md` is the source of truth for coverage gaps and improvement priorities.
- `toolkit/` is the source of truth for local validation and statistics commands.

## Validation Contract

Run from the repository root unless noted.

```bash
cd toolkit
npm ci
npm test
npm run stats
```

For focused checks:

```bash
cd toolkit
npm run validate:ci
npm run check-dups
npm run check-required-fields
npm run validate:memory-palace
```

Expected CI coverage:

- `.github/workflows/ci.yml` runs toolkit lint, tests, build-if-present, dependency audit, and CodeQL.
- `.github/workflows/validate.yml` validates bibliography data, duplicate detection, stats JSON generation, and README badge count for bibliography/toolkit changes.
- Supporting scheduled or manual workflows may enrich DOI data, produce stats reports, run security audit checks, and validate model artifacts.

## Branch Protection Expectation

`main` should be treated as protected:

- All non-trivial changes should land through pull requests.
- Required checks should include the Node matrix from `ci.yml` and bibliography validation when matching files change.
- Direct pushes to `main` should be limited to emergency operator action.
- PRs changing `bibliography/`, `docs/QUALITY_STANDARDS.md`, `docs/TRANSFORMATION_GUIDE.md`, or toolkit validation behavior should include local validation output.

## Fleet Scan Classification

Future fleet scans can classify this repository as:

- **Lifecycle**: active
- **Visibility**: public
- **Primary function**: HUMMBL bibliography and cognitive-transformation evidence base
- **Validation entrypoint**: `cd toolkit && npm test`
- **Primary metadata owner**: HUMMBL Team
