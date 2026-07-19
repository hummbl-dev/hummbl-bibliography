# Bibliography schema registry v0.1

This registry is a preservation-first, open-world inventory of bibliography-related types, formats, schemas, ontologies, profiles, styles, protocols, and identifier systems.

It is intentionally split from the Universal Source Registry.

## Files

- Schema: [`schemas/bibliography-schema-registry-v0.1.schema.json`](</C:/Users/Owner/PROJECTS/hummbl-bibliography/schemas/bibliography-schema-registry-v0.1.schema.json:1>)
- Registry data: [`sources/bibliography/bibliography-schema-registry-v0.1.json`](</C:/Users/Owner/PROJECTS/hummbl-bibliography/sources/bibliography/bibliography-schema-registry-v0.1.json:1>)
- Fixtures: [`fixtures/bibliography-schema-registry-v0.1.fixtures.json`](</C:/Users/Owner/PROJECTS/hummbl-bibliography/fixtures/bibliography-schema-registry-v0.1.fixtures.json:1>)
- Validator: [`toolkit/src/validate-bibliography-schema-registry.js`](</C:/Users/Owner/PROJECTS/hummbl-bibliography/toolkit/src/validate-bibliography-schema-registry.js:1>)
- Human taxonomy source: [`docs/bibliography-taxonomy-open-world.md`](</C:/Users/Owner/PROJECTS/hummbl-bibliography/docs/bibliography-taxonomy-open-world.md:1>)

## Contract

Records keep these distinctions separate:

- conceptual model
- cataloging rule
- record schema
- exchange format
- metadata schema
- ontology / vocabulary
- application profile
- style rule
- protocol
- identifier system
- adjacent schema

Each record carries:

- `preservation_group`: the source taxonomy section retained for preservation
- `kind`: the primary mutually exclusive classification
- `admission_status`: registry admission state
- `lifecycle_status`: artifact lifecycle state
- `governance_model`: governance/ownership posture

The current registry snapshot is a preserved taxonomy slice. It is not yet a fully sourced admission list for every item.

## Validation

```bash
node toolkit/src/validate-bibliography-schema-registry.js sources/bibliography/bibliography-schema-registry-v0.1.json
node toolkit/src/validate-bibliography-schema-registry.js --self-test fixtures/bibliography-schema-registry-v0.1.fixtures.json
```

## Status

- registry status: candidate
- evidence status: preserved_from_taxonomy_doc
- counts: generated from registry data

## Next step

Attach authoritative homepages/specifications and promote records in phases, rather than collapsing the whole bibliography landscape into one unverified mega-schema.
