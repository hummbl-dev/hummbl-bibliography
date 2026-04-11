# Contributing

Thanks for your interest in contributing!

## Getting started
1. Fork the repository and clone your fork.
2. Install dependencies:
   - npm ci
3. Run lint and tests locally:
   - npm run lint
   - npm test

## Branching
- Use feature branches named like: feat/<short-description> or fix/<short-description>
- Prefix WIP branches with wip/
- Rebase or merge main frequently to keep PRs up to date

## Commits and PRs
- Use clear commit messages. Prefer conventional commits (feat:, fix:, docs:, chore:, refactor:, test:).
- Open a PR using the PR template. Link related issues and include testing notes.

## Code review
- Add reviewers and request CODEOWNERS review where relevant.
- Address review comments and keep changes small and focused.

## Releases & Changelog
- Maintain CHANGELOG.md for notable user-impacting changes.
- Use semantic versioning; consider automating releases (semantic-release) if desired.

## Code Style
- Use ESLint configuration present in repo (or add one) and format using Prettier if configured.

## Security
- Do not commit secrets. Use GitHub secrets for CI and environment variables.
- Report security issues privately if necessary.

## DOI Coverage Requirements

Every BibTeX entry must have either a `doi` field or a `% No DOI available` comment. Never leave an entry without one of these.

### If the entry has a DOI

Add the `doi` field after the last identifier field (`isbn`, `url`, etc.):

```bibtex
doi = {10.1145/3351095.3372873},
```

For arXiv preprints, use the CrossRef-registered arXiv DOI format:

```bibtex
doi = {10.48550/arXiv.2302.07842},
```

You can look up arXiv DOIs at `https://doi.org/10.48550/arXiv.XXXX.XXXXX`.

### If no DOI exists

Add a comment immediately after the last identifier field, before `abstract`:

```bibtex
isbn = {978-0-14-028329-7},
% No DOI available -- trade business book; no registered DOI for this edition
abstract = {
```

**Standard reason phrases** (use the most accurate one):
- `trade business book; no registered DOI for this edition`
- `practitioner blog post on <source>; no registered DOI`
- `pre-DOI era monograph (published YYYY); no registered DOI`
- `technical report; DOI not registered`
- `conference paper; DOI not found via CrossRef or AAAI/IEEE/ACM`

### Finding missing DOIs

Run the toolkit's DOI finder before concluding a DOI doesn't exist:

```bash
cd toolkit && npm run find-dois
```

This queries CrossRef for all entries missing a `doi` field. Add any found DOIs, then annotate the remaining entries with `% No DOI available`.

### Validation

`npm run validate` checks that every entry has either a `doi` field or a `% No DOI available` comment. The CI gate will fail on entries missing both.

### Memory Palace alias validation

Before committing changes to `toolkit/src/extensions/memoryPalace.ts`, run:

```bash
cd toolkit && npm run validate:memory-palace
```

This checks that no `canonical_name` or alias lowercases to the same key as another entry.
The pre-commit hook (installed via `bash scripts/setup-hooks.sh`) runs this check automatically
when `memoryPalace.ts` is staged.

**Common mistake**: adding an alias that is just a differently-cased version of the
`canonical_name` (e.g. `canonical_name: 'Via Negativa'` with alias `'via negativa'`).
`buildLookupMap()` lowercases all keys, so these collide. Remove the redundant alias.

**Note for CI/automation sessions**: when editing `memoryPalace.ts` or other TypeScript
source files in a code editor tool, read the file before editing it. Some editor tools
reject edits to files that have not been explicitly read in the current session.

---

Thanks for contributing!
