# Scientific Grounding Receipt

## Purpose

This receipt closes the fleet-facing evidence-contract layer for
`hummbl-bibliography`. It explains what downstream repos can import, what they
must cite, and what metadata debt remains before stronger claims should be made.

## Contract Artifacts

| Artifact | Role | Editing rule |
| --- | --- | --- |
| `SCIENTIFIC_GROUNDING.md` | Human-readable contract | Keep policy and downstream rules here |
| `bibliography/**/*.bib` | Source-of-truth citation corpus | Edit these first |
| `dist/unified-bibliography.json` | Normalized full corpus export | Generated; do not hand edit |
| `dist/scientific-grounding-map.json` | Downstream evidence interface | Generated; do not hand edit |

## Current Map Summary

The current `dist/scientific-grounding-map.json` reports:

| Metric | Value |
| --- | ---: |
| Total sources | 260 |
| Thematic tiers | 13 tiers, 20 sources each |
| Foundational sources | 80 |
| Empirical sources | 60 |
| Applied sources | 40 |
| Governance sources | 20 |
| Emerging sources | 60 |
| BKI evidence downstream refs | 17 |
| Arcana citation downstream refs | 39 |

Metadata-debt priority counts:

| Priority | Count |
| --- | ---: |
| Critical | 4 |
| High | 7 |
| Medium | 25 |
| Low | 38 |

## Critical Metadata Debt

These rows are exported from the generated map and should be resolved first
when enrichment work resumes:

| Priority | Field | Key | Tier | Evidence tier | Downstream refs | Title |
| --- | --- | --- | --- | --- | ---: | --- |
| critical | ISBN | `Ashby1956Cybernetics` | T12 | foundational | 3 | An Introduction to Cybernetics |
| critical | DOI | `EUAIAct2024` | T6 | governance | 4 | Regulation (EU) 2024/1689 Laying Down Harmonised Rules on Artificial Intelligence (AI Act) |
| critical | DOI | `GDPR2016` | T6 | governance | 1 | Regulation (EU) 2016/679 - General Data Protection Regulation |
| critical | DOI | `Sculley2015TechDebt` | T6 | governance | 2 | Hidden Technical Debt in Machine Learning Systems |

## High Metadata Debt

| Priority | Field | Key | Tier | Evidence tier | Downstream refs | Title |
| --- | --- | --- | --- | --- | ---: | --- |
| high | DOI | `Guo2024Threats` | T11 | empirical | 0 | Threats, Attacks, and Defenses in Machine Unlearning: A Survey |
| high | DOI | `Klein1993Recognition` | T2 | empirical | 0 | A Recognition-Primed Decision (RPD) Model of Rapid Decision Making |
| high | DOI | `MITRE2024ATLAS` | T11 | empirical | 0 | ATLAS: Adversarial Threat Landscape for AI Systems |
| high | DOI | `Ohrimenko2016SecureEnclaves` | T11 | empirical | 0 | Oblivious Multi-Party Machine Learning on Trusted Processors |
| high | DOI | `OWASP2025LLM` | T6 | governance | 0 | OWASP Top 10 for Large Language Model Applications 2025 |
| high | DOI | `Rao1995BDI` | T5 | applied | 0 | BDI Agents: From Theory to Practice |
| high | DOI | `SLSA2023SupplyChain` | T11 | empirical | 0 | SLSA: Supply-chain Levels for Software Artifacts |

## Downstream Citation Rules

Downstream repos should:

1. Cite bibliography keys such as `Meadows2008ThinkingSystems`, not duplicated
   full BibTeX records.
2. Link to this repo and the source key when a claim needs external grounding.
3. Use `dist/scientific-grounding-map.json` for evidence tier, transformation,
   source-status, and metadata-debt routing.
4. Treat `evidence_tier` as a review-routing hint, not a validation verdict.
5. Mark unsupported claims as `hypothesis`, `estimate`, or `gap` until a source
   key or local validation artifact exists.

`hummbl-research` should use this repo for conceptual grounding only. Local
operator scores remain local validation artifacts in `hummbl-research`; this
bibliography does not convert those scores into external proof.

## Validation Receipt

Run from the repo root:

```bash
npm run validate
npm run check-dups
npm run grounding:build
npm run grounding:check
npm test
```

The grounding map is current when `npm run grounding:check` exits cleanly.

## Scope Guard

This receipt does not:

- promote sources into HUMMBL canon;
- certify downstream claims;
- duplicate source records into downstream repos;
- authorize opportunistic bibliography rewrites.
