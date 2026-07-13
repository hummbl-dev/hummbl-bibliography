# Universal Source Registry v0.1

**Status:** candidate, non-canonical.  
**Parents:** `hummbl-research#67`, `hummbl-bibliography#92`, `hummbl-bibliography#94`.

The registry separates **registration**, **retrieval**, **fixture validation**, **live validation**, and **promotion**. A URL is a locator; downstream evidence should resolve platform → collection → item → immutable version, edition, snapshot, commit, filing, or timestamp.

The seed contains **12 reference routes represented by 15 provider identities**. PubMed/PMC, LOC/Chronicling America, and NIST/RFC Editor remain distinct records to preserve provider semantics. Every seed adapter is `planned` and `unvalidated`; `approved_use_cases` is empty by design.

`partial` and `unreviewed` policy postures are explicit unknowns, not guessed facts. Before activation, provider child issues must verify current official authentication, rate limits, item-level rights, retention, and failure behavior.

## Validation

```bash
node toolkit/src/validate-source-registry.js sources/universal/source-registry-v0.1.json
node toolkit/src/validate-source-registry.js --self-test fixtures/source-registry/source-registry-v0.1.fixtures.json
```

The fixture pack covers five valid structural patterns and four adversarial cases: duplicate identity, missing policy posture, false promotion, and malformed canonical URI.

The ten family records reserve later coverage for Common Crawl, Wikipedia, Semantic Scholar, Europe PMC, CORE, ORCID, Zenodo, Figshare, Census, BLS, USPTO, NASA, NOAA, FDA, Congressional Record, Project Gutenberg, HathiTrust, university libraries, GitLab, package registries, OpenML, UCI, GenBank, PDB, CERN, W3C, WHATWG, Unicode, and authorized private connectors. These are backlog scopes, not activation claims.
