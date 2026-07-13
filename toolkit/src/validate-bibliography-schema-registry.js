#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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

const STATUSES = new Set([
  'candidate',
  'validated',
  'promoted_with_scope',
  'retired'
]);

const LIFECYCLES = new Set([
  'candidate',
  'active',
  'legacy',
  'superseded',
  'vendor_controlled',
  'style_rule',
  'protocol',
  'identifier_system',
  'experimental',
  'unverified'
]);

const EVIDENCE = new Set([
  'preserved_from_taxonomy_doc',
  'candidate_seed',
  'verified_primary_source',
  'partial_primary_source',
  'needs_authoritative_source'
]);

const TRIP_STATUS = new Set([
  'not_assessed',
  'lossless_claimed',
  'lossy',
  'mixed',
  'unknown'
]);

const SUPPORT = new Set(['yes', 'partial', 'no', 'unknown', 'not_applicable']);

const https = value => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const normalize = value =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function isStringArray(value, allowEmpty = false) {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every(item => typeof item === 'string' && item.trim().length > 0) &&
    new Set(value).size === value.length
  );
}

function pushCount(map, key) {
  map[key] = (map[key] || 0) + 1;
}

function recalcCounts(records) {
  const byCategory = {};
  const byKind = {};
  for (const record of records) {
    pushCount(byCategory, record.category);
    pushCount(byKind, record.kind);
  }
  return {
    total_records: records.length,
    by_category: Object.fromEntries(Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0]))),
    by_kind: Object.fromEntries(Object.entries(byKind).sort((a, b) => a[0].localeCompare(b[0])))
  };
}

export function validateBibliographySchemaRegistry(doc) {
  const errors = [];

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return ['document must be object'];
  }

  if (doc.schema_version !== 'bibliography_schema_registry.v0.1') {
    errors.push('schema_version invalid');
  }

  if (!Array.isArray(doc.categories) || doc.categories.length < 8) {
    errors.push('categories required');
  }

  if (!Array.isArray(doc.records) || doc.records.length < 1) {
    errors.push('records required');
  }

  if (!doc.generated_counts || typeof doc.generated_counts !== 'object') {
    errors.push('generated_counts required');
  }

  const categories = new Map();
  for (const [index, category] of (doc.categories || []).entries()) {
    const path = `categories[${index}]`;
    if (!category || typeof category !== 'object' || Array.isArray(category)) {
      errors.push(`${path} invalid`);
      continue;
    }
    for (const field of ['id', 'title', 'description']) {
      if (!(field in category)) errors.push(`${path} missing ${field}`);
    }
    if (typeof category.id === 'string') {
      if (categories.has(category.id)) errors.push(`${path} duplicate id`);
      categories.set(category.id, category);
    }
  }

  const ids = new Set();
  const names = new Set();
  const byCategory = {};
  const byKind = {};

  for (const [index, record] of (doc.records || []).entries()) {
    const path = `records[${index}]`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`${path} invalid`);
      continue;
    }

    const required = [
      'id',
      'name',
      'aliases',
      'category',
      'kind',
      'scope',
      'governing_body',
      'parent_family',
      'representation_model',
      'serializations',
      'validation_artifacts',
      'current_version',
      'lifecycle_status',
      'introduced',
      'supersedes',
      'superseded_by',
      'official_homepage',
      'specification_urls',
      'source_accessed_at',
      'citation_record_support',
      'reference_list_support',
      'authority_data_support',
      'provenance_support',
      'relationship_support',
      'round_trip_status',
      'related_schemas',
      'notes',
      'evidence_status'
    ];

    for (const field of required) {
      if (!(field in record)) errors.push(`${path} missing ${field}`);
    }

    if (typeof record.id === 'string') {
      if (ids.has(record.id)) errors.push(`${path} duplicate id`);
      ids.add(record.id);
    }

    const normalizedName = normalize(record.name);
    if (names.has(normalizedName)) {
      errors.push(`${path} duplicate name`);
    }
    names.add(normalizedName);

    if (!categories.has(record.category)) {
      errors.push(`${path} unknown category`);
    }

    if (!KINDS.has(record.kind)) {
      errors.push(`${path} invalid kind`);
    }

    if (!LIFECYCLES.has(record.lifecycle_status)) {
      errors.push(`${path} invalid lifecycle_status`);
    }

    if (!EVIDENCE.has(record.evidence_status)) {
      errors.push(`${path} invalid evidence_status`);
    }

    for (const supportField of [
      'citation_record_support',
      'reference_list_support',
      'authority_data_support',
      'provenance_support',
      'relationship_support'
    ]) {
      if (!SUPPORT.has(record[supportField])) {
        errors.push(`${path}.${supportField} invalid`);
      }
    }

    if (!TRIP_STATUS.has(record.round_trip_status)) {
      errors.push(`${path}.round_trip_status invalid`);
    }

    if (!isStringArray(record.aliases, true)) errors.push(`${path}.aliases invalid`);
    if (!isStringArray(record.serializations, true)) errors.push(`${path}.serializations invalid`);
    if (!isStringArray(record.validation_artifacts, false)) errors.push(`${path}.validation_artifacts invalid`);
    if (!isStringArray(record.supersedes, true)) errors.push(`${path}.supersedes invalid`);
    if (!isStringArray(record.superseded_by, true)) errors.push(`${path}.superseded_by invalid`);
    if (!isStringArray(record.specification_urls, true)) errors.push(`${path}.specification_urls invalid`);
    if (!isStringArray(record.related_schemas, true)) errors.push(`${path}.related_schemas invalid`);

    if (record.official_homepage !== null && !https(record.official_homepage)) {
      errors.push(`${path}.official_homepage must be https or null`);
    }

    if (record.source_accessed_at !== null) {
      const d = new Date(record.source_accessed_at);
      if (Number.isNaN(d.getTime())) {
        errors.push(`${path}.source_accessed_at invalid`);
      }
    }

    if (record.related_schemas.includes(record.id)) {
      errors.push(`${path}.related_schemas self-reference`);
    }

    if (record.lifecycle_status === 'superseded' && !record.superseded_by.length) {
      errors.push(`${path} superseded records require superseded_by`);
    }

    pushCount(byCategory, record.category);
    pushCount(byKind, record.kind);
  }

  if (doc.generated_counts && typeof doc.generated_counts === 'object') {
    if (doc.generated_counts.total_records !== doc.records.length) {
      errors.push('generated_counts.total_records mismatch');
    }

    const countKeys = [
      ['by_category', byCategory],
      ['by_kind', byKind]
    ];

    for (const [field, actual] of countKeys) {
      const expected = doc.generated_counts[field];
      if (!expected || typeof expected !== 'object') {
        errors.push(`generated_counts.${field} missing`);
        continue;
      }

      const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
      for (const key of keys) {
        if ((expected[key] || 0) !== (actual[key] || 0)) {
          errors.push(`generated_counts.${field}.${key} mismatch`);
        }
      }
    }
  }

  return errors;
}

const load = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const resolveFromBase = (baseDir, p) => (path.isAbsolute(p) ? p : path.resolve(baseDir, p));

function selfTest(fixturePath) {
  const fixtureAbs = resolveFromBase(process.cwd(), fixturePath);
  const pack = load(fixtureAbs);
  const repoRoot = path.resolve(process.cwd(), '..');
  const registryPath = resolveFromBase(repoRoot, pack.registry_path);
  const registry = load(registryPath);
  let failures = 0;

  for (const t of pack.valid) {
    const subsetRecords = t.record_ids ? registry.records.filter(record => t.record_ids.includes(record.id)) : registry.records;
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
    const mutated = load(registryPath);
    const target = mutated.records.find(record => record.id === t.record_id);
    if (!target) {
      failures++;
      console.error(`FAIL invalid fixture target missing:${t.name}`);
      continue;
    }
    if (t.mutation.type === 'set_field') {
      target[t.mutation.field] = t.mutation.value;
    } else if (t.mutation.type === 'delete_field') {
      delete target[t.mutation.field];
    } else if (t.mutation.type === 'duplicate_record') {
      mutated.records.push(JSON.parse(JSON.stringify(target)));
      mutated.records[mutated.records.length - 1].id = t.mutation.new_id;
    }
    mutated.generated_counts = recalcCounts(mutated.records);
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
