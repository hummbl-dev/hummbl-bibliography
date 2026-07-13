# Storage Decision Record — Corpus Pack v0.1

## Decision

Raw large content (PDFs, images, OCR corpora, audio/video, embeddings,
indexes) will NOT be committed to git. Content is stored externally and
addressed by immutable manifest.

## Rationale

1. Git is not designed for large binary content — repository bloat,
   slow clones, merge conflicts.
2. Rights and licensing vary per source — committing full text risks
   exposure of restricted content.
3. Immutability is better enforced via content-hash addressing than
   git history.
4. The benchmark needs frozen, hashable sources — external storage
   with manifest references achieves this without git overhead.

## What goes in git

- Source manifests (metadata, hashes, rights posture)
- Public-safe excerpts within rights limits
- Transformation scripts
- Sampled fixtures
- Expected claim/evidence relationships
- Evaluation rubrics
- Correction and release receipts

## What goes in external storage

- Raw PDFs
- Image archives
- Full OCR corpora
- Audio/video
- Embeddings
- Indexes

## External storage candidates

- IPFS (content-addressed, immutable)
- S3-compatible object storage with content-hash verification
- Local file system with manifest references (for private partitions)

## Review

This decision should be reviewed when:
- A specific packet requires content that exceeds git's practical limits
- Rights status changes for any source
- A new storage backend is needed

## Status

PROPOSED — pending operator review.
