# ADR-001 — hummbl-bibliography repo governance baseline

- **Status:** accepted
- **Date:** 2026-06-22
- **Decision owner:** Reuben Bowlby
- **Steward:** HUMMBL Research Institute
- **Supersedes:** none
- **Superseded by:** none

## Context

A live audit of all `hummbl-dev` repositories found that `hummbl-dev/hummbl-bibliography` was missing the core governance artifact stack. The HUMMBL Repo Standard v0.1 was adopted in `hummbl-governance` (ADR-003).

## Decision

Adopt the HUMMBL Repo Standard v0.1 artifact stack for `hummbl-dev/hummbl-bibliography`.

### Files added

| File | Purpose |
|------|---------|
| `CONSTITUTION.md` | 5 protected invariants, authority, amendment |
| `KRINEIA.md` | repo-local receipt manifest |
| `hummbl.repo.yaml` | machine-readable manifest |
| `CODEOWNERS` | normative files require steward approval |
| `docs/adr/ADR-001` | this decision record |
| `_receipts/krineia/primary.jsonl` | genesis receipt |
| `docs/handoffs/2026-06-22` | handoff note |

## Consequences

- **Positive:** 5 protected invariants are now constitutionally protected.

## Receipts

- Genesis receipt: `_receipts/krineia/primary.jsonl` line 1.
