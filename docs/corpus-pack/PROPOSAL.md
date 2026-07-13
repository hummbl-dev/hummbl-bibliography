# Corpus Pack v0.1 — Source-Selection Proposal, Rights Matrix, Storage Plan, and Candidate Task Outlines

**Status: CANDIDATE SOURCE PACK — PUBLIC-SAFE FIRST — NO RAW-CORPUS DUMP**

Parent: hummbl-dev/hummbl-dev#155
Harness: hummbl-dev/autoresearch-pipeline#30
Master index: hummbl-dev/hummbl-dev#153

## Source-selection proposal

Five initial public-safe candidate packets:

### Packet 1: Bounded bibliography subset

- **Source**: Existing public bibliography entries (already in repo)
- **Type**: Structured source registry
- **Purpose**: Entity resolution, authority classification, source identity
- **Rights**: Public bibliography metadata — CC BY 4.0 (repo license)
- **Size**: ~50-100 entries

### Packet 2: Public-domain Illinois historical/OCR packet

- **Source**: Public-domain Illinois historical document (pre-1928)
- **Type**: OCR/historical packet with known defects
- **Purpose**: OCR quality reasoning, historical text understanding
- **Rights**: Public domain
- **Size**: One document, ~10-50 pages

### Packet 3: Technical source packet

- **Source**: Official documentation and primary papers (publicly available)
- **Type**: Current technical-source packet
- **Purpose**: Multi-hop synthesis, claim-to-source mapping
- **Rights**: Fair use excerpts with citations; full sources referenced by URL
- **Size**: 3-5 sources, excerpts only

### Packet 4: Correction/retraction/version-history packet

- **Source**: A source with known corrections or version history
- **Type**: Temporal/version packet with contradictions
- **Purpose**: Contradiction detection, temporal reasoning
- **Rights**: Public domain or CC-licensed corrected source
- **Size**: 2-3 versions of one source

### Packet 5: Deliberately insufficient-evidence packet

- **Source**: Sources that do NOT support a tempting conclusion
- **Type**: Negative packet
- **Purpose**: Bounded uncertainty, rejection of unsupported claims
- **Rights**: Public-safe excerpts
- **Size**: 2-3 sources with gaps

## Rights matrix

| Packet | Source Type | License | Public Domain | Excerpt Only | Full Text in Git | External Storage |
|--------|------------|---------|---------------|--------------|------------------|-----------------|
| 1 | Bibliography metadata | CC BY 4.0 | N/A | No | Yes | No |
| 2 | Historical document | Public domain | Yes | No | Excerpt + manifest | Full text (if large) |
| 3 | Technical docs/papers | Various (fair use) | No | Yes | Excerpts only | Full sources by URL |
| 4 | Corrected source | Public domain or CC | Maybe | Excerpt | Excerpt + manifest | Full versions (if large) |
| 5 | Negative evidence | Public-safe | No | Yes | Excerpts only | No |

## Storage plan

### Git-committed (manifests, metadata, excerpts)

- Source manifests with all required metadata fields
- Source metadata (no full content for copyrighted material)
- SHA-256 content hashes
- Public-safe excerpts within rights limits
- Transformation scripts
- Sampled fixtures
- Expected claim/evidence relationships
- Evaluation rubrics
- Correction and release receipts

### External object storage (large raw content)

- Raw large PDFs
- Image archives
- Full OCR corpora
- Audio/video
- Embeddings
- Indexes

External storage is addressed by immutable manifest. Content is NOT
committed to git merely to make the repository look comprehensive.

### Storage decision record

See `STORAGE_DECISION.md` for the formal decision record.

## Five candidate task outlines

### Task 1: Entity resolution (Packet 1)

- **Task**: Resolve author identity across 5 bibliography entries with name variants
- **Ground truth**: Known identity mappings
- **Adversarial trap**: Duplicate entity with different spelling
- **Scoring**: factual_precision, citation_validity

### Task 2: OCR reasoning (Packet 2)

- **Task**: Identify and correct OCR defects in a historical passage
- **Ground truth**: Known defects and corrections
- **Adversarial trap**: OCR defect that changes meaning
- **Scoring**: factual_precision, cross_file_reasoning

### Task 3: Multi-hop synthesis (Packet 3)

- **Task**: Synthesize a claim requiring evidence from 3 distant sources
- **Ground truth**: Supported claim with required citations
- **Adversarial trap**: Tempting but unsupported claim
- **Scoring**: cross_file_reasoning, citation_validity, uncertainty_calibration

### Task 4: Contradiction detection (Packet 4)

- **Task**: Identify which source version is authoritative given corrections
- **Ground truth**: Correct version and correction history
- **Adversarial trap**: Citing superseded version as current
- **Scoring**: contradiction_detection, temporal reasoning

### Task 5: Insufficient evidence (Packet 5)

- **Task**: Determine whether sources support a specific conclusion
- **Ground truth**: Correct answer is "insufficient evidence"
- **Adversarial trap**: Tempting but unsupported affirmative answer
- **Scoring**: uncertainty_calibration, factual_precision

## Source-manifest schema

See `source_manifest.schema.json` for the full schema with all required
fields:

- source_id
- title
- author_or_organization
- source_type
- publication_date
- version_or_edition
- effective_date
- retrieval_date
- canonical_url_or_locator
- license_or_rights_posture
- public_domain_status
- content_hash
- local_or_object_storage_locator
- source_authority_roles
- known_corrections_or_retractions
- OCR_or_extraction_method
- quality_flags
- included_segments
- excluded_segments_and_reason
- privacy_or_sensitivity
- citation_format

## Next steps

1. Review this proposal (operator + independent reviewer)
2. If approved, create the five packets with manifests and fixtures
3. Run deterministic pack validator
4. Produce release manifest and correction protocol
5. Do NOT commit raw large content to git

## References

- Parent: hummbl-dev/hummbl-dev#155
- Harness: hummbl-dev/autoresearch-pipeline#30
- Master index: hummbl-dev/hummbl-dev#153
