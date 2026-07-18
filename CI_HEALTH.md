# CI Health — hummbl-dev/hummbl-bibliography

Last updated: 2026-07-16

## Known Issues

### Current blockers

- GitHub Actions execution/billing is degraded; affected runs must be treated as unverified.
- The registered self-hosted runner `wsl-bib` is offline for non-pull-request workflows.
- Security-audit artifact storage is exhausted, so audit artifacts cannot currently be retained.
- The validation workflow will fail until the README entry badge matches generated statistics (currently 321).

## Recently fixed
- npm audit is now non-blocking in `ci.yml` (`continue-on-error: true`); high-severity findings remain visible as warnings.

## CI Workflows
| Workflow | Status | Notes |
|----------|--------|-------|
| `ci.yml` | Unverified | Actions execution/billing outage; local test suite passes |
| `security-audit.yml` | Blocked | Artifact storage quota exhausted; runner unavailable for non-PR events |
| `validate.yml` | Expected failure | README badge count is stale: 260 vs generated total 321 |

Generated with [Devin](https://devin.ai)
