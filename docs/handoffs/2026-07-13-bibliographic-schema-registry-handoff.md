# Handoff — 2026-07-13 — bibliographic schema registry intake

## Purpose

Transfer the open-world bibliography schema inventory into a governed, source-backed registry lane without pretending the seed list is complete.

## Verified repository state

- Repo: `hummbl-dev/hummbl-bibliography`
- Current branch: `fix/gitleaks-citation-key-exception-2026-07-13`
- HEAD: `2ea6841`
- Worktree: dirty with unrelated pre-existing changes
- Relevant tracked/untracked files already present:
  - modified `.gitleaks.toml`
  - modified `bibliography/T1_canonical.bib`
  - multiple `tmp-*` artifacts
  - `toolkit/scripts/gitleaks-citation-key-adversarial.test.js`

## Relevant existing surfaces

- `docs/source-registry-v0.1.md`
- `toolkit/src/validate-source-registry.js`
- `fixtures/source-registry/source-registry-v0.1.fixtures.json`
- `sources/universal/source-registry-v0.1.json`

These already define and validate the Universal Source Registry lane. They are the closest governed artifact family, but they do not yet cover bibliographic schemas as a distinct taxonomy.

## Reused issue / routing context

- `hummbl-bibliography#110` — dedicated bibliographic schema registry issue
- `hummbl-bibliography#94` — existing source registry implementation issue
- `hummbl-bibliography#105` — broader grammar-governed corpus epic

Use `#110` for the bibliography-schema lane; keep `#94` as the adjacent source-registry reference.

## What the seed inventory is doing

The user-provided list is a useful candidate inventory, but it is not yet validated. It mixes:

- conceptual models,
- metadata schemas,
- interchange formats,
- ontologies/vocabularies,
- application profiles,
- cataloging standards,
- citation-output styles,
- transport protocols,
- identifier systems,
- and adjacent resource-description schemas.

That category separation needs to be explicit in the registry design.

## Recommended next step

1. Use `#110` as the governing issue and decide whether to extend `#94` or keep the lanes separate.
2. Draft `bibliographic_schema_registry.v0.1` with controlled categories and explicit evidence fields.
3. Add fixtures for valid, invalid, and ambiguous boundary cases.
4. Reuse the existing registry validator pattern, but keep bibliographic-schema categories separate from provider/source registration.
5. Generate counts from registry data only; do not hand-maintain totals.

## Unresolved claims

- Literal completeness is not defensible without an open-ended registry process.
- The seed inventory remains unverified until each entry is sourced to an authoritative primary reference.
- Crosswalks and styles must not be conflated with schemas.

## Handoff note

This is a planning handoff only. No bibliographic schema registry implementation has been started in this worktree.
