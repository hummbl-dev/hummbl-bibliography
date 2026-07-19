#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const schemaPath = path.resolve(repoRoot, 'schemas/bibliography-schema-registry-v0.1.schema.json');

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv, ['date', 'uri']);
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const structuralValidate = ajv.compile(schema);

const KINDS = new Set([
  'conceptual_model',
  'cataloging_rule',
  'record_schema',
  'exchange_format',
  'metadata_schema',
  'ontology_vocabulary',
  'application_profile',
  'style_rule',
  'protocol',
  'identifier_system',
  'adjacent_schema',
  'container_or_bundle',
  'registration_schema'
]);

const ADMISSION = new Set(['candidate', 'validated', 'promoted_with_scope', 'rejected', 'retired']);
const LIFECYCLE = new Set(['unknown', 'active', 'deprecated', 'superseded', 'withdrawn', 'historical']);
const GOVERNANCE = new Set(['unknown', 'standards_body', 'community', 'vendor_controlled', 'public_institution', 'consortium', 'mixed']);
const SUPPORT = new Set(['yes', 'partial', 'no', 'unknown', 'not_applicable']);
const TRIP_STATUS = new Set(['not_assessed', 'lossless_claimed', 'lossy', 'mixed', 'unknown']);

const load = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const resolveFromBase = (baseDir, p) => (path.isAbsolute(p) ? p : path.resolve(baseDir, p));
const isString = value => typeof value === 'string' && value.trim().length > 0;
const isStringArray = value => Array.isArray(value) && value.every(isString) && new Set(value).size === value.length;
const normalize = value =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const isExternalRef = value => typeof value === 'string' && /^(https?:\/\/|urn:)/i.test(value);

function recalcCounts(records) {
  const byPreservationGroup = {};
  const byKind = {};
  for (const record of records) {
    byPreservationGroup[record.preservation_group] = (byPreservationGroup[record.preservation_group] || 0) + 1;
    byKind[record.kind] = (byKind[record.kind] || 0) + 1;
  }
  return {
    total_records: records.length,
    by_preservation_group: Object.fromEntries(Object.entries(byPreservationGroup).sort((a, b) => a[0].localeCompare(b[0]))),
    by_kind: Object.fromEntries(Object.entries(byKind).sort((a, b) => a[0].localeCompare(b[0])))
  };
}

function structuralErrors(doc) {
  const errors = [];
  const ok = structuralValidate(doc);
  if (ok) return errors;
  for (const err of structuralValidate.errors || []) {
    const pathLabel = err.instancePath ? `${err.instancePath} ` : '';
    errors.push(`schema ${pathLabel}${err.message || 'invalid'}`.trim());
  }
  return errors;
}

function semanticErrors(doc) {
  const errors = [];

  try {
    const groupIds = new Set((doc.preservation_groups || []).map(group => group.id));
    const allRecordIds = new Set((doc.records || []).map(record => record.id));
    const recordIds = new Set();
    const aliasIndex = new Map();
    const nameIndex = new Map();
    const recordById = new Map();

    for (const [index, record] of (doc.records || []).entries()) {
      const p = `records[${index}]`;
      if (recordIds.has(record.id)) errors.push(`${p} duplicate id`);
      recordIds.add(record.id);
      recordById.set(record.id, record);

      if (!groupIds.has(record.preservation_group)) {
        errors.push(`${p} unknown preservation_group`);
      }

      const normalizedName = normalize(record.name);
      if (nameIndex.has(normalizedName)) errors.push(`${p} duplicate name`);
      nameIndex.set(normalizedName, record.id);

      for (const alias of record.aliases || []) {
        const normalizedAlias = normalize(alias);
        if (aliasIndex.has(normalizedAlias)) {
          errors.push(`${p} duplicate alias`);
        } else {
          aliasIndex.set(normalizedAlias, record.id);
        }
        if (nameIndex.has(normalizedAlias)) {
          errors.push(`${p} alias collides with existing name`);
        }
        if (allRecordIds.has(normalizedAlias)) {
          errors.push(`${p} alias collides with existing id`);
        }
      }
    }

    for (const [index, record] of (doc.records || []).entries()) {
      const p = `records[${index}]`;
      if (record.parent_family && !isExternalRef(record.parent_family) && !recordIds.has(record.parent_family) && !groupIds.has(record.parent_family)) {
        errors.push(`${p}.parent_family dangling reference`);
      }

      for (const refField of ['supersedes', 'superseded_by', 'related_schemas']) {
        for (const value of record[refField] || []) {
          if (!isString(value)) continue;
          if (isExternalRef(value)) continue;
          if (!recordIds.has(value) && !groupIds.has(value)) {
            errors.push(`${p}.${refField} dangling reference: ${value}`);
          }
          if (value === record.id) {
            errors.push(`${p}.${refField} self-reference`);
          }
        }
      }

      if (!LIFECYCLE.has(record.lifecycle_status)) errors.push(`${p}.lifecycle_status invalid`);
      if (!ADMISSION.has(record.admission_status)) errors.push(`${p}.admission_status invalid`);
      if (!GOVERNANCE.has(record.governance_model)) errors.push(`${p}.governance_model invalid`);
      if (!KINDS.has(record.kind)) errors.push(`${p}.kind invalid`);
      if (!SUPPORT.has(record.citation_record_support)) errors.push(`${p}.citation_record_support invalid`);
      if (!SUPPORT.has(record.reference_list_support)) errors.push(`${p}.reference_list_support invalid`);
      if (!SUPPORT.has(record.authority_data_support)) errors.push(`${p}.authority_data_support invalid`);
      if (!SUPPORT.has(record.provenance_support)) errors.push(`${p}.provenance_support invalid`);
      if (!SUPPORT.has(record.relationship_support)) errors.push(`${p}.relationship_support invalid`);
      if (!TRIP_STATUS.has(record.round_trip_status)) errors.push(`${p}.round_trip_status invalid`);
    }

    for (const record of (doc.records || [])) {
      for (const target of record.supersedes || []) {
        const targetRecord = recordById.get(target);
        if (targetRecord && !targetRecord.superseded_by.includes(record.id)) {
          errors.push(`records.${record.id}.supersedes missing reciprocal superseded_by`);
        }
      }
      for (const source of record.superseded_by || []) {
        const sourceRecord = recordById.get(source);
        if (sourceRecord && !sourceRecord.supersedes.includes(record.id)) {
          errors.push(`records.${record.id}.superseded_by missing reciprocal supersedes`);
        }
      }
    }

    if (doc.generated_counts && typeof doc.generated_counts === 'object') {
      const actual = recalcCounts(doc.records || []);
      if (doc.generated_counts.total_records !== actual.total_records) {
        errors.push('generated_counts.total_records mismatch');
      }
      for (const [groupId, count] of Object.entries(actual.by_preservation_group)) {
        if ((doc.generated_counts.by_preservation_group || {})[groupId] !== count) {
          errors.push(`generated_counts.by_preservation_group.${groupId} mismatch`);
        }
      }
      for (const [kind, count] of Object.entries(actual.by_kind)) {
        if ((doc.generated_counts.by_kind || {})[kind] !== count) {
          errors.push(`generated_counts.by_kind.${kind} mismatch`);
        }
      }
    }
  } catch (error) {
    errors.push(`semantic validator exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return errors;
}

export function validateBibliographySchemaRegistry(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return ['document must be object'];
  }

  const structural = structuralErrors(doc);
  if (structural.length) return structural;
  return semanticErrors(doc);
}

function selfTest(fixturePath) {
  const fixtureAbs = resolveFromBase(process.cwd(), fixturePath);
  const pack = load(fixtureAbs);
  const registry = load(resolveFromBase(repoRoot, pack.registry_path));
  let failures = 0;

  for (const t of pack.valid) {
    const subsetRecords = Array.isArray(t.record_ids) && t.record_ids.length
      ? registry.records.filter(record => t.record_ids.includes(record.id))
      : registry.records;
    const subset = {
      ...registry,
      records: subsetRecords,
      generated_counts: recalcCounts(subsetRecords)
    };
    const errors = validateBibliographySchemaRegistry(subset);
    if (errors.length) {
      failures++;
      console.error(`FAIL valid:${t.name}`, errors);
    } else {
      console.log(`PASS valid:${t.name}`);
    }
  }

  for (const t of pack.invalid) {
    let mutated = load(resolveFromBase(repoRoot, pack.registry_path));
    if (t.mutation.type === 'replace_root') {
      mutated = t.mutation.value;
    } else {
      const needsTarget = new Set(['duplicate_record', 'delete_field', 'set_field', 'add_field', 'push_array']);
      const target = mutated.records?.find(record => record.id === t.record_id);
      if (needsTarget.has(t.mutation.type) && !target) {
        failures++;
        console.error(`FAIL invalid fixture target missing:${t.name}`);
        continue;
      }
      switch (t.mutation.type) {
        case 'duplicate_record':
          mutated.records.push(JSON.parse(JSON.stringify(target)));
          mutated.records[mutated.records.length - 1].id = t.mutation.new_id;
          break;
        case 'delete_field':
          delete target[t.mutation.field];
          break;
        case 'set_field':
          target[t.mutation.field] = t.mutation.value;
          break;
        case 'add_field':
          target[t.mutation.field] = t.mutation.value;
          break;
        case 'delete_top_field':
          delete mutated[t.mutation.field];
          break;
        case 'set_top_field':
          mutated[t.mutation.field] = t.mutation.value;
          break;
        case 'push_array':
          target[t.mutation.field].push(t.mutation.value);
          break;
        case 'corrupt_counts':
          mutated.generated_counts[t.mutation.field] = t.mutation.value;
          break;
        default:
          break;
      }
    }
    const errors = validateBibliographySchemaRegistry(mutated);
    if (!errors.length) {
      failures++;
      console.error(`FAIL invalid accepted:${t.name}`);
    } else {
      console.log(`PASS invalid rejected:${t.name}`);
    }
  }

  return failures;
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') {
  process.exit(selfTest(args[1]) ? 1 : 0);
}

if (!args.length) {
  console.error('usage: validate-bibliography-schema-registry.js <registry.json> | --self-test <fixtures.json>');
  process.exit(2);
}

const errors = validateBibliographySchemaRegistry(load(resolveFromBase(process.cwd(), args[0])));
if (errors.length) {
  console.error('FAIL');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`PASS ${args[0]}`);
