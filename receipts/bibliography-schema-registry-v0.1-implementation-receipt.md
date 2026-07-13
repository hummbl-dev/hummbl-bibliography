# Receipt — Bibliography schema registry v0.1

## Scope

Preserve the open-world bibliography taxonomy as machine-readable registry data, schema, validator, fixtures, and short guidance.

## Files added or updated in this lane

- `schemas/bibliography-schema-registry-v0.1.schema.json`
- `sources/bibliography/bibliography-schema-registry-v0.1.json`
- `fixtures/bibliography-schema-registry-v0.1.fixtures.json`
- `toolkit/src/validate-bibliography-schema-registry.js`
- `docs/bibliography-schema-registry-v0.1.md`
- `docs/bibliography-taxonomy-open-world.md`

## Validation commands

```bash
node toolkit/src/validate-bibliography-schema-registry.js sources/bibliography/bibliography-schema-registry-v0.1.json
node toolkit/src/validate-bibliography-schema-registry.js --self-test fixtures/bibliography-schema-registry-v0.1.fixtures.json
```

## Observed results

- Registry validation: PASS
- Fixture self-test: PASS
- Generated record count: 255

## Boundary

This is a preservation-first candidate registry. The current records are derived from the taxonomy doc and are not yet a fully source-admitted bibliography schema authority.

## Remaining work

- attach authoritative homepages/specification URLs record-by-record;
- resolve category-specific lifecycle state where useful;
- promote verified records in phases;
- add more adversarial fixtures as new edge cases appear.
