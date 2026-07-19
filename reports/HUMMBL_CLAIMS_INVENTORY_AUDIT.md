# HUMMBL Claims Inventory Audit — Phase -1A

**Date**: 2026-07-16
**Phase**: -1A (atomic claims inventory)
**Extracted by**: devin
**Registry**: `claims/hummbl_claims.v0.1.json`
**Schema**: `schemas/hummbl_claim.v0.1.schema.json`

---

## Summary

| Metric | Value |
|--------|-------|
| Total atomic claims extracted | 32 |
| Domains covered | 6 (BKI, BIO, BRO, CON, OPS, ARC) |
| Canonical source files read | 6 |
| Unresolved claims (flagged for Phase -1B) | 8 |
| Claims with high/critical risk flags | 6 |
| Bibliography keys inferred (unverified) | 11 |
| Validation status | Schema-conformant |

---

## Registry Counts

### By Domain

| Domain | Count | Description |
|--------|-------|-------------|
| BKI | 11 | Belonging as Knowledge Infrastructure |
| BIO | 3 | Biocognitive OS |
| BRO | 2 | Broccolilly Heuristic |
| CON | 4 | Constitutional Tiers |
| OPS | 10 | Operational Primitives |
| ARC | 2 | Architecture |

### By Evidence Tier

| Tier | Count |
|------|-------|
| theoretical | 9 |
| operational | 9 |
| constitutional | 4 |
| peer_reviewed | 3 |
| heuristic | 3 |
| unvalidated | 3 |
| aspirational | 1 |

---

## Unresolved Claims (8)

These claims have risks that require Phase -1B adjudication:

### 1. BKI-P1-HRSI-SIGNAL (HIGH)

**Claim**: HRSI baseline below threshold predicts compliance-theater outcomes.
**Risk**: This is a predictive claim that has not been empirically tested. The HRSI instrument itself is unvalidated. The prediction is theoretical, not demonstrated.
**Phase -1B action**: Determine whether any bibliography entry empirically tests HRSI against compliance-theater outcomes. If none, downgrade evidence tier from `theoretical` to `aspirational`.

### 2. BKI-P2-TRUST-ASYMMETRY (MEDIUM)

**Claim**: A correct claim from a low-trust source will be rejected; a flawed claim from a high-trust source will be accepted.
**Risk**: Stated as an absolute rather than a probabilistic tendency. No empirical evidence cited for this specific asymmetry.
**Phase -1B action**: Check whether the cited evidence base (Baumeister & Leary, Kahn, Mayer et al.) supports this specific asymmetry or only the broader relational validation proposition. If the former, qualify as "tends to"; if the latter, flag as unsupported.

### 3. BIO-SIX-MODES (HIGH)

**Claim**: There are six biocognitive modes (Sensory, Emotive, Cognitive, Somatic, Relational, Temporal).
**Risk**: The 6-mode taxonomy is a HUMMBL-internal design choice, not derived from established cognitive science literature. Self-referentially grounded.
**Phase -1B action**: Search bibliography for cognitive science literature that proposes a comparable mode taxonomy. If none, mark as `design_claim` rather than `theory`.

### 4. BIO-DIAGNOSTIC-INSTRUMENT (CRITICAL)

**Claim**: An 18-question diagnostic can identify dominant/suppressed modes and diagnose belonging gaps.
**Risk**: Explicitly marked as CONCEPT INSTRUMENT — not psychometrically validated. The claim that it "can identify" and "diagnose" is unvalidated.
**Phase -1B action**: Verify that no external materials represent this instrument as validated. Ensure the `unvalidated` evidence tier propagates to all downstream claims that depend on BIO-DIAGNOSTIC-INSTRUMENT.

### 5. OPS-HRSI-DIMENSIONS (HIGH)

**Claim**: HRSI has 3 dimensions scored 1-5; composite ≥4.0 is healthy, <2.0 is critical.
**Risk**: Threshold semantics are specified but not empirically calibrated against external outcomes.
**Phase -1B action**: Check whether the HRSI spec cites any validation studies for these specific thresholds. If not, mark thresholds as `design_claim`.

### 6. OPS-HRSI-OPERATOR-GATING (HIGH)

**Claim**: HRSI gates Base120 operator selection with specific threshold values (3.5, 2.5).
**Risk**: Threshold values and gating rules are design decisions, not empirically validated. Whether IN "requires high trust" is a theoretical inference.
**Phase -1B action**: Trace the derivation of the 3.5 and 2.5 thresholds. If they are arbitrary design choices, mark as `design_claim`. Check whether any bibliography entry supports the claim that inversion-type reasoning requires high trust.

### 7. ARC-STRUCTURAL-ADVANTAGE (HIGH)

**Claim**: HUMMBL can detect substrate failure before delivery by operationalizing all three primitives.
**Risk**: Stated as a current capability ("the system can detect") but depends on HRSI (unvalidated), operator gating (unvalidated), and partially-implemented receipt audit infrastructure. Conflates design intent with demonstrated capability.
**Phase -1B action**: Determine whether "detect substrate failure before delivery" has been demonstrated in any operational context. If not, downgrade from `aspirational` to `aspiration` and reframe as future capability.

### 8. CON-SUCCESSION-MODE (MEDIUM)

**Claim**: Succession-Mode is Constitutional Tier 5, requires pre-registration, overrides all other modes.
**Risk**: Status is `approved` not `canonical` — lower authority tier than the other three constitutional claims. Requires pre-registration to be operational.
**Phase -1B action**: Verify whether pre-registration has been completed. If not, note that the claim is constitutional in design but not yet operational.

---

## Highest-Risk Claims

### Critical risk

- **BIO-DIAGNOSTIC-INSTRUMENT**: The 18-question diagnostic is unvalidated. Any external material that represents it as validated is a truth-mode violation. This is the single highest-risk claim in the registry because it is the most likely to be overstated in sales/marketing contexts.

### High risk

- **BKI-P1-HRSI-SIGNAL**: Predictive claim dependent on an unvalidated instrument.
- **BIO-SIX-MODES**: Self-referentially grounded taxonomy.
- **OPS-HRSI-DIMENSIONS**: Uncalibrated thresholds presented as operational protocol.
- **OPS-HRSI-OPERATOR-GATING**: Uncalibrated gating thresholds with theoretical inference presented as protocol.
- **ARC-STRUCTURAL-ADVANTAGE**: Design intent presented as current capability.

---

## Contradictions and Tensions

### Tension 1: HRSI as operational protocol vs. HRSI as unvalidated

**OPS-HRSI-DIMENSIONS** and **OPS-HRSI-OPERATOR-GATING** are classified as `operational` (implemented protocol with running code). **BIO-VALIDATION-STATUS** explicitly states the Biocognitive OS instrument is `unvalidated`. HRSI and the Biocognitive OS are different instruments, but both derive from BKI theory and both lack external validation. The tension: HRSI is treated as operational (because it has a running implementation) while the Biocognitive OS is treated as unvalidated (because it honestly discloses its status). This is not a formal contradiction but an asymmetry in epistemic honesty.

**Phase -1B action**: Consider whether HRSI's evidence tier should be downgraded to match the Biocognitive OS, given that neither has been externally validated.

### Tension 2: "HUMMBL's strongest claim" vs. evidence base

**OPS-WM-DISTINCTION** quotes the source calling "a governed mental-model layer for reasoning over partial world models" HUMMBL's "strongest claim." If this is the strongest claim, its evidence base should be the most robust. But the claim is a `design_claim` — it describes what HUMMBL is designed to be, not what it has been demonstrated to be. The "strongest claim" framing may invite overstatement.

**Phase -1B action**: Verify whether the bibliography contains entries that support the feasibility of a "governed mental-model layer over partial world models" as a concept, separate from HUMMBL's specific implementation.

### Tension 3: Aspirational vs. operational framing

**ARC-STRUCTURAL-ADVANTAGE** is classified as `aspirational` but the source states it as a present-tense capability ("the system can detect"). The claim_nature is `aspiration` but the source_quote uses operational language. This is a framing tension — the source does not hedge the claim.

**Phase -1B action**: Recommend that the source (THEORY_MASTER.md) be updated to hedge this claim explicitly, or that evidence of the detection capability be provided.

---

## Source Coverage

| Source file | Claims extracted | Status |
|-------------|-----------------|--------|
| `PROJECTS/PSI/playground/hummbl-bki/theory/THEORY_MASTER.md` | 11 | Read in full (132 lines) |
| `PROJECTS/PSI/playground/hummbl-bki/theory/HRSI.md` | 2 | Read in full (162 lines) |
| `.agents/rules/hummbl-primitives.md` | 7 | Read in full (116 lines) |
| `.agents/skills/biocognitive-assessment/SKILL.md` | 3 | Read in full (274 lines) |
| `.agents/skills/{truth,survival,operator,succession}-mode/SKILL.md` | 4 | Read via subagent |
| `.agents/rules/bus-protocol.md` + `PROJECTS/founder-mode/AGENTS.md` | 5 | Read via subagent + direct |

### Sources NOT read (potential additional claims)

- `PROJECTS/PSI/playground/hummbl-bki/publications/BKI_GOVERNANCE_DRAFT.md` — full academic paper with citations
- `PROJECTS/PSI/playground/hummbl-bki/publications/BKI_REVIEW.md` — peer review
- `PROJECTS/PSI/playground/hummbl-bki/evidence/bki_evidence_log.md` — evidence log
- `PROJECTS/PSI/playground/hummbl-bki/evidence/BKI_EVIDENCE_FLYWHEEL_2026-05-08.md` — evidence flywheel
- ARCANA canonical sources (Habermas, Bourdieu, Bateson lenses)
- `founder_mode/services/cogstate.py` — cognitive states implementation
- `founder_mode/docs/design/krineia/` — Krineia public spec

**Estimate**: These sources likely contain 10-20 additional atomic claims. The 32-claim seed may undercount the total by 30-60%.

---

## Bibliography Key Inference

11 bibliography keys were inferred from author+year citations in the source material:

| Claim | Inferred keys |
|-------|--------------|
| BKI-P1-COGNITIVE-SCAFFOLDING | ledoux1996, ledoux2015, arnsten1998, sapolsky2017, edmondson1999, edmondson2019 |
| BKI-P2-RELATIONAL-VALIDATION | baumeister1995, kahn1990, mayer1995 |
| BKI-P3-EMBODIED-KNOWING | lave1991, wenger1998, argyris1978 |
| BKI-P4-SYMBOLIC-SYSTEMS | vygotsky1978, mezirow2000 |

**WARNING**: These keys are inferred from author+year patterns. They have NOT been verified against actual `.bib` entries in the bibliography. Some may not exist, may have different keys, or may be in different tiers. Phase -1B must verify each key against `bibliography/*.bib` files.

---

## Validation Receipt

```
Registry: claims/hummbl_claims.v0.1.json
Schema: schemas/hummbl_claim.v0.1.schema.json
Validation: PASSED (ajv 2020-12, strict:false, ajv-formats)
Claims: 32
Domains: 6
Evidence tiers: 7
Unresolved: 8
Generated counts match: YES (all sums verified against actual array contents)
  total_claims: 32 == actual array length: 32
  by_domain sum: 32 == actual: 32
  by_evidence_tier sum: 32 == actual: 32
  unresolved_count: 8 == actual: 8
  All per-domain counts match
  All per-evidence-tier counts match

SHA-256 hashes:
  schemas/hummbl_claim.v0.1.schema.json: 45C89F4A485E0600003D55ECB8AEFCA596BD62C79B0BAD2B5FC95F11ECB01CE5
  claims/hummbl_claims.v0.1.json:         3465BFA4BD3C6158DA86AB5F6AA961166E704D6D45C752F2B70057189FBF4887
  docs/HUMMBL_CLAIMS_REGISTRY_METHOD.md:  CD3F6208E6A197DBD05501D35244AAA5FEC3B835E12F97AE4C02E86EB05365ED
  reports/HUMMBL_CLAIMS_INVENTORY_AUDIT.md: 63870373E0DC8F533F942AF2980B1207E8ECF084259A9243BD90E775D0EE3693
```

---

## Phase -1B Recommendation

Phase -1B should:

1. **Verify bibliography keys**: Check all 11 inferred keys against actual `.bib` entries. Report mismatches.
2. **Map claims to bibliography**: For each of the 32 claims, identify which bibliography entries support, contradict, or contextualize it.
3. **Extract additional claims**: Read the 7 sources NOT read in Phase -1A. Estimate 10-20 additional claims.
4. **Adjudicate unresolved claims**: Resolve the 8 unresolved claims listed above.
5. **Detect contradictions systematically**: The 3 tensions noted here are preliminary; a systematic pass may find more.
6. **Calibrate evidence tiers**: Consider whether HRSI-based claims should be downgraded given the asymmetry with BIO-VALIDATION-STATUS.
7. **Produce claim-to-source-to-bibliography triad map**: The final deliverable should be a machine-readable mapping that connects each claim to its canonical source and its supporting bibliography entries.
