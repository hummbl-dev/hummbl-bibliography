# DOCTRINE.md - hummbl-bibliography

**Status:** v0.1
**Steward:** HUMMBL Research Institute

## 1. Thesis

hummbl-bibliography is the provenance corpus for the HUMMBL cognitive
framework: 260 curated academic and practitioner works organized into 13
thematic tiers and mapped to the six Base120 cognitive transformations. The
core bet is that a cognitive framework is only as credible as the evidence
behind it, and that evidence must be machine-validatable, not just cited.

Every entry carries an abstract (150-300 words), HUMMBL transformation tags,
and where available a DOI or ISBN. The bibliography is not a reading list; it
is a validated, queryable knowledge substrate that ties each reasoning operator
to the literature that justifies it. Validation runs in CI, so drift and
duplication are caught mechanically.

The corpus spans systems thinking, cognitive psychology, AI safety, governance,
engineering patterns, and complexity science -- the interdisciplinary ground
the framework is built on. Position papers in this repo extend the literature
into HUMMBL-specific arguments.

## 2. Conceptual vocabulary

- **Thematic tier** -- one of 13 domains (Canonical, Empirical, Applied,
  Agentic, Engineering, Governance, etc.) each holding ~20 curated entries.
- **Transformation tag** -- a mapping from an entry to one or more of the six
  Base120 cognitive transformations (P, IN, CO, DE, RE, SY).
- **Entry** -- a single curated work with citation, abstract, tags, and
  identifiers (DOI/ISBN where available).
- **Validation** -- the CI-checked process that verifies entry completeness,
  identifier coverage, and absence of duplicates.
- **Position paper** -- a HUMMBL-authored argument that extends the literature
  into framework-specific claims.

## 3. Design principles

1. **Evidence-backed, not opinion-backed.** Every framework claim should be
   traceable to a curated entry with an abstract and identifier.
2. **Machine-validatable.** The bibliography is structured data validated in
   CI, not a static document that rots silently.
3. **Interdisciplinary by design.** The corpus spans the fields the framework
   draws from, not just one discipline.
4. **Transformation-mapped.** Entries are tagged to cognitive transformations
   so the framework can query its own theoretical grounding.
5. **Abstracts are mandatory.** No entry is admitted without a substantive
   abstract; a bare citation is insufficient.
6. **Open provenance.** DOIs and ISBNs are recorded wherever they exist so
   claims can be independently verified.

## 4. Boundaries

This repo is a bibliography and provenance corpus; it is not a reasoning
engine, does not execute operators, and does not score code. It does not define
the cognitive transformations themselves (that is Base120); it *maps* entries
to them. It is not a general academic search engine; it is scoped to works that
ground the HUMMBL framework. It does not host full texts of copyrighted works;
it holds citations, abstracts, and metadata only. Position papers here are
framework arguments, not peer-reviewed publications.

## 5. Open questions

- What is the inclusion criterion for new entries -- who curates, and against
  what quality bar?
- How should the bibliography handle preprints and non-peer-reviewed works
  that are nonetheless influential in agentic AI?
- Should transformation tags be reviewed for inter-annotator agreement, or is
  single-steward tagging acceptable at this scale?
- How does the corpus stay current as the agentic-AI literature expands
  rapidly without unbounded growth?
- Should position papers be split into their own repo as the framework matures?
