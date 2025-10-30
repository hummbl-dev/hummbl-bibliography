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

Thanks for contributing!
