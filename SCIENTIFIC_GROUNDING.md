# Scientific Grounding Contract

## Purpose

`hummbl-bibliography` is the empirical source layer for HUMMBL Scientific
Grounding. This repo does not validate product, theory, or doctrine claims on
its own. It provides the governed citation corpus and the derived exports that
downstream repos must reference.

## Source of Truth

- Canonical source records live in `bibliography/**/*.bib`.
- `dist/unified-bibliography.json` is the normalized full-corpus export.
- `dist/scientific-grounding-map.json` is the downstream interface export for
  claim hygiene, grounding references, and metadata debt review.

Do not treat generated JSON as the primary editing surface. Update the BibTeX
corpus first, then regenerate the exports.

## Downstream Contract

Downstream repos such as `hummbl-research`, `hummbl-theory`, and fleet tooling
should:

1. Cite bibliography keys, not duplicated full source records.
2. Import `dist/scientific-grounding-map.json` when they need structured tier,
   transformation, or metadata-gap data.
3. Use `dist/unified-bibliography.json` only when they need the full citation
   payload.
4. Mark unsupported claims as hypothesis, estimate, or gap rather than treating
   missing identifiers as validated proof.

## Evidence Tier Model

The Scientific Grounding export exposes two tier concepts:

- `bibliography_tier`: the HUMMBL thematic tier (`T1` through `T13`)
- `evidence_tier`: a downstream routing hint

Current routing hints:

- `foundational`: canonical, cognition, economics, complexity
- `empirical`: empirical, collaboration, security
- `applied`: applied, engineering
- `governance`: governance
- `emerging`: agentic, emerging, reasoning

This is not a validation verdict. It is a structured signal for downstream
claim-review and sourcing discipline.

## Metadata Debt

`dist/scientific-grounding-map.json` carries structured debt for:

- missing DOI fields on paper-like sources
- missing ISBN fields on book-like sources
- missing first-class arXiv identifiers when one is only implicit in current
  metadata

Debt is prioritized as `critical`, `high`, `medium`, or `low` based on:

- downstream grounding usage
- evidence-tier sensitivity
- source type
- transformation breadth

## Commands

Run from repo root after `cd toolkit && npm install && cd ..`:

```bash
npm run validate
npm run check-dups
npm run grounding:build
npm run grounding:check
npm test
```

## Scope Guard

This contract does not authorize:

- canon promotion in downstream repos
- theory or doctrine claims to be represented as empirically validated
- duplication of bibliography records across repos
- opportunistic rewriting of the bibliography corpus
