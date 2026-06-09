# Contributing to HUMMBL Bibliography

Thank you for your interest in contributing to the HUMMBL Bibliography!

## Overview

The HUMMBL Bibliography is a curated collection of 260 entries across 13 thematic tiers, providing foundational content for the Base120 mental model framework.

## Getting Started

1. Clone the repository
2. Ensure Python 3.11+ is installed
3. Review the structure in `bibliography/`
4. Read the quality standards in `docs/QUALITY_STANDARDS.md`

## Development Workflow

### Branching

- Create a branch from `main`
- Use format: `type/short-desc` (e.g., `feat/add-new-entry`)
- Never push directly to `main`

### Commit Format

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Never use `--no-verify`, never use `--no-gpg-sign`
- Example: `feat: add new entry to T2_empirical.bib`

### Adding Bibliography Entries

1. Choose the appropriate tier file (`T1_canonical.bib` through `T13_reasoning.bib`)
2. Add entry with required fields:
   - `title`, `author`, `year`, `publisher/journal`
   - `isbn` (for books) or `doi` (for articles)
   - `abstract` (100-300 words)
   - `keywords` (including HUMMBL transformation tags: `HUMMBL:P`, `HUMMBL:IN`, `HUMMBL:CO`, `HUMMBL:DE`, `HUMMBL:RE`, `HUMMBL:SY`)

3. Run validation:
   ```bash
   npm run validate
   ```

4. Regenerate unified bibliography:
   ```bash
   npm run build
   ```

### Quality Standards

- 100% abstract coverage required
- 100% HUMMBL keyword coverage required
- Target 75% DOI coverage (currently 70.8%)
- Target 50% ISBN coverage (currently 27.7%)
- Zero duplicates allowed

### Transformation Tags

Use these transformation tags in keywords:
- `HUMMBL:P` — Perspective/Identity
- `HUMMBL:IN` — Inversion
- `HUMMBL:CO` — Composition
- `HUMMBL:DE` — Decomposition
- `HUMMBL:RE` — Recursion
- `HUMMBL:SY` — Systems

Aim for balanced coverage across all 6 transformations (16.7% each).

## Testing

- Run validation before committing: `npm run validate`
- Check for duplicates: `npm run check-dups`
- View statistics: `npm run stats`

## Documentation

- Document tier-specific guidelines in tier README files
- Update transformation mappings in `hummbl-transformations.json`
- Document model-level mappings in separate files

## Questions?

- Open an issue on Gitea
- Post to the coordination bus
- Contact the maintainer

## License

MIT License — see LICENSE file for details
