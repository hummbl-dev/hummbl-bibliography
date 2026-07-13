import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const INPUTS = {
  unifiedBibliography: path.join(rootDir, 'dist', 'unified-bibliography.json'),
  bkiEvidence: path.join(rootDir, 'mappings', 'bki_evidence.json'),
  arcanaCitations: path.join(rootDir, 'mappings', 'arcana_citations.json')
};

const OUTPUT = path.join(rootDir, 'dist', 'scientific-grounding-map.json');
const BIBLIOGRAPHY_DIR = path.join(rootDir, 'bibliography');

const THEMATIC_TIERS = {
  T1: { name: 'Canonical', evidence_tier: 'foundational' },
  T2: { name: 'Empirical', evidence_tier: 'empirical' },
  T3: { name: 'Applied', evidence_tier: 'applied' },
  T4: { name: 'Agentic', evidence_tier: 'emerging' },
  T5: { name: 'Engineering', evidence_tier: 'applied' },
  T6: { name: 'Governance', evidence_tier: 'governance' },
  T7: { name: 'Emerging', evidence_tier: 'emerging' },
  T8: { name: 'Cognition', evidence_tier: 'foundational' },
  T9: { name: 'Economics', evidence_tier: 'foundational' },
  T10: { name: 'Collaboration', evidence_tier: 'empirical' },
  T11: { name: 'Security', evidence_tier: 'empirical' },
  T12: { name: 'Complexity', evidence_tier: 'foundational' },
  T13: { name: 'Reasoning', evidence_tier: 'emerging' }
};

const PAPER_LIKE_TYPES = new Set([
  'article',
  'inproceedings',
  'incollection',
  'proceedings',
  'phdthesis',
  'mastersthesis',
  'techreport',
  'report'
]);

const BOOK_LIKE_TYPES = new Set(['book', 'booklet', 'manual']);

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

const HMBL_TAGS = new Set(['P', 'IN', 'CO', 'DE', 'RE', 'SY']);

function asString(value) {
  return value == null ? '' : String(value).trim();
}

function pickField(entry, candidates) {
  const names = Array.isArray(candidates) ? candidates : [candidates];
  for (const name of names) {
    if (entry && Object.prototype.hasOwnProperty.call(entry, name)) return entry[name];
  }

  const keys = Object.keys(entry || {});
  for (const key of keys) {
    for (const name of names) {
      if (key.toLowerCase() === name.toLowerCase()) return entry[key];
    }
  }
  return undefined;
}

function normalizeKeywordList(value) {
  if (Array.isArray(value)) {
    return [...value]
      .map(item => asString(item).replace(/[{}]/g, '').trim())
      .filter(Boolean)
      .sort();
  }

  if (typeof value !== 'string') return [];

  return value
    .replace(/[{}]/g, '')
    .split(',')
    .map(value => asString(value))
    .filter(Boolean)
    .sort();
}

function isEscaped(text, index) {
  let escapes = 0;
  let cursor = index - 1;
  while (cursor >= 0 && text[cursor] === '\\') {
    escapes += 1;
    cursor -= 1;
  }
  return escapes % 2 === 1;
}

function hasBalancedBraces(value) {
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '{' && !isEscaped(value, i)) depth += 1;
    if (char === '}' && !isEscaped(value, i)) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function normalizeTextValue(value) {
  let text = asString(value).trim();
  if (!text) return '';

  while (text.length > 1) {
    const first = text[0];
    const last = text[text.length - 1];
    if ((first === '{' && last === '}') && hasBalancedBraces(text.slice(1, -1))) {
      text = text.slice(1, -1).trim();
      continue;
    }

    if (first === '"' && last === '"') {
      text = text.slice(1, -1).trim();
      continue;
    }

    break;
  }

  return text
    .replace(/\s+/g, ' ')
    .replace(/\\([{}%_#&$])/g, '$1')
    .trim();
}

function readBibValue(source, start) {
  const rawSegment = source.slice(start);
  const trimmed = rawSegment.trimStart();
  const offset = rawSegment.length - trimmed.length;
  let i = start + offset;
  if (i >= source.length) return { value: '', next: i };

  const first = source[i];
  if (first === '{') {
    let depth = 0;
    for (; i < source.length; i++) {
      const char = source[i];
      if (char === '{' && !isEscaped(source, i)) depth += 1;
      if (char === '}' && !isEscaped(source, i)) {
        depth -= 1;
        if (depth === 0) {
          return { value: source.slice(start + offset, i + 1), next: i + 1 };
        }
      }
    }
    throw new Error(`Malformed brace-delimited field in bibliography file while parsing "${source.slice(start, start + 80)}..."`);
  }

  if (first === '"') {
    for (i += 1; i < source.length; i++) {
      if (source[i] === '"' && !isEscaped(source, i)) {
        return { value: source.slice(start + offset, i + 1), next: i + 1 };
      }
    }
    throw new Error(`Malformed quote-delimited field in bibliography file while parsing "${source.slice(start, start + 80)}..."`);
  }

  while (i < source.length && source[i] !== ',') i += 1;
  return { value: source.slice(start + offset, i).trim(), next: i };
}

function parseBibFields(body) {
  const fields = {};
  let cursor = 0;

  while (cursor < body.length) {
    while (cursor < body.length && (/\s|,/.test(body[cursor]))) cursor += 1;
    if (cursor >= body.length) break;
    if (body[cursor] === '%') {
      const nextLine = body.indexOf('\n', cursor);
      cursor = nextLine < 0 ? body.length : nextLine + 1;
      continue;
    }

    const nameMatch = /^[A-Za-z][A-Za-z0-9_-]*/.exec(body.slice(cursor));
    if (!nameMatch) {
      cursor += 1;
      continue;
    }

    const name = nameMatch[0];
    cursor += name.length;
    while (cursor < body.length && /\s/.test(body[cursor])) cursor += 1;
    if (body[cursor] !== '=') {
      cursor += 1;
      continue;
    }

    cursor += 1;
    const next = readBibValue(body, cursor);
    fields[name.toLowerCase()] = normalizeTextValue(next.value);
    cursor = next.next;

    while (cursor < body.length && body[cursor] !== ',') {
      if (body[cursor] === '\n') break;
      if (!/\s/.test(body[cursor])) break;
      cursor += 1;
    }
    if (body[cursor] === ',') cursor += 1;
  }

  return fields;
}

function parseBibEntriesFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  const header = /@([A-Za-z][A-Za-z0-9_-]*)\s*\{/g;
  let headerMatch = header.exec(raw);

  while (headerMatch !== null) {
    const entryType = headerMatch[1].toLowerCase();
    const openIndex = headerMatch.index + headerMatch[0].lastIndexOf('{');
    const keyStart = openIndex + 1;
    const commaIndex = raw.indexOf(',', keyStart);
    if (commaIndex === -1) {
      throw new Error(`Malformed bibliography entry in ${filePath}: missing key delimiter`);
    }

    const id = asString(raw.slice(keyStart, commaIndex)).trim();
    if (!id) throw new Error(`Malformed bibliography entry in ${filePath}: empty citation key`);

    let depth = 0;
    let closeIndex = -1;
    for (let i = openIndex; i < raw.length; i++) {
      const char = raw[i];
      if (char === '{' && !isEscaped(raw, i)) depth += 1;
      if (char === '}' && !isEscaped(raw, i)) {
        depth -= 1;
        if (depth === 0) {
          closeIndex = i;
          break;
        }
      }
    }

    if (closeIndex < 0) {
      throw new Error(`Malformed bibliography entry "${id}" in ${filePath}: missing closing brace`);
    }

    const body = raw.slice(commaIndex + 1, closeIndex);
    const fields = parseBibFields(body);
    if (!Object.prototype.hasOwnProperty.call(fields, 'title')) {
      throw new Error(`Malformed bibliography entry "${id}" in ${filePath}: missing title`);
    }

    entries.push({
      type: entryType,
      id,
      fields
    });

    header.lastIndex = closeIndex + 1;
    headerMatch = header.exec(raw);
  }

  if (entries.length === 0) {
    throw new Error(`No .bib entries found in ${filePath}`);
  }

  return entries;
}

function normalizeAuthor(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(item => normalizeAuthor(item)).filter(Boolean).join(' and ');
  }
  if (typeof value === 'object') {
    if (value.family && value.given) return `${value.family}, ${value.given}`;
    if (value.family) return value.family;
    if (value.given) return value.given;
    if (value.literal) return value.literal;
  }
  return asString(value);
}

function normalizeYear(value, entry) {
  if (value != null && asString(value) !== '') return asString(value);
  const issued = pickField(entry, ['issued']);
  if (issued && Array.isArray(issued['date-parts']) && issued['date-parts'][0]?.length > 0) {
    return asString(issued['date-parts'][0][0]);
  }
  return '';
}

function tierFromFile(filename) {
  const m = filename.match(/^(T\d+)_/);
  return m ? m[1] : 'Unknown';
}

function normalizeKeywordTags(keywords) {
  return normalizeKeywordList(keywords)
    .filter(keyword => !/^HUMMBL:[A-Za-z]{1,2}$/i.test(keyword));
}

function normalizeTransformationTags(keywords, explicit) {
  const explicitSet = new Set((explicit || []).map(value => asString(value).toUpperCase()).filter(Boolean));
  const keywordSet = new Set(
    normalizeKeywordList(keywords)
      .map(tag => tag.match(/^HUMMBL:([A-Za-z]{1,2})$/i))
      .filter(Boolean)
      .map(match => match[1].toUpperCase())
  );
  const merged = new Set([...explicitSet, ...keywordSet].filter(tag => HMBL_TAGS.has(tag)));
  return [...merged].sort();
}

function normalizeForGroundingCompare(entry, context) {
  const tier = asString(context?.tier || pickField(entry, ['tier', 'bibliography_tier']));
  const tierName = asString(
    context?.tierName ||
      pickField(entry, ['tier_name', 'bibliography_tier_name']) ||
      context?.name
  );
  const id = asString(pickField(entry, ['id', 'citation-key']));
  const type = asString(pickField(entry, ['type'])).toLowerCase().split('-')[0];
  const title = asString(pickField(entry, ['title']));
  const author = normalizeAuthor(pickField(entry, ['author']));
  const year = normalizeYear(pickField(entry, ['year']), entry);
  const doi = asString(pickField(entry, ['doi', 'DOI']));
  const abstract = asString(pickField(entry, ['abstract']));
  const keywordValue = pickField(entry, ['keywords', 'keyword', 'keyw']);
  const keywords = normalizeKeywordTags(keywordValue);
  const transformations = normalizeTransformationTags(keywordValue, pickField(entry, ['transformations']));

  return {
    id,
    type,
    title,
    author,
    year,
    doi,
    abstract,
    keywords,
    transformations,
    tier,
    tier_name: tierName
  };
}

function canonicalString(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalString).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const parts = keys.map(key => `${JSON.stringify(key)}:${canonicalString(value[key])}`);
    return `{${parts.join(',')}}`;
  }
  return JSON.stringify(value);
}

function assertUnifiedBibliographyCurrent(unified) {
  if (!Array.isArray(unified?.entries)) {
    throw new Error('dist/unified-bibliography.json is missing the entries array; regenerate it before grounding build/check.');
  }

  const bibFiles = fs.readdirSync(BIBLIOGRAPHY_DIR).filter(file => file.endsWith('.bib')).sort();
  const fromBib = new Map();

  for (const file of bibFiles) {
    const filePath = path.join(BIBLIOGRAPHY_DIR, file);
    const tier = tierFromFile(file);
    const tierName = THEMATIC_TIERS[tier]?.name || 'Unknown';
    const entries = parseBibEntriesFromFile(filePath);

    if (entries.length === 0) {
      throw new Error(`No valid entries found in ${file} while validating unified bibliography parity`);
    }

    for (const entry of entries) {
      const canonicalEntry = normalizeForGroundingCompare(
        {
          ...entry.fields,
          id: entry.id,
          type: entry.type
        },
        {
          tier,
          tierName
        }
      );
      const key = canonicalEntry.id;
      if (fromBib.has(key)) {
        throw new Error(`Duplicate citation key ${key} found between canonical BibTeX sources`);
      }
      fromBib.set(key, canonicalEntry);
    }
  }

  const fromUnified = new Map();

  for (const entry of unified.entries) {
    const key = asString(entry.id);
    if (!key) {
      throw new Error('dist/unified-bibliography.json contains an entry without an id; regenerate it before grounding build/check.');
    }
    if (fromUnified.has(key)) {
      throw new Error(`dist/unified-bibliography.json contains a duplicate id ${key}`);
    }
    fromUnified.set(
      key,
      normalizeForGroundingCompare(entry, {
        tier: entry.tier || entry.bibliography_tier,
        tierName: entry.tier_name || entry.bibliography_tier_name
      })
    );
  }

  if (fromBib.size !== fromUnified.size) {
    throw new Error('dist/unified-bibliography.json is stale relative to bibliography/**/*.bib; regenerate the normalized export before grounding build/check.');
  }

  for (const [key, expectedEntry] of fromBib) {
    const unifiedEntry = fromUnified.get(key);
    if (!unifiedEntry) {
      throw new Error(`dist/unified-bibliography.json is stale: missing canonical entry ${key}; regenerate the normalized export before grounding build/check.`);
    }
    if (canonicalString(expectedEntry) !== canonicalString(unifiedEntry)) {
      throw new Error(`dist/unified-bibliography.json is stale or mismatched for entry ${key}; regenerate the normalized export before grounding build/check.`);
    }
  }

  if (fromUnified.size !== fromBib.size) {
    throw new Error('dist/unified-bibliography.json is stale relative to bibliography/**/*.bib; regenerate the normalized export before grounding build/check.');
  }
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function extractArxivId(entry) {
  if (typeof entry.doi === 'string') {
    const doiMatch = entry.doi.match(/^10\.48550\/arXiv\.(.+)$/i);
    if (doiMatch) return doiMatch[1];
  }

  const journal = typeof entry.journal === 'string' ? entry.journal : '';
  const note = typeof entry.note === 'string' ? entry.note : '';
  const combined = `${journal} ${note}`;
  const textMatch = combined.match(/arXiv[:\s]+([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
  return textMatch ? textMatch[1] : null;
}

function collectGroundingRefs(bkiEvidence, arcanaCitations) {
  const refs = new Map();

  for (const [sectionKey, sectionValue] of Object.entries(bkiEvidence)) {
    if (sectionKey === '_meta' || !isObject(sectionValue)) continue;
    for (const item of sectionValue.bibliography_entries || []) {
      if (!item || item.status !== 'PRESENT' || !item.key) continue;
      if (!refs.has(item.key)) refs.set(item.key, []);
      refs.get(item.key).push({
        surface: 'bki_evidence',
        section: sectionKey,
        role: 'supporting_entry',
        strength: item.strength || null,
        note: item.relevance || null
      });
    }
  }

  for (const [lensKey, lensValue] of Object.entries(arcanaCitations)) {
    if (lensKey === '_meta' || !isObject(lensValue)) continue;
    for (const role of ['primary', 'secondary']) {
      for (const key of lensValue[role] || []) {
        if (!refs.has(key)) refs.set(key, []);
        refs.get(key).push({
          surface: 'arcana_citations',
          section: lensKey,
          role,
          strength: role === 'primary' ? 'STRONG' : 'MODERATE',
          note: lensValue.lens || null
        });
      }
    }
  }

  return refs;
}

function debtPriority(entry, evidenceTier, refs, field) {
  let score = 0;
  if (refs.length > 0) score += 3;
  if (evidenceTier === 'empirical') score += 2;
  else if (evidenceTier === 'governance' || evidenceTier === 'emerging' || evidenceTier === 'applied') score += 1;
  if (PAPER_LIKE_TYPES.has(entry.type)) score += 1;
  if (entry.transformations.length >= 3) score += 1;
  if (field === 'isbn' && BOOK_LIKE_TYPES.has(entry.type)) score += 1;

  if (score >= 5) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function buildMetadataDebt(entry, evidenceTier, refs) {
  const debt = [];
  const arxivId = extractArxivId(entry);

  if (PAPER_LIKE_TYPES.has(entry.type) && !entry.doi) {
    debt.push({
      field: 'doi',
      priority: debtPriority(entry, evidenceTier, refs, 'doi'),
      reason: refs.length > 0
        ? 'Referenced in downstream grounding surfaces and missing DOI.'
        : 'Paper-like entry should carry a DOI when available.'
    });
  }

  if (BOOK_LIKE_TYPES.has(entry.type) && !entry.isbn) {
    debt.push({
      field: 'isbn',
      priority: debtPriority(entry, evidenceTier, refs, 'isbn'),
      reason: 'Book-like entry should carry an ISBN when available.'
    });
  }

  if (arxivId && !entry.arxiv_id) {
    debt.push({
      field: 'arxiv_id',
      priority: refs.length > 0 ? 'medium' : 'low',
      reason: 'arXiv identifier is inferable from current metadata but not exposed as a first-class field.'
    });
  }

  return { arxivId, debt };
}

function sourceStatus(entry, debt, refs) {
  if (debt.length === 0) return 'ready';
  if (refs.length > 0) return 'grounding_gap';
  if (entry.evidence_tier === 'empirical' || entry.evidence_tier === 'governance' || entry.evidence_tier === 'emerging') {
    return 'priority_metadata_debt';
  }
  return 'metadata_debt';
}

function normalizeEntry(rawEntry, refsByKey) {
  const tierInfo = THEMATIC_TIERS[rawEntry.tier] || { name: rawEntry.tier_name || 'Unknown', evidence_tier: 'foundational' };
  const refs = refsByKey.get(rawEntry.id) || [];
  const normalizedType = String(rawEntry.type || 'misc').toLowerCase();
  const transformations = Array.isArray(rawEntry.transformations) ? [...rawEntry.transformations].sort() : [];

  const baseEntry = {
    key: rawEntry.id,
    title: rawEntry.title,
    author: rawEntry.author,
    year: rawEntry.year,
    type: normalizedType,
    bibliography_tier: rawEntry.tier,
    bibliography_tier_name: tierInfo.name,
    evidence_tier: tierInfo.evidence_tier,
    transformations,
    has_doi: Boolean(rawEntry.doi),
    doi: rawEntry.doi || null,
    has_isbn: Boolean(rawEntry.isbn),
    isbn: rawEntry.isbn || null,
    journal: rawEntry.journal || null,
    keywords: rawEntry.keywords || [],
    downstream_refs: refs
  };

  const { arxivId, debt } = buildMetadataDebt(baseEntry, tierInfo.evidence_tier, refs);
  baseEntry.arxiv_id = arxivId;
  baseEntry.source_status = sourceStatus({ evidence_tier: tierInfo.evidence_tier }, debt, refs);
  baseEntry.metadata_debt = debt;
  return baseEntry;
}

function sortDebtPriority(priority) {
  return ['critical', 'high', 'medium', 'low'].indexOf(priority);
}

function buildOutput() {
  const unified = readJson(INPUTS.unifiedBibliography);
  assertUnifiedBibliographyCurrent(unified);
  const bkiEvidence = readJson(INPUTS.bkiEvidence);
  const arcanaCitations = readJson(INPUTS.arcanaCitations);
  const refsByKey = collectGroundingRefs(bkiEvidence, arcanaCitations);
  const sources = unified.entries.map(entry => normalizeEntry(entry, refsByKey));

  const metadataDebt = sources
    .flatMap(source =>
      source.metadata_debt.map(item => ({
        key: source.key,
        title: source.title,
        bibliography_tier: source.bibliography_tier,
        evidence_tier: source.evidence_tier,
        field: item.field,
        priority: item.priority,
        reason: item.reason,
        downstream_refs: source.downstream_refs
      }))
    )
    .sort((a, b) => {
      const prioDelta = sortDebtPriority(a.priority) - sortDebtPriority(b.priority);
      if (prioDelta !== 0) return prioDelta;
      return a.key.localeCompare(b.key);
    });

  const summary = {
    total_sources: sources.length,
    thematic_tiers: Object.fromEntries(
      Object.keys(THEMATIC_TIERS).map(tier => [tier, sources.filter(source => source.bibliography_tier === tier).length])
    ),
    evidence_tiers: {
      foundational: sources.filter(source => source.evidence_tier === 'foundational').length,
      empirical: sources.filter(source => source.evidence_tier === 'empirical').length,
      applied: sources.filter(source => source.evidence_tier === 'applied').length,
      governance: sources.filter(source => source.evidence_tier === 'governance').length,
      emerging: sources.filter(source => source.evidence_tier === 'emerging').length
    },
    downstream_ref_coverage: {
      bki_evidence: sources.filter(source => source.downstream_refs.some(ref => ref.surface === 'bki_evidence')).length,
      arcana_citations: sources.filter(source => source.downstream_refs.some(ref => ref.surface === 'arcana_citations')).length
    },
    metadata_debt: {
      critical: metadataDebt.filter(item => item.priority === 'critical').length,
      high: metadataDebt.filter(item => item.priority === 'high').length,
      medium: metadataDebt.filter(item => item.priority === 'medium').length,
      low: metadataDebt.filter(item => item.priority === 'low').length
    }
  };

  return {
    schema_version: '0.1.0',
    interface_status: 'draft',
    source_of_truth: 'bibliography/**/*.bib',
    derived_from: {
      unified_bibliography: {
        path: 'dist/unified-bibliography.json',
        version: unified.version,
        generated: unified.generated
      },
      mappings: [
        {
          path: 'mappings/bki_evidence.json',
          version: bkiEvidence._meta?.version || null,
          generated: bkiEvidence._meta?.generated || null
        },
        {
          path: 'mappings/arcana_citations.json',
          version: arcanaCitations._meta?.version || null,
          generated: arcanaCitations._meta?.generated || null
        }
      ]
    },
    downstream_citation_contract: {
      cite_by: 'bibliography key',
      import_artifact: 'dist/scientific-grounding-map.json',
      duplication_rule: 'Downstream repos should reference bibliography keys and repository paths, not copy full citation records.',
      allowed_support_labels: ['direct', 'adjacent', 'gap'],
      note: 'Evidence tier is a routing hint for downstream claim hygiene, not a claim-validation verdict.'
    },
    validation_commands: [
      'npm run validate',
      'npm run check-dups',
      'npm run grounding:check',
      'npm test'
    ],
    summary,
    sources,
    metadata_debt: metadataDebt
  };
}

function writeOutput(output) {
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
}

function checkOutput(output) {
  if (!fs.existsSync(OUTPUT)) {
    console.error(`Missing ${path.relative(rootDir, OUTPUT)}. Run npm run grounding:build.`);
    process.exit(1);
  }

  const existing = fs.readFileSync(OUTPUT, 'utf8');
  const next = `${JSON.stringify(output, null, 2)}\n`;
  if (existing !== next) {
    console.error(`Scientific grounding export is stale: ${path.relative(rootDir, OUTPUT)}`);
    console.error('Run npm run grounding:build and commit the updated artifact.');
    process.exit(1);
  }

  console.log(`✓ Scientific grounding export is current (${path.relative(rootDir, OUTPUT)})`);
}

const isScript = process.argv[1] === fileURLToPath(import.meta.url);
if (isScript) {
  const output = buildOutput();

  if (process.argv.includes('--check')) {
    checkOutput(output);
  } else {
    writeOutput(output);
    console.log(`Wrote ${path.relative(rootDir, OUTPUT)}`);
  }
}

export {
  parseBibEntriesFromFile,
  normalizeForGroundingCompare,
  normalizeAuthor,
  normalizeYear,
  normalizeKeywordTags,
  normalizeTransformationTags,
  normalizeKeywordList,
  tierFromFile,
  asString,
  pickField,
  THEMATIC_TIERS,
  BIBLIOGRAPHY_DIR,
};
