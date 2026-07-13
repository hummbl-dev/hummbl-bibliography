# Rights and Privacy Checklist — Corpus Pack v0.1

## Per-source checklist

Before any source is included in a benchmark packet, verify:

- [ ] **License identified**: Source license is explicitly recorded
- [ ] **Public domain verified**: If claimed public domain, verification recorded
- [ ] **Excerpt limits respected**: Fair-use excerpts are bounded and attributed
- [ ] **No sensitive personal data**: No PII, health, financial, or private communications
- [ ] **No credentials**: No API keys, passwords, tokens, or secrets
- [ ] **No unpublished IP**: No proprietary or unpublished intellectual property
- [ ] **No restricted sources**: No sources with access restrictions
- [ ] **Content hash recorded**: SHA-256 hash of included content
- [ ] **Retrieval date recorded**: When the source was accessed
- [ ] **Canonical URL recorded**: Stable reference to the source
- [ ] **Author/organization identified**: Attribution is possible
- [ ] **Version/edition recorded**: Specific version is pinned
- [ ] **Known corrections recorded**: Any corrections or retractions are noted
- [ ] **OCR method recorded**: If OCR was used, method and quality are noted
- [ ] **Privacy classification**: public_safe, sensitive, or restricted

## Per-packet checklist

Before a packet is released:

- [ ] **All sources pass per-source checklist**
- [ ] **No private content in public partition**
- [ ] **Manifest is complete and hashable**
- [ ] **Ground truth is human-reviewed**
- [ ] **Adversarial traps are documented**
- [ ] **Answer keys are independently reviewed**
- [ ] **Packet version is recorded**
- [ ] **Release receipt is produced**

## Prohibited content

The following must NEVER appear in any packet:

- Credentials, API keys, passwords, tokens
- Personal health information (PHI)
- Private communications without consent
- Unpublished proprietary IP
- Customer-confidential data
- Source code with restrictive licenses (unless fair-use excerpt)
- Content under NDA
- Content with export restrictions
- Content that identifies minors
- Content that could facilitate harm

## Violation response

If prohibited content is discovered in a packet:

1. Immediately remove the content from git
2. Record a correction receipt
3. Notify the operator
4. Audit all other packets for similar violations
5. Do not restore the content until rights status is verified
