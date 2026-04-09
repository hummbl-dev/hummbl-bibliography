# Changelog

All notable changes to the HUMMBL Bibliography will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-09

### Added

#### T13: Post-2024 Reasoning Models (new tier)
- `bibliography/T13_reasoning.bib` — 20 entries covering the o1/o3/R1-class reasoning model landscape
- Entries: `OpenAI2024o1SystemCard`, `OpenAI2025o3SystemCard`, `OpenAI2024o1Mini`, `OpenAI2024o1Tech`,
  `DeepSeek2025R1`, `Guo2025DeepSeekR1Zero`, `Snell2024ScalingTestTime`, `Kumar2024ScalingInference`,
  `Lightman2023PRM`, `Zelikman2022STAR`, `Madaan2023Selfrefine`, `Wang2023Selfconsistency`,
  `Guo2024Critique`, `Yao2024ToT2`, `Ong2024RouteLLM`, `Anthropic2024Claude3`,
  `Anthropic2025ClaudeModel`, `Gemini2024Team`, `Zheng2024JudgeBench`, `Chen2024AlphaCode2`
- 13/20 entries have arXiv DOIs (`10.48550/arXiv.*`); 7 are technical reports/blog posts with `% No DOI available`
- HUMMBL relevance: T13 grounds the "expensive reasoning" (pull engine) half of the push/pull architecture

#### NIST AI RMF + EU AI Act Crosswalk Tags
- 60 entries across T4 (20), T6 (20), T11 (20) tagged with `nist_functions` and `eu_ai_act_articles` fields
- `scripts/add_nist_tags.py` — crosswalk dict (60 entries) + `inject_tags()` function
- Enables queries like `node toolkit/src/query.js --nist-function GOVERN --format json`

#### ARCANA Citation Map
- `mappings/arcana_citations.json` — 28 ARCANA philosophical lens objects, each with `primary`, `secondary`, `gaps`
- Critical gaps documented: Weber, Bourdieu, Burnham, Chomsky, Marx, Nietzsche, Gramsci, McLuhan, Heidegger

#### BKI Evidence Audit
- `mappings/bki_evidence.json` — 4 BKI propositions + Biocognitive OS + Broccolilly Equation + HUMMBL governance failure thesis
- Coverage grades per proposition; 14 present entries; 9 missing entries documented
- Critical gap: `Edmondson1999PsychologicalSafety` absent from bibliography

#### Open Brain Ingest Script
- `scripts/ingest_to_open_brain.py` — stdlib-only POST to Open Brain `/ledger/post`
- `--dry-run` (default), `--post`, `--tier`, `--keyword`, `--limit`, `--verbose` flags
- Calls `node toolkit/src/query.js --format json` as subprocess; converts entries to `discovery` ledger payloads

#### llms.txt Updated (260 entries)
- Regenerated to include T13; 1,100+ lines
- Sections: Query API docs, HUMMBL keyword legend, 13 tier sections (T1–T13)

#### DOI Audit (40 entries, all pre-T13 tiers)
- `scripts/annotate_dois.py` — applies `% No DOI available` comments and verified `doi` fields
- 4 CrossRef-verified DOIs added: `Grasse1959Stigmergy`, `Sabater2005Trust`, `Bansal2019MentalModels`, `Piaget1952Origins`
- 41 `% No DOI available` annotations added across T1/T2/T4/T5/T6/T8/T9/T10/T11/T12

### Quality Metrics (v1.3.0)

- ✅ **260 total entries** (20 × 13 tiers)
- ✅ 100% entries have abstracts
- ✅ 100% entries have HUMMBL transformation keywords
- ✅ 0 validation errors
- ✅ 0 cross-tier duplicate keys
- ✅ T7: 100% DOI coverage (20/20)
- ✅ T13: 65% DOI coverage (13/20, arXiv papers)
- ✅ Overall: ~55% DOI coverage (~142/260 est.)
- ✅ 60 entries with NIST AI RMF function tags
- ✅ 60 entries with EU AI Act article tags
- ✅ 28/28 ARCANA lenses mapped
- ✅ 4/4 BKI propositions mapped with coverage grades

---

## [1.2.0] - 2026-04-08

### Added
- `mappings/` directory with ARCANA citation map and BKI evidence audit (initial commits)
- `scripts/ingest_to_open_brain.py` — initial version
- `CONTRIBUTING.md` — DOI convention documentation
- `toolkit/src/query.js` — programmatic JSON query API

---

## [1.1.0] - 2026-04-08

### Added

#### New Tiers (T4–T12)
- **T4 (Governance & Ethics)**: 20 entries on AI policy, fairness, accountability, and alignment
- **T5 (Engineering Patterns)**: 20 entries on distributed systems, DevOps, chaos engineering, and observability
- **T6 (Philosophy of Mind)**: 20 entries on phenomenology, embodied cognition, and consciousness
- **T7 (Emerging AI Research)**: 20 entries on LLM agents, tool use, RAG, benchmarks, and multi-agent systems — fully DOI-enriched (100%)
- **T8 (Cognition & Learning)**: 20 entries on learning theory, memory systems, and metacognition
- **T9 (Economics & Incentives)**: 20 entries on mechanism design, market design, and AI economics
- **T10 (Collaboration & Teams)**: 20 entries on organizational design, coordination theory, and team dynamics
- **T11 (Security & Trust)**: 20 entries on adversarial ML, threat modeling, and trust architectures
- **T12 (Complexity Science)**: 20 entries on complex adaptive systems, emergence, and network theory

#### New Entry
- `Zhuge2024GPTSwarm` — "GPTSwarm: Language Agents as Optimizable Graphs" (NeurIPS 2024, arXiv:2402.16823); replaces duplicate T7 entry

#### DOI Enrichment — T7 (10 entries)
Added `doi = {10.48550/arXiv.XXXX.XXXXX}` to: `Yao2023ReAct`, `Wei2022ChainOfThought`, `Lewis2020RAG`,
`Schick2023Toolformer`, `Liu2024AgentBench`, `Jimenez2024SWEBench`, `Shinn2023Reflexion`,
`Schulhoff2024PromptReport`, `Wang2023Voyager`, `Ong2024RouteLLM`.
T7 is now **100% DOI-covered** (20/20).

#### DOI Annotations — T1 and T3
- Added `% No DOI available` comments to 6 unannotated T1 entries:
  `Newell1972Human`, `Csikszentmihalyi1990Flow`, `VonNeumann1944GameTheory`,
  `Gladwell2000TippingPoint`, `Schon1983ReflectivePractitioner`, `Gibson1979EcologicalApproach`
- Added `% No DOI available` comments to all 20 T3 entries (all trade business books)

### Fixed

- **Cross-tier duplicate**: `Chen2023FrugalGPT` existed in both T7 (`@inproceedings`) and T9 (`@article`).
  T7 instance removed and replaced with `Zhuge2024GPTSwarm`. T9 retains the canonical entry.
- **Wrong DOI**: `Yao2023TreeOfThoughts` had `doi = {10.48550/arXiv.2305.14325}` (Du2023Debate's DOI).
  Corrected to `doi = {10.48550/arXiv.2305.10601}`.
- **Wrong URL and DOI**: `Patil2023Gorilla` had URL/DOI pointing to arXiv `2305.10601` (Tree of Thoughts).
  Corrected to `2305.15324` (Gorilla's actual arXiv ID).

### Quality Metrics (v1.1.0)

- ✅ 240 total entries (20 × 12 tiers)
- ✅ 100% entries have abstracts
- ✅ 100% entries have HUMMBL transformation keywords
- ✅ 0 validation errors
- ✅ 0 cross-tier duplicate keys
- ✅ T7: 100% DOI coverage (20/20)
- ⚠️ Overall DOI coverage: ~51% (122/240 est.) — T2, T4, T6, T8–T12 audit pending
- ⚠️ T5 blog posts need `% No DOI available` annotation (4 entries)

---

## [1.0.0] - 2025-01-30

### Added

#### Bibliography
- Initial bibliography with 48 curated entries
- 17 canonical works (T1) covering foundational theories
- 16 empirical research papers (T2) with rigorous peer review
- 15 applied practitioner texts (T3) for industry applications
- Complete HUMMBL transformation mappings for all entries
- 100% abstract coverage across all entries
- 29% DOI coverage, 73% ISBN coverage

#### Toolkit
- `validate.js`: Comprehensive BibTeX validation with error/warning reports
- `check-duplicates.js`: Cross-file duplicate detection by title, DOI, and ISBN
- `fix-duplicates.js`: Automated duplicate removal with tier prioritization
- `find-missing-dois.js`: DOI enrichment via CrossRef API integration
- `stats.js`: Analytics dashboard with transformation coverage metrics
- `extract-keywords.js`: HUMMBL transformation keyword extraction and analysis
- `merge-entries.js`: Interactive entry consolidation tool
- NPM scripts for all toolkit operations
- CI mode for automated validation

#### Documentation
- Comprehensive README.md with quick start guide
- CONTRIBUTING.md with detailed contribution guidelines
- TRANSFORMATION_GUIDE.md explaining the six HUMMBL transformations
- QUALITY_STANDARDS.md defining entry requirements and formatting
- GAP_ANALYSIS.md tracking coverage gaps and priorities
- Toolkit README.md with tool documentation

#### Automation
- GitHub Actions workflow for PR validation
- Weekly statistics report generation workflow
- Manual DOI enrichment workflow
- Pre-commit hooks using Husky for validation
- Setup script for Git hook configuration
- Monthly review script for automated reporting

#### Project Infrastructure
- Issue templates for new entries and quality improvements
- Three-tier directory structure (T1/T2/T3)
- HUMMBL transformation mapping schema (JSON)
- Reports directory for generated statistics
- MIT License

### Transformation Coverage

Current distribution:
- **SY (Synthesis)**: 20 entries
- **CO (Composition)**: 18 entries  
- **P (Perspective)**: 17 entries
- **RE (Recursion)**: 16 entries
- **IN (Inversion)**: 15 entries
- **DE (Decomposition)**: 12 entries

### Quality Metrics

- ✅ 100% entries have abstracts
- ✅ 100% entries have HUMMBL transformation keywords
- ✅ 0 validation errors
- ✅ 0 duplicate entries
- ⚠️ 29% DOI coverage (target: 40-50%)
- ⚠️ 73% ISBN coverage (target: 85-90%)

### Known Issues

- DOI coverage below target (planned improvement in Q1 2025)
- Decomposition (DE) transformation underrepresented (4-6 entries needed)
- Inversion (IN) transformation slightly below target (1-3 entries needed)

## [Unreleased]

### Planned for v1.2.0 (Q3 2026)

- Complete `% No DOI available` annotation for T2, T4, T6, T8–T12
- DOI enrichment for T5 academic entries (Grasse1959, Rao1995, Sabater2005)
- T5 blog post annotation cleanup (4 entries)
- Evaluate T13 for post-2024 reasoning model papers (DeepSeek-R1, o3, etc.)
- Implement watch mode for continuous validation
- Enhanced statistics visualization

### Future Considerations

- Integration with Zotero/Mendeley
- Citation relationship analysis
- Automated entry suggestions based on gaps
- Community contribution portal
- Multi-language support
- API for programmatic access

---

**Note**: This changelog follows semantic versioning. Given the nature of a bibliography:
- **MAJOR** versions indicate significant structural changes or complete reorganizations
- **MINOR** versions indicate new entries, new tools, or significant enhancements
- **PATCH** versions indicate fixes to existing entries or minor improvements

For detailed commit history, see: https://github.com/hummbl-dev/hummbl-bibliography/commits/main
