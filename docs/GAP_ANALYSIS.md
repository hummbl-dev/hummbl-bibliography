# Gap Analysis: HUMMBL Bibliography Coverage

**Last Updated**: 2026-04-08  
**Total Entries**: 240  
**Analysis Period**: Post-expansion audit (from 48 to 240 entries)

## 📊 Current Distribution

### By Transformation (tag counts across all 240 entries)

| Transformation | Count | % of Total | Ideal (16.7%) | Status |
|----------------|-------|------------|---------------|--------|
| SY (Synthesis) | 152 | 23.8% | overrepresented | ⚠️ Needs reduction |
| CO (Composition) | 115 | 18.0% | slightly over | ✅ Good |
| DE (Decomposition) | 103 | 16.2% | on target | ✅ Good |
| RE (Recursion) | 97 | 15.2% | slightly under | ✅ Acceptable |
| IN (Inversion) | 90 | 14.1% | under | ⚠️ Needs attention |
| P (Perspective) | 80 | 12.5% | significantly under | ❌ Priority gap |

### By Tier (all tiers now at 20 entries)

| Tier | Entries | DOI Coverage | ISBN Coverage |
|------|---------|-------------|--------------|
| T1 (Canonical) | 20 | 30% | 95% |
| T2 (Empirical) | 20 | 85% | 10% |
| T3 (Applied) | 20 | 0% | 100% |
| T4 (Agentic) | 20 | 75% | 25% |
| T5 (Engineering) | 20 | 35% | 30% |
| T6 (Governance) | 20 | 60% | 0% |
| T7 (Emerging) | 20 | 100% | 0% |
| T8 (Cognition) | 20 | 75% | 20% |
| T9 (Economics) | 20 | 80% | 20% |
| T10 (Collaboration) | 20 | 90% | 10% |
| T11 (Security) | 20 | 75% | 0% |
| T12 (Complexity) | 20 | 70% | 50% |

### By HUMMBL Transformation

### 1. Perspective (P) - HIGH PRIORITY

**Current**: 80 tags (12.5% of total)  
**Ideal**: ~107 tags (16.7%)  
**Gap**: ~27 additional P tags needed

**Rationale**: Perspective -- the ability to frame, name, and shift viewpoint -- is the most underrepresented transformation. Many entries tagged SY could be reexamined for P relevance.

**Candidate new entries** (if tiers expand beyond 20):
- Gadamer (1989) - *Truth and Method* (hermeneutic perspective) - T1
- Goffman (1974) - *Frame Analysis* (social framing) - T1
- Nagel (1974) - "What Is It Like to Be a Bat?" (phenomenal perspective) - T1
- de Bono (1985) - *Six Thinking Hats* (perspective switching) - T3

**Rebalancing opportunity**: Review entries where SY is tertiary and P better describes the content.

**Target**: Complete the `% No DOI available` annotation pattern established in T1, T3, T7 across all tiers. Every entry should either have a `doi = {...}` field OR a `% No DOI available -- <reason>` comment.

**Current**: 90 tags (14.1% of total)  
**Ideal**: ~107 tags (16.7%)  
**Gap**: ~17 additional IN tags needed

**Candidate new entries**:
- Munger (1994) - *Poor Charlie's Almanack* (inversion in decisions) - T3
- Popper (1959) - *Logic of Scientific Discovery* (falsification) - T1
- Watzlawick (1974) - *Change* (paradoxical interventions) - T1
- Argyris (1977) - Double-loop learning (questioning assumptions) - T2

### 3. SY Overrepresentation - MEDIUM PRIORITY

**Current**: 152 tags (23.8%)  
**Ideal**: ~107 tags (16.7%)  
**Excess**: ~45 tags over ideal

Many entries default to SY as a catch-all for "systems-related." Rebalancing should reassign SY to more specific transformations where content warrants it.

### Previously Identified Gaps (Now Addressed)

- ~~DE (Decomposition): was 12/48, now 103 tags across 240 entries~~ ✅ Resolved via T4-T12 expansion
- ~~IN (Inversion): was 15/48, now 90 tags~~ ✅ Substantially improved
- ~~DOI coverage: was 29%~~ ✅ Now 65% (155/240)

## 🔍 Quality Metrics

### DOI Coverage
**Current**: 64.6% (155/240 entries)  
**Target**: 75-80%  
**Best tiers**: T7 (100%), T10 (90%), T2 (85%)  
**Worst tiers**: T3 (0%, trade books), T1 (30%), T5 (35%)  
**Action**: Run `npm run find-dois` for batch enrichment of T1 and T5

### ISBN Coverage  
**Current**: 30% (72/240 entries)  
**Target**: 50%  
**Best tiers**: T3 (100%), T1 (95%), T12 (50%)  
**Worst tiers**: T6, T7, T11 (0%)  
**Note**: ISBN is primarily relevant for book entries; journal articles typically have DOIs instead.

### v1.2.0 (Next quarter)
- [ ] Complete DOI audit for T2, T4, T6, T8–T12
- [ ] Add `% No DOI available` to all confirmed-unavailable entries across all tiers
- [ ] DOI enrichment pass for T5 academic entries (Grasse1959, Rao1995, Sabater2005)
- [ ] Run `check-duplicates` and verify zero cross-tier collisions
- [ ] Review post-2024 AI safety literature for T7/T13 additions

### Well-Covered Domains (via T4-T12 expansion)
- ✅ Systems thinking (T1, T12)
- ✅ Cognitive psychology (T2, T8)
- ✅ Decision making (T2, T3)
- ✅ AI safety & alignment (T4)
- ✅ Software engineering patterns (T5)
- ✅ AI governance & regulation (T6)
- ✅ LLM agent research (T7)
- ✅ Knowledge representation (T8)
- ✅ Economics & platforms (T9)
- ✅ Human-AI collaboration (T10)
- ✅ Cybersecurity (T11)
- ✅ Complex adaptive systems (T12)

### Underrepresented Domains (potential future tiers)
- ⚠️ Philosophy of science / epistemology
- ⚠️ Linguistics and language
- ⚠️ Mathematics and formal logic
- ⚠️ Education and pedagogy

## 📊 Success Metrics

### Transformation Balance
**Target**: Each transformation tag should represent ~16.7% of total (±3%)

**Current Status**:
- [x] 100% abstracts ✅
- [x] 100% HUMMBL keywords ✅
- [x] 0 duplicates ✅
- [x] 0 validation errors ✅
- [ ] DOI coverage: 65% (target 75%)
- [ ] P tags: 12.5% (target 16.7%)
- [ ] IN tags: 14.1% (target 16.7%)
- [ ] SY tags: 23.8% (target 16.7%, reduce)

---

**Last Review**: 2026-04-08  
**Reviewer**: Claude Opus 4.6 (automated audit)
