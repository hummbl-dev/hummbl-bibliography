# Benchmark Corpus Pack v0.1 — Source-Selection Proposal

**Status: CANDIDATE SOURCE PACK — PUBLIC-SAFE FIRST — NO RAW-CORPUS DUMP**

Issue: hummbl-dev/hummbl-bibliography#78
Parent benchmark: hummbl-dev/hummbl-dev#155

## Source-selection proposal

Five initial public-safe benchmark packets:

### Packet 1: Bounded public bibliography subset
- **Sources**: Existing public bibliography entries (peer-reviewed papers, public datasets)
- **Rights**: CC BY, MIT, or public domain only
- **Task type**: Structured source registry — authority roles, editions, corrections
- **Storage**: Git (metadata only)

### Packet 2: Public-domain Illinois historical/OCR packet
- **Sources**: Public-domain historical documents with known OCR defects
- **Rights**: Public domain (pre-1928 or US government works)
- **Task type**: OCR/historical — extraction quality, defect handling
- **Storage**: Git (metadata + public-safe excerpts), object store (images if needed)

### Packet 3: Current technical-source packet
- **Sources**: Official documentation, primary papers from open-access journals
- **Rights**: Open access (CC BY, arXiv MIT-style)
- **Task type**: Mixed-format — text, tables, code
- **Storage**: Git (metadata + excerpts)

### Packet 4: Correction/retraction/version-history packet
- **Sources**: Papers with published corrections or retractions
- **Rights**: Open access
- **Task type**: Contradiction + temporal/version — superseded claims, version-dependent answers
- **Storage**: Git (metadata + correction notices)

### Packet 5: Deliberately insufficient-evidence packet
- **Sources**: Sources that do not support the requested conclusion
- **Rights**: Open access or public domain
- **Task type**: Negative — correct response is bounded uncertainty or rejection
- **Storage**: Git (metadata only)

## Rights matrix

| Source class | License | Git metadata | Git excerpts | Object store |
|-------------|---------|-------------|-------------|-------------|
| Public domain (pre-1928) | PD | Yes | Yes | Yes (if needed) |
| US government works | PD | Yes | Yes | Yes |
| CC BY 4.0 | CC BY | Yes | Yes (attributed) | Yes (attributed) |
| arXiv preprints | arXiv MIT-style | Yes | Yes (cited) | No (link only) |
| Open-access journals | CC BY | Yes | Yes (attributed) | No (link only) |
| Restricted/proprietary | Various | No | No | No |

## Storage plan

- **Git**: manifests, source metadata, hashes, public-safe excerpts, transformation scripts, sampled fixtures, expected claim/evidence relationships, evaluation rubrics, correction and release receipts
- **Object store** (future): raw PDFs, image archives, OCR corpora, audio/video, embeddings, indexes — addressed by immutable manifest
- **Decision**: No raw large objects committed without an approved storage decision record

## Five candidate task outlines

### Task 1: Source authority lookup
- **Question**: What is the authoritative source for claim X?
- **Expected**: Correct source identification with authority role
- **Hallucination trap**: Citing a secondary source as primary

### Task 2: Multi-hop synthesis
- **Question**: Synthesize answer requiring evidence from 3+ distant sources
- **Expected**: Answer with all required citations
- **Hallucination trap**: Fabricating a source that doesn't exist

### Task 3: Contradiction resolution
- **Question**: Source A says X, Source B says not-X. Which is current?
- **Expected**: Identify supersession, cite effective dates
- **Hallucination trap**: Picking one without checking dates

### Task 4: Temporal/version constraint
- **Question**: Is claim X true as of date Y?
- **Expected**: Version-dependent answer with effective date
- **Hallucination trap**: Ignoring version context

### Task 5: Insufficient evidence
- **Question**: Does the corpus support conclusion Z?
- **Expected**: Bounded uncertainty or rejection
- **Hallucination trap**: Confidently asserting Z without support

## Source-manifest schema

See `source-manifest.schema.json` for the JSON Schema.

## Task and answer-key schema

See `task-answer-key.schema.json` for the JSON Schema.

## Acceptance criteria mapping

- [x] Every source has authority, version, date, rights, hash, and retrieval metadata — source-manifest schema
- [x] At least one task requires globally distributed evidence — Task 2
- [x] At least one task contains a corrected, superseded, or retracted source — Packet 4
- [x] At least one task has no supportable affirmative answer — Task 5
- [x] OCR quality and extraction errors are explicit — quality_flags in schema
- [x] Raw large objects are not committed without an approved storage decision — storage plan
- [ ] Answer keys and rubrics are independently reviewed — PENDING
- [x] Public release contains no private or rights-restricted content — rights matrix
- [x] Pack versions are immutable or clearly superseded — version field in schema

## References

- Issue: hummbl-dev/hummbl-bibliography#78
- Parent benchmark: hummbl-dev/hummbl-dev#155
- Harness: hummbl-dev/autoresearch-pipeline#30
- Master index: hummbl-dev/hummbl-dev#153
