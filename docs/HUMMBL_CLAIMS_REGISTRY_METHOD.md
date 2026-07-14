# HUMMBL Claims Registry Method v0.1

**Status**: candidate
**Date**: 2026-07-16
**Phase**: -1A (atomic claims inventory)
**Extracted by**: devin

---

## Purpose

The HUMMBL Claims Registry is an inventory of the smallest units of propositional content that HUMMBL makes — atomic claims that can be independently sourced, evaluated, and cited against the bibliography.

This registry exists to answer one question: **what does HUMMBL actually claim, and what is the evidence status of each claim?**

It is the prerequisite for Phase -1B (bibliography-to-claim mapping), which will determine which bibliography entries support, contradict, or contextualize each claim.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Schema | `schemas/hummbl_claim.v0.1.schema.json` |
| Registry data | `claims/hummbl_claims.v0.1.json` |
| Method (this file) | `docs/HUMMBL_CLAIMS_REGISTRY_METHOD.md` |
| Audit report | `reports/HUMMBL_CLAIMS_INVENTORY_AUDIT.md` |

---

## Extraction Method

### 1. Source Identification

Claims were extracted from canonical HUMMBL source files, identified by the following procedure:

1. **BKI theory**: Read `PROJECTS/PSI/playground/hummbl-bki/theory/THEORY_MASTER.md` (v1.0, canonical) and `theory/HRSI.md` (v1.0, specification).
2. **Operational primitives**: Read `.agents/rules/hummbl-primitives.md` (canonical rule, always-present context).
3. **Biocognitive OS**: Read `.agents/skills/biocognitive-assessment/SKILL.md` (v1.0.0, concept instrument).
4. **Constitutional tiers**: Read `.agents/skills/truth-mode/SKILL.md`, `survival-mode/SKILL.md`, `operator-mode/SKILL.md`, `succession-mode/SKILL.md`.
5. **Operational protocols**: Read `.agents/rules/bus-protocol.md` and `PROJECTS/founder-mode/AGENTS.md`.
6. **Kill switch / circuit breaker**: Read `.agents/skills/kill-switch/SKILL.md` and `PROJECTS/founder-mode/AGENTS.md`.

A subagent was dispatched to search `PROJECTS/` and `.agents/` for Biocognitive OS, Constitutional, and Operational claim sources. The subagent confirmed canonical file paths, status, and claim nature for each component.

### 2. Atomization

Each claim was reduced to the smallest unit that can be independently evaluated:

- **One claim = one testable proposition.** If a source paragraph contains three distinct assertions, it produces three claims.
- **Implications are separate claims.** "Belonging is a precondition" (BKI-CORE) and "training into threat-states produces compliance theater" (BKI-P1-COMPLIANCE-THEATER) are separate claims because they can be independently evaluated.
- **Operational signals are separate claims.** "HRSI predicts compliance theater" (BKI-P1-HRSI-SIGNAL) is separate from the proposition it derives from.
- **Status disclosures are claims.** "The Biocognitive OS is unvalidated" (BIO-VALIDATION-STATUS) is a claim about the system's own epistemic state.

### 3. Domain Classification

Each claim was assigned to one of 6 domains:

| Code | Domain | Description |
|------|--------|-------------|
| BKI | Belonging as Knowledge Infrastructure | The belonging-as-precondition thesis, four propositions, convergence |
| BIO | Biocognitive OS | 6 modes, 18-question diagnostic, validation status |
| BRO | Broccolilly Heuristic | S×T×C×D→R, failure diagnosis, factor retirement |
| CON | Constitutional Tiers | Truth, Survival, Operator, Succession modes |
| OPS | Operational Primitives | Base120, Krineia, HRSI, bus, kill switch, circuit breaker, TUPLES |
| ARC | Architecture | How layers connect, structural advantage |

### 4. Evidence Tier Assignment

Each claim was assigned an evidence tier based on how it is stated in the source:

| Tier | Meaning |
|------|---------|
| `constitutional` | Stated as a non-overridable constitutional invariant |
| `theoretical` | Stated as a theoretical claim with a cited evidence base |
| `peer_reviewed` | Grounded in peer-reviewed literature cited by the source |
| `heuristic` | Stated as a conceptual framework, not a quantitative model |
| `operational` | Stated as an established operational protocol with a running implementation |
| `unvalidated` | Stated as a concept instrument that has not been validated |
| `aspirational` | Stated as a goal or intended future state |
| `established` | Stated as an established fact with broad external consensus |

### 5. Claim Nature Assignment

Each claim was assigned a `claim_nature` describing how it is framed in the source:

- `established_fact` — stated as fact
- `theory` — stated as theoretical proposition
- `heuristic` — stated as conceptual framework
- `aspiration` — stated as goal or future state
- `constitutional_invariant` — stated as non-overridable constraint
- `operational_protocol` — stated as implemented protocol
- `concept_instrument` — stated as unvalidated diagnostic tool
- `design_claim` — stated as architectural design decision

### 6. Risk Flagging

Claims were flagged with risks when:
- The source states an absolute where a probabilistic claim is warranted
- The claim conflates design intent with demonstrated capability
- The claim depends on an unvalidated instrument
- The claim is self-referentially grounded (designed from its own theory)
- Threshold values are uncalibrated

Claims with risks are marked `unresolved: true` for Phase -1B adjudication.

---

## Scope and Limitations

### What this registry IS

- An inventory of atomic claims extracted from canonical HUMMBL source files
- A snapshot of evidence status as stated by the sources themselves
- A flagging mechanism for claims that require further validation

### What this registry IS NOT

- **Not a validation of the claims.** Evidence tier reflects how the source frames the claim, not whether the claim is true.
- **Not a complete inventory.** 32 claims were extracted from 6 source files. HUMMBL has additional source files (BKI_GOVERNANCE_DRAFT.md, BKI_REVIEW.md, evidence logs, ARCANA docs) that may contain additional claims. The registry is a seed, not a census.
- **Not a bibliography mapping.** Phase -1B will map claims to bibliography entries. Bibliography keys in this registry are inferred from author+year and require verification.
- **Not a contradiction analysis.** Contradictions between claims are noted where obvious, but systematic contradiction detection is a Phase -1B task.

### Known gaps

1. **ARCANA claims not extracted.** ARCANA agents (Habermas, Bourdieu, Bateson, etc.) make claims about governance, communicative rationality, habitus/field, and double-binds. These are BKI-adjacent but have their own canonical sources that were not read in this phase.
2. **Cognitive states not extracted.** The cogstate system (AVAILABLE, RECOVERY, HYPERFOCUS, TRANSITION) has implementation in `founder_mode/services/cogstate.py` but no canonical doctrine document was found.
3. **RSI/compounding claims not extracted.** No canonical source was found for "recursive self-improvement" or "compounding" as formalized HUMMBL framework claims.
4. **Trust hierarchy not extracted.** Per-agent trust levels exist in guardrails files but no unified "trust hierarchy" doctrine document was found.
5. **Swarm/mesh claims not extracted.** The agent mesh analysis is a candidate document, not canonical doctrine.

---

## Validation

```bash
# Validate the claims registry against its schema
node -e "
const fs = require('fs');
const Ajv = require('ajv/dist/2020');
const schema = JSON.parse(fs.readFileSync('schemas/hummbl_claim.v0.1.schema.json', 'utf8'));
const data = JSON.parse(fs.readFileSync('claims/hummbl_claims.v0.1.json', 'utf8'));
const ajv = new Ajv({strict: false});
const validate = ajv.compile(schema);
const valid = validate(data);
if (valid) {
  console.log('VALID: claims/hummbl_claims.v0.1.json conforms to schemas/hummbl_claim.v0.1.schema.json');
  console.log('Claims:', data.generated_counts.total_claims);
  console.log('Domains:', Object.keys(data.generated_counts.by_domain).length);
  console.log('Unresolved:', data.generated_counts.unresolved_count);
} else {
  console.error('INVALID:', JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
"
```

---

## Next Phase

**Phase -1B** will:
1. Map each claim to bibliography entries (BibTeX citation keys) that support, contradict, or contextualize it
2. Verify the inferred bibliography keys against actual `.bib` entries
3. Identify claims with no bibliography support (orphan claims)
4. Identify bibliography entries that support no claim (orphan sources)
5. Systematically detect contradictions between claims
6. Adjudicate unresolved claims
7. Recommend claims for promotion, demotion, or retirement
