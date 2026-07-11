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

const output = buildOutput();

if (process.argv.includes('--check')) {
  checkOutput(output);
} else {
  writeOutput(output);
  console.log(`Wrote ${path.relative(rootDir, OUTPUT)}`);
}
