# CONSTITUTION.md — hummbl-bibliography

**Status:** v0.1
**Steward:** HUMMBL Research Institute
**Approving human:** Reuben Bowlby
**Standard:** HUMMBL Repo Standard v0.1
**Source of record:** git

## 1. Identity

`hummbl-dev/hummbl-bibliography` — HUMMBL Bibliography — provenance corpus, BibTeX citations, and position papers for Base120, HCC, BKI, and AI governance research.

- **Class:** library
- **Visibility:** public
- **License:** See LICENSE file
- **Standard:** HUMMBL Repo Standard v0.1

## 2. Scope

This constitution operates under the HUMMBL Repo Standard (`hummbl-dev/hummbl-governance/docs/standards/HUMMBL_REPO_STANDARD.md`) and the operating-environment constitution on the host machine. This constitution may be stricter than both, never weaker.

## 3. Protected invariants

These invariants are constitutionally protected. They cannot be changed, weakened, or conditionally suspended without a constitutional amendment (§7), a KRINEIA receipt, and human approval.

1. **Receipt integrity.** The Krineia chain is append-only and SHA-256-chained. No operator may rewrite history except via documented cut.
2. **No secrets in code.** No API keys, tokens, or credentials may be committed to tracked files.
3. **Standard compliance.** This repo adheres to the HUMMBL Repo Standard v0.1 as declared in hummbl.repo.yaml.
4. **Test gate.** CI must be green before any merge to a protected branch.
5. **Coverage floor.** Test coverage must meet the configured threshold. The floor may be raised but never lowered without amendment.

## 4. Normative files

The following files are normative. Edits require steward review (see `CODEOWNERS`):

- `CONSTITUTION.md`
- `KRINEIA.md`
- `hummbl.repo.yaml`
- `CODEOWNERS`
- `AGENTS.md`

## 5. Authority

- **Steward:** HUMMBL Research Institute
- **Approving human:** Reuben Bowlby
- **Codeowners:** `CODEOWNERS`
- **Agent operating contract:** `AGENTS.md`
- **Receipt manifest:** `KRINEIA.md`

## 6. Receipt-triggering changes

The following changes require a KRINEIA receipt before admission:

- Any edit to `CONSTITUTION.md`, `KRINEIA.md`, `hummbl.repo.yaml`, or `CODEOWNERS`
- Any change to a protected invariant (Section 3)
- Any release or version bump
- Any change to the repo's public contract or API surface

## 7. Amendment

Changes to this constitution require: a PR, an ADR under `docs/adr/`, a KRINEIA receipt, and human approval (Reuben Bowlby). Breaking changes bump this constitution's version (SemVer) and trigger a fleet re-audit of all repos consuming this repo's outputs.
