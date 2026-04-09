# SITREP: HUMMBL Bibliography Repository

**Generated**: 2026-04-09
**Location**: `PROJECTS/hummbl-bibliography/`

---

## Current Status

### Repository Health
- **Validation**: 0 errors, 21 warnings (all warnings are missing DOIs/ISBNs)
- **Duplicates**: 0 (resolved 9 cross-tier duplicates in this audit)
- **Pre-commit Hooks**: Configured and active
- **CI/CD**: GitHub Actions workflow operational

### Corpus Metrics
- **Total Entries**: 240 (12 tiers x 20 entries)
- **DOI Coverage**: 155/240 (64.6%)
- **ISBN Coverage**: 72/240 (30%)
- **Abstract Coverage**: 240/240 (100%)
- **HUMMBL Keyword Coverage**: 240/240 (100%)

| Metric | Value |
|--------|-------|
| Total entries | **260** (20 × 13 tiers) |
| Tiers | 13 (T1–T13) |
| Entries with DOIs | ~142 (~55% overall) |
| T7 DOI coverage | **20/20 (100%)** |
| T13 DOI coverage | **13/20 (65%)** (arXiv papers) |
| T1 DOI coverage | 6/20 (30%) |
| T3 DOI coverage | 0/20 (all trade books; annotated) |
| T5 DOI coverage | 7/20 (35%) |
| Cross-tier duplicates | 0 (resolved Apr 2026) |
| Validation errors | 0 |
| Abstract coverage | 100% |
| HUMMBL keyword coverage | 100% |
| NIST AI RMF tags | 60 entries (T4/T6/T11) |
| EU AI Act article tags | 60 entries (T4/T6/T11) |
| ARCANA lenses mapped | 28/28 |
| BKI propositions mapped | 4/4 |

---

## Recent Changes (v1.3.0 — Apr 2026)

### ✅ T13: Post-2024 Reasoning Models (new tier, 20 entries)
`bibliography/T13_reasoning.bib` added. Covers o1/o3/o1-mini, DeepSeek-R1/R1-Zero,
test-time compute scaling, PRMs, STAR/Self-Refine/Self-Consistency, Tree of Thoughts,
RouteLLM, Claude/Gemini model cards, JudgeBench, AlphaCode 2. 13/20 entries have arXiv DOIs.

### ✅ NIST AI RMF + EU AI Act Crosswalk Tags
60 entries across T4/T6/T11 now carry `nist_functions` and `eu_ai_act_articles` fields.
Query: `node toolkit/src/query.js --nist-function GOVERN` returns 60 targeted entries.

### ✅ ARCANA Citation Map (28 lenses)
`mappings/arcana_citations.json` — all 28 ARCANA philosophical lenses mapped to bibliography
keys with `primary`, `secondary`, and `gaps` arrays. Critical gaps documented.

### ✅ BKI Evidence Audit
`mappings/bki_evidence.json` — 4 BKI propositions mapped with coverage grades.
Overall grade B-. Critical missing: `Edmondson1999PsychologicalSafety`.

### ✅ Open Brain Ingest Script
`scripts/ingest_to_open_brain.py` — stdlib-only; `--dry-run` (default) or `--post` to live.

### ✅ llms.txt Updated to 260 entries
AI-readable index regenerated to include T13; now 1,100+ lines.

### ✅ DOI Audit: All 240 pre-T13 Entries Complete
Full `% No DOI available` annotation pass across T1/T2/T4/T5/T6/T8/T9/T10/T11/T12.
4 verified DOIs added (CrossRef-confirmed). Overall DOI coverage: ~55%.

### Round 1: Critical Fixes
- Fixed 4 validation errors (malformed DOI, wrong entry type, 2 dup keys)
- Resolved 9 duplicate entries across tiers (5 unique conflicts)
- Fixed 2 wrong DOI assignments (Klein1993, Yao2023TreeOfThoughts)
- Fixed Patil2023Gorilla wrong arXiv URL
- Replaced 4 removed duplicates with new entries (Ngo2024, Bengio2024, Sumers2024, Zhuge2024)

### Round 2: Metadata Enrichment
- Added 10 arXiv DOIs to T7_emerging (now at 100% DOI coverage)
- Added 10 ISBNs to T8, T9, T12 book entries
- DOI coverage: 145 -> 155; ISBN coverage: 62 -> 72

### Round 3: Quality Improvement
- Expanded 5 shallow T3 abstracts from book-jacket to scholarly quality
- Rebalanced transformation tags: P +5, IN +2, SY -6

### Round 4: Tooling Fix
- Converted extract-keywords.js from CJS to ESM (was broken)
- All toolkit scripts now operational

### Round 5: Documentation
- Updated README.md (was referencing 48 entries / 3 tiers)
- Updated GAP_ANALYSIS.md (full rewrite from 48-entry analysis)
- Updated SITREP.md (this document)

---

## Toolkit Status

| Tier | Focus | Highlights |
|------|-------|------------|
| T1 | Canonical Foundations | Kahneman, Simon, Pearl, Norman, Miller, Kuhn with DOIs; 6 pre-2000 books annotated |
| T2 | Empirical Research | Academic journals; most should have DOIs — audit pending |
| T3 | Applied Practitioner | All 20 trade books annotated with `% No DOI available` |
| T4 | Governance & Ethics | AI policy, fairness, accountability literature |
| T5 | Engineering Patterns | 7 DOIs; blog posts (martinfowler.com, LinkedIn) need annotation |
| T6 | Philosophy of Mind | Phenomenology, embodied cognition, consciousness |
| T7 | Emerging AI Research | **100% DOI coverage**; all arXiv DOIs present; 3 bugs fixed |
| T8 | Cognition & Learning | Learning theory, memory, metacognition |
| T9 | Economics & Incentives | FrugalGPT (canonical home), scaling laws, market design |
| T10 | Collaboration & Teams | Team dynamics, organizational design, coordination |
| T11 | Security & Trust | Adversarial ML, threat modeling, trust systems |
| T12 | Complexity Science | Complex adaptive systems, emergence, network theory |
| T13 | Post-2024 Reasoning Models | o1/o3/R1-class, test-time compute, PRMs, self-improvement; 65% DOI coverage |

---

## Remaining Priorities

### 🔴 High Priority
1. ~~**T5 blog post annotations**~~ — ✅ Done (all 4 annotated: Kreps, Fowler, Young, Mahdavi)
2. ~~**DOI audit for T2, T4, T6, T8–T12**~~ — ✅ Done (v1.3.0)
3. ~~**T13 evaluation**~~ — ✅ Done (T13_reasoning.bib, 20 entries)
4. **Verify zero cross-tier duplicates** — run `npm run check-duplicates` after PR #27 merge

### 🟡 Medium Priority
1. **Bibliography gap fills** — add missing ARCANA critical entries (Weber, Bourdieu, Burnham, Chomsky, Gramsci) and BKI gap (Edmondson1999PsychologicalSafety)
2. **Watch mode** — `scripts/watch-bib.js` for hot-reload citation updates (issue #36)
3. **Citation graph** — D3.js/Mermaid visualization of citation relationships (issue #36)

### 🟢 Low Priority
1. Add `find-dois` script run to CI for T2 articles
2. T13 DOI completion — 7 technical reports/blog posts currently `% No DOI available`

---

**Prepared by**: Claude Opus 4.6  
**Status**: All systems operational  
**Next Action**: PR review by Codex
