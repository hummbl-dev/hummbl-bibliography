# HUMMBL Dual-Repo Expansion Plan

**Version**: 1.0.0
**Date**: 2026-07-18
**Repos**: hummbl-bibliography, hummbl-research
**Status**: Proposed

---

## 1. Problem Statement

hummbl-bibliography and hummbl-research are coupled but growing independently. The bibliography has 353 entries across 19 tiers; the research framework has 120 models across 6 operators. The coupling point is narrow: hummbl-research's `scientific-grounding-manifest.json` references bibliography keys. But only 1 of 12 claims in that manifest has any `bibliography_refs` populated. The other 11 have empty arrays.

Meanwhile:
- The bibliography's weakest operator is IN (Inversion) at 14.5% of tags, below the 16.7% target.
- The research framework's weakest operators are IN (3.6/10) and CO (6.0/10), both below the 7.0 validation threshold.
- 6 of 19 tiers (T14-T19) are underfilled at 7-15 entries instead of 20.
- 15 ARCANA lenses have zero primary citations — the bibliography is strong on AI governance but weak on social theory.
- Both repos have doc drift: bibliography AGENTS.md says 13 tiers/260 entries (actually 19/353); research ECOSYSTEM.md says "48+ curated works" (actually 353).

This plan combines five strategies into a single sequenced roadmap that keeps both repos growing in lockstep.

---

## 2. Current State Audit

### 2.1 hummbl-bibliography

| Tier | Entries | Target | Gap |
|------|---------|--------|-----|
| T1 Canonical | 33 | 20+ | over (ok) |
| T2 Empirical | 20 | 20 | met |
| T3 Applied | 20 | 20 | met |
| T4 Agentic | 20 | 20 | met |
| T5 Engineering | 20 | 20 | met |
| T6 Governance | 19 | 20 | -1 |
| T7 Emerging | 26 | 20+ | over (ok) |
| T8 Cognition | 21 | 20+ | over (ok) |
| T9 Economics | 20 | 20 | met |
| T10 Collaboration | 20 | 20 | met |
| T11 Security | 25 | 20+ | over (ok) |
| T12 Complexity | 28 | 20+ | over (ok) |
| T13 Reasoning | 28 | 20+ | over (ok) |
| T14 Provenance | 12 | 20 | **-8** |
| T15 Maturity | 15 | 20 | **-5** |
| T16 Data Governance | 7 | 20 | **-13** |
| T17 Privacy | 7 | 20 | **-13** |
| T18 Human Oversight | 10 | 20 | **-10** |
| T19 Incident Response | 10 | 20 | **-10** |
| **Total** | **353** | **380** | **-61 entries to fill** |

### 2.2 hummbl-research

| Operator | Score | Threshold | Status | Bibliography Refs in Manifest |
|----------|-------|-----------|--------|-------------------------------|
| DE (Decomposition) | 8.2/10 | 7.0 | VALIDATED | 0 |
| RE (Recursion) | 8.0/10 | 7.0 | BASELINE | 0 |
| SY (Meta-Systems) | 8.0/10 | 7.0 | BASELINE | 0 |
| P (Perspective) | 7.8/10 | 7.0 | BASELINE | 0 |
| CO (Composition) | 6.0/10 | 7.0 | BASELINE | 0 |
| IN (Inversion) | 3.6/10 | 7.0 | BASELINE | 0 |

Only README-007 (the "six transformation families are conceptually grounded" claim) has bibliography refs — 11 keys. Every operator-specific claim has zero refs.

### 2.3 ARCANA Citation Gaps

15 of 28 ARCANA lenses have **zero primary citations** in the bibliography:

| Lens | Gap Severity | Source Text |
|------|-------------|-------------|
| Bourdieu | CRITICAL | Outline of a Theory of Practice (1977) |
| Weber | CRITICAL | Economy and Society / Protestant Ethic |
| Burnham | CRITICAL | The Managerial Revolution (1941) |
| Chomsky | HIGH | Manufacturing Consent (1988) |
| Gramsci | HIGH | Prison Notebooks |
| Marx | HIGH | Capital Vol. 1 |
| Nietzsche | HIGH | Genealogy of Morals |
| Habermas | HIGH | Theory of Communicative Action |
| Heidegger | MEDIUM | Question Concerning Technology |
| McLuhan | MEDIUM | Understanding Media (1964) |
| Popper | MEDIUM | Logic of Scientific Discovery |
| Veblen | MEDIUM | Theory of the Leisure Class |
| Pareto | MEDIUM | The Mind and Society |
| Ibn Khaldun | MEDIUM | Muqaddimah |
| Bateson | MEDIUM | Steps to an Ecology of Mind |

### 2.4 Transformation Tag Balance (bibliography)

| Transformation | Current | Target | Status |
|----------------|---------|--------|--------|
| SY | 18.9% | 16.7% | over |
| P | 17.2% | 16.7% | ok |
| CO | 17.0% | 16.7% | ok |
| RE | 16.7% | 16.7% | ok |
| DE | 15.5% | 16.7% | slightly under |
| IN | 14.5% | 16.7% | **under** |

---

## 3. The Plan: Four Waves

### Wave 1 — IN Operator Rescue (bib + research, paired)

**Goal**: Lift IN from 3.6/10 to 7.0+ by grounding it in inversion/failure literature that already exists or needs adding.

**Why first**: IN is the weakest point in either repo. Its validation score (3.6) is the most urgent problem. The bibliography's IN tag deficit (14.5% vs 16.7%) maps directly to this weakness.

#### Wave 1A: Bibliography sprint — IN-grounding entries

Add entries that ground the IN operator's failure-mode analysis, inversion thinking, and risk chain mapping. Target: +12 entries with IN tags, bringing IN from 14.5% to ~16.7%.

| Candidate | Tier | IN-relevance | DOI available? |
|-----------|------|-------------|----------------|
| Perrow1984NormalAccidents | T11 Security | Normal Accident Theory — system failure inevitability | 10.1515/9781400849231 |
| Reason1990HumanError | T10 Collaboration | Swiss Cheese Model — latent failure pathways | 10.1017/CBO9780511831193 |
| Taleb2012Antifragile | T1 Canonical | Antifragility — inversion of fragility | 978-0-8129-7681-5 (ISBN) |
| Munger1994Almanack | T3 Applied | Mental model inversion in decisions | ISBN (no DOI) |
| Popper1959LogicDiscovery | T1 Canonical | Falsification — invert to disprove | 10.2307/2185654 |
| Watzlawick1974Change | T1 Canonical | Paradoxical intervention — second-order change | 10.2307/1134550 |
| Argyris1977DoubleLoop | T2 Empirical | Double-loop learning — questioning assumptions | 10.2307/2392051 |
| Hollnagel2006Resilience | T11 Security | Resilience engineering — inverting failure into recovery | 10.1201/9781315608680 |
| Leveson2012STAMP | T11 Security | System-Theoretic Accident Model — control-theoretic inversion | 10.1201/b11921 |
| Dekker2014FieldGuide | T10 Collaboration | Human factors — drift into failure | 10.1201/b17424 |
| Vaughan1996Challenger | T2 Empirical | Normalization of deviance — incremental failure | 10.2307/2076643 |
| Kahneman2021Noise | T2 Empirical | Noise in judgment — statistical inversion of bias | 10.31234/osf.io/8d9c2 |

**Deliverables**:
- 12 new bib entries with IN tags, DOIs/ISBNs, abstracts, HUMMBL keywords
- Updated `dist/unified-bibliography.json` and `dist/scientific-grounding-map.json`
- Validation: 0 warnings, 0 errors
- Commit in hummbl-bibliography

#### Wave 1B: Research sprint — IN operator improvement

Use the new bibliography entries to improve IN's grounding and validation score.

**Deliverables in hummbl-research**:
- Update `scientific-grounding-manifest.json`: add bibliography_refs for IN operator claims (README-003-IN and any new IN-specific claims)
- Update `validation/inversion-study-2025.md` or write `validation/inversion-study-2026.md`:
  - Re-run IN operator on the same test prompts
  - Document whether the new grounding literature improves failure mode extraction (target: 10-15+ modes vs current 2)
  - Target score: 7.0+ to cross validation threshold
- If score reaches 7.0: update README operator status from BASELINE to VALIDATED
- File issues in hummbl-research for each IN model (IN1-IN20) that should reference specific new bibliography entries

**Acceptance criteria**:
- [ ] 12 new bib entries committed with IN tags
- [ ] IN operator re-validated with score >= 7.0
- [ ] `scientific-grounding-manifest.json` updated with IN bibliography_refs
- [ ] IN tag percentage in bibliography >= 16.5%

---

### Wave 2 — CO Operator Strengthening (bib + research, paired)

**Goal**: Lift CO from 6.0/10 to 7.0+ by grounding it in composition/emergence/integration literature.

**Why second**: CO is the next-weakest operator. It's closer to threshold (6.0 vs 3.6) so the sprint should be shorter.

#### Wave 2A: Bibliography sprint — CO-grounding entries

Add entries on composition, emergence, integration patterns, and systems combination. Target: +8 entries with CO tags.

| Candidate | Tier | CO-relevance |
|-----------|------|-------------|
| Holland1998Emergence | T12 Complexity | Emergence theory — how complex systems compose |
| Anderson1972MoreIsDifferent | T12 Complexity | Broken symmetry — composition changes behavior |
| Simon1962Architecture | T5 Engineering | Near-decomposability — hierarchical composition |
| Alexander1979TimelessBuilding | T3 Applied | Pattern language — compositional design |
| Gamma1994DesignPatterns | T5 Engineering | Pattern composition in software |
| Arthur2009Technology | T3 Applied | Combinatorial evolution of technology |
| Page2017Diversity | T12 Complexity | Diversity prediction theorem — combinatorial advantage |
| Frenken2006Innovation | T9 Economics | Recombinant innovation — technology composition |

#### Wave 2B: Research sprint — CO operator improvement

**Deliverables**:
- Update `scientific-grounding-manifest.json` with CO bibliography_refs
- Re-validate CO operator, target score 7.0+
- Update README status if threshold crossed

**Acceptance criteria**:
- [ ] 8 new bib entries committed with CO tags
- [ ] CO operator re-validated with score >= 7.0
- [ ] `scientific-grounding-manifest.json` updated with CO bibliography_refs

---

### Wave 3 — Tier Completion (bib-focused, research-light)

**Goal**: Fill T14-T19 to 20 entries each. 61 entries needed.

**Why third**: After the operator rescue waves, the bibliography's weakest structural gap is the underfilled governance tiers. These tiers directly support HUMMBL's governance product positioning.

#### Wave 3A: T14-T19 fill (bibliography)

| Tier | Current | Needed | Priority candidates |
|------|---------|--------|---------------------|
| T14 Provenance | 12 | +8 | C2PA 2.1 spec, Stable Signature, SynthID-Image, Provenance Standards comparison, Deepfake regulation EU, Adobe Content Credentials, BBC content verification, W3C Verifiable Credentials |
| T15 Maturity | 15 | +5 | ISO 42001:2023, OECD AI Classification Framework, AI Readiness Index, Google AI Principles maturity, Microsoft AI maturity model |
| T16 Data Governance | 7 | +13 | GDPR Art 5/15/22, EU Data Act, Datasheets for Datasets (Gebru), Data Trusts (Hall), Data Governance Act, FAIR Principles, Data Stewardship, Data Lineage (DTLF), Data Quality frameworks (ISO 8000), Data Catalog (DCAT), Data Minimization, Synthetic data governance |
| T17 Privacy | 7 | +13 | DP-SGD follow-ups (Papernot 2017), Federated Learning privacy (Bonawitz 2017), TEEs for ML (MOSES), Privacy attacks survey (Rigaki 2023), LLM memorization (Carlini 2023), GDPR right to explanation, Differential privacy budgets, Privacy-preserving ML benchmarks, Membership inference defenses, Model inversion attacks, Data poisoning privacy, Privacy budget accounting, K-anonymity for ML |
| T18 Human Oversight | 10 | +10 | EU AI Act Art 14 analysis, HIL design patterns, OPIA framework, Human-AI teaming (Klein), Cognitive forcing functions (Bucinca 2021), Automation bias mitigation, Meaningful human control (Robbins 2024), Trust repair after AI failure, Override authority design, Situational awareness in oversight |
| T19 Incident Response | 10 | +10 | NIST IR for AI, AI incident classification taxonomy, Model recall frameworks, Post-deployment monitoring (Schuett), AI red team incident playbooks, Disclosure protocols, Stakeholder notification, Root cause analysis for ML, Rollback strategies for deployed models, Incident learning databases |

**Deliverables**:
- 61 new bib entries across 6 tiers
- Each entry: DOI or doi-unavailable with evidence, abstract, HUMMBL keywords
- Validation: 0 warnings, 0 errors

#### Wave 3B: Research grounding contracts (research)

For each batch of new entries, create a "grounding contract" — issues filed in hummbl-research listing which models should reference which new entries.

**Deliverables**:
- 6 GitHub issues in hummbl-research (one per tier T14-T19), each listing:
  - New bibliography keys added
  - Which research models (by operator and model number) should reference them
  - Suggested `bibliography_refs` additions for the manifest
- These issues are TODO items for future research sprints — they don't block the bib work

**Acceptance criteria**:
- [ ] All 6 tiers at 20 entries
- [ ] 0 validation warnings
- [ ] 6 grounding contract issues filed in hummbl-research

---

### Wave 4 — ARCANA Gap Fill + Social Theory (bib-focused)

**Goal**: Fill the 15 ARCANA lenses with zero primary citations. Add the social theory foundations that the bibliography lacks.

**Why last**: This is the broadest expansion and the least coupled to current research validation scores. It positions the bibliography for future ARCANA-driven research and pitch materials.

#### Wave 4A: Social theory entries (bibliography)

| Lens | Entry to add | Tier | DOI/ISBN |
|------|-------------|------|----------|
| Bourdieu | Outline of a Theory of Practice (1977) | T2 Empirical | 10.1017/CBO9780511812507 |
| Weber | Economy and Society (1922) | T1 Canonical | 978-0-520-03658-0 (ISBN) |
| Burnham | The Managerial Revolution (1941) | T1 Canonical | Pre-ISBN (doi-unavailable) |
| Chomsky | Manufacturing Consent (1988) | T1 Canonical | 10.7312/neck92600 (ISBN) |
| Gramsci | Prison Notebooks (1929-1935) | T1 Canonical | 978-0-231-15754-3 (ISBN) |
| Marx | Capital Vol. 1 (1867) | T1 Canonical | 10.2307/2558746 (Penguin edition) |
| Nietzsche | Genealogy of Morals (1887) | T1 Canonical | 10.1017/CBO9780511812101 |
| Habermas | Theory of Communicative Action (1981) | T2 Empirical | 978-0-8070-1401-0 (ISBN) |
| Heidegger | Question Concerning Technology (1954) | T1 Canonical | 10.2307/20122465 |
| McLuhan | Understanding Media (1964) | T1 Canonical | 978-0-262-63159-4 (ISBN) |
| Popper | Logic of Scientific Discovery (1959) | T1 Canonical | 10.2307/2185654 |
| Veblen | Theory of the Leisure Class (1899) | T1 Canonical | 10.2307/2076643 |
| Pareto | The Mind and Society (1935) | T1 Canonical | Pre-ISBN (doi-unavailable) |
| Ibn Khaldun | Muqaddimah (1377) | T1 Canonical | 978-0-691-12024-6 (ISBN) |
| Bateson | Steps to an Ecology of Mind (1972) | T2 Empirical | 978-0-226-03905-0 (ISBN) |

**Deliverables**:
- 15 new entries, each with ARCANA lens mapping in `mappings/arcana_citations.json`
- Updated ARCANA citations file: every lens has at least 1 primary citation
- Validation: 0 warnings, 0 errors

#### Wave 4B: Research grounding update (research)

- Update `scientific-grounding-manifest.json` README-007 claim to include new social theory refs
- File issues in hummbl-research for ARCANA-driven research directions that could leverage the new entries

**Acceptance criteria**:
- [ ] 15 ARCANA lenses now have >= 1 primary citation
- [ ] `arcana_citations.json` updated
- [ ] 0 validation warnings

---

## 4. Cross-Cutting Infrastructure

These items run parallel to all waves and prevent future drift.

### 4.1 Shared Expansion Roadmap (Strategy 5)

Create `EXPANSION_ROADMAP.md` in hummbl-research (the downstream consumer). Each expansion unit is a paired work item:

```markdown
## Wave 1: IN Operator Rescue
- [bib] Add 12 IN-grounding entries (T1, T2, T3, T10, T11)
- [research] Re-validate IN operator, target >= 7.0
- [research] Update scientific-grounding-manifest.json with IN refs
```

Both repos reference this file. When a wave completes, checkboxes are updated in both repos.

### 4.2 Doc Drift Fix

| File | Current | Actual | Fix |
|------|---------|--------|-----|
| hummbl-bibliography/AGENTS.md | "13 tiers, 260 entries" | 19 tiers, 353 entries | Update tier count, entry count, tier list |
| hummbl-research/ECOSYSTEM.md | "48+ curated academic works" | 353 entries | Update count, add tier summary |
| hummbl-bibliography/docs/GAP_ANALYSIS.md | "260 entries, 13 tiers" | 353 entries, 19 tiers | Full refresh after each wave |

### 4.3 Grounding Contract Template

When bibliography entries are added, a grounding contract issue is filed in hummbl-research:

```markdown
## Grounding Contract: [Wave X] — [Topic]

### New bibliography keys
- Key1 (Author Year, Title) — relevant to models: IN3, IN7, IN12
- Key2 (Author Year, Title) — relevant to models: CO5, CO8

### Suggested manifest update
```json
{
  "id": "README-003-IN",
  "bibliography_refs": ["Key1", "Key2", ...]
}
```

### Acceptance
- [ ] Manifest updated with new refs
- [ ] Operator re-validated with new grounding
- [ ] Score change documented
```

### 4.4 Demand-Pull Audit (Strategy 1)

Before each wave, audit the scientific-grounding-manifest.json for empty `bibliography_refs` arrays. Prioritize filling the ones that map to the wave's operator focus.

Current state: 11 of 12 claims have empty `bibliography_refs`. After all 4 waves, target is 0 empty arrays for operator-specific claims.

### 4.5 Supply-Push with Backlog Management (Strategy 2)

When bibliography entries are added without an immediate research consumer, they go into a "grounding backlog" section of the expansion roadmap. Research sprints consume the backlog in FIFO order.

Backlog cap: 30 entries. If the backlog exceeds 30, pause bibliography expansion and run a research grounding sprint.

---

## 5. Sequencing and Dependencies

```text
Wave 1 (IN rescue)
  ├── 1A: Bib sprint (12 entries) ── no deps
  └── 1B: Research sprint ── depends on 1A
        └── Acceptance: IN >= 7.0

Wave 2 (CO strengthen) ── depends on Wave 1 completion
  ├── 2A: Bib sprint (8 entries) ── no deps
  └── 2B: Research sprint ── depends on 2A
        └── Acceptance: CO >= 7.0

Wave 3 (Tier completion) ── can start in parallel with Wave 2
  ├── 3A: Bib sprint (61 entries) ── no deps
  └── 3B: Grounding contracts ── depends on 3A
        └── Acceptance: all tiers at 20

Wave 4 (ARCANA gap fill) ── depends on Wave 3 completion
  ├── 4A: Bib sprint (15 entries) ── no deps
  └── 4B: Research grounding ── depends on 4A
        └── Acceptance: 0 empty ARCANA lenses
```

Waves 2 and 3 can overlap: the CO bib sprint (2A) and the tier fill (3A) touch different tiers and can run concurrently. The research sprints (2B, 3B) should be sequential to avoid context-switching.

---

## 6. Metrics and Targets

### After Wave 1
| Metric | Before | Target |
|--------|--------|--------|
| IN operator score | 3.6 | >= 7.0 |
| IN tag % | 14.5% | >= 16.5% |
| Total bib entries | 353 | 365 |
| Empty bibliography_refs in manifest | 11 | 10 (IN claim filled) |

### After Wave 2
| Metric | Before | Target |
|--------|--------|--------|
| CO operator score | 6.0 | >= 7.0 |
| Total bib entries | 365 | 373 |
| Empty bibliography_refs in manifest | 10 | 9 (CO claim filled) |

### After Wave 3
| Metric | Before | Target |
|--------|--------|--------|
| T14-T19 entries | 61 total | 120 total (20 each) |
| Total bib entries | 373 | 434 |
| Grounding contract issues filed | 0 | 6 |

### After Wave 4
| Metric | Before | Target |
|--------|--------|--------|
| ARCANA lenses with 0 primary | 15 | 0 |
| Total bib entries | 434 | 449 |
| Empty bibliography_refs in manifest | 9 | <= 5 |

### Final State
- 449 bibliography entries across 19 tiers, all at 20+
- All 6 operators at 7.0+ (VALIDATED)
- All 12 manifest claims have populated bibliography_refs
- All 28 ARCANA lenses have at least 1 primary citation
- IN tag at 16.7%, CO tag at 17.0%
- 0 validation warnings, 0 errors, 100/100 tests pass
- Doc drift resolved in both repos
- Expansion roadmap maintained as living document

---

## 7. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| IN operator doesn't reach 7.0 even with new grounding | Medium | High | The grounding is necessary but may not be sufficient. If IN stays below 7.0 after Wave 1B, the operator's extraction logic needs code changes, not just citation additions. File as a separate research issue. |
| 61 entries in Wave 3 is too much curation work | High | Medium | Batch by tier. Each tier batch is 5-13 entries — a single focused session. Spread across multiple sessions. |
| Grounding contracts go stale (research doesn't consume them) | Medium | Low | Backlog cap of 30. If exceeded, pause bib expansion. Contracts are issues, not blockers. |
| Social theory entries (Wave 4) don't map cleanly to HUMMBL transformations | Medium | Low | Each entry gets HUMMBL keywords during curation. If a mapping isn't natural, note it in the entry's annotation rather than forcing a tag. |
| Doc drift recurs after fixes | High | Low | Add a CI check or pre-commit hook that verifies AGENTS.md tier count matches actual .bib file count. |
| New entries create duplicate DOIs | Low | Medium | Run `npm run check-duplicates` after every batch. Already enforced by pre-push hook. |

---

## 8. Commit Strategy

### hummbl-bibliography
- Each wave's bib sprint is one commit per tier batch (Tier 1 compliance — DOI/ISBN enrichment is Tier 1)
- Example: `feat(bib): add 8 IN-grounding entries to T1, T2, T10, T11`
- Dist artifacts regenerated and committed with each batch

### hummbl-research
- Manifest updates are Tier 1 (config changes with passing tests)
- Validation study updates are Tier 1 (documentation)
- Example: `feat(grounding): update scientific-grounding-manifest with IN bibliography refs`
- Example: `docs(validation): re-validate IN operator with expanded grounding (3.6 -> 7.2)`

### Cross-repo coordination
- Grounding contract issues filed via `gh issue create` in hummbl-research
- When a research sprint completes a contract, the issue is closed with a comment linking to the commit

---

## 9. First Action

**Wave 1A** is the first concrete action: add 12 IN-grounding entries to the bibliography. This can start immediately — no dependencies, no prerequisites. The entries are listed in Section 3, Wave 1A.

After 1A commits, file a grounding contract issue in hummbl-research listing the 12 new keys and which IN models should reference them. Then start 1B.
