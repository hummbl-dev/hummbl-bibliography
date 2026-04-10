/**
 * Memory Palace — Governed Extension Registry for Beyond-Base120 Mental Models
 *
 * Architecture:
 * - Base120 is a closed, versioned canon: 6 transformations × 20 models = 120.
 *   It is validated by validateModelCode.ts. No model enters Base120 without a
 *   formal extension process and SemVer bump.
 *
 * - The Memory Palace is an open, governed extension library: philosophical lenses,
 *   enacted governance archetypes, domain frameworks, and cross-disciplinary models
 *   that are VALID and GOVERNED but do not (yet) have a Base120 code.
 *
 *   Every entry in the Memory Palace must be registered here with:
 *     - A unique slug (kebab-case, e.g. "antifragility")
 *     - A source room (category / origin cluster)
 *     - A canonical name (how it appears in text)
 *     - Aliases (variant names that should resolve to the same entry)
 *     - A source reference (where the model originates)
 *     - Optional Base120 candidate code (if it's being nominated for promotion)
 *
 * Drift detection: if a model appears in content with a name that does NOT match
 * any canonical name or alias in this registry, it is flagged as UNREGISTERED.
 *
 * Duplicate detection: if two entries share a canonical name or alias, the registry
 * fails to load (hard error).
 *
 * Promotion path: an entry with a candidate_code may be promoted to Base120 via
 * the standard extension process. At promotion, it is removed from Memory Palace
 * and added to BASE120_MODELS in validateModelCode.ts.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryPalaceRoom =
  | 'ARCANA'        // Philosophical lenses from the ARCANA 28-agent platform
  | 'PRAXIS'        // Enacted governance archetypes (Aurelius, Cincinnatus, etc.)
  | 'BKI'           // Belonging as Knowledge Infrastructure cluster
  | 'TALEB'         // Nassim Taleb framework (Antifragility, Black Swan, etc.)
  | 'SYSTEMS'       // Systems thinking beyond Base120 SY models
  | 'EPISTEMICS'    // Epistemology and reasoning models
  | 'DOMAIN'        // Domain-specific models (healthcare, finance, etc.)
  | 'PENDING';      // Nominated but not yet assigned to a room

export interface MemoryPalaceEntry {
  slug: string;                      // Unique kebab-case identifier
  room: MemoryPalaceRoom;            // Organisational category
  canonical_name: string;            // How this model appears in governed text
  aliases: readonly string[];        // Variant names that resolve to this entry
  source: string;                    // Origin (author, work, platform)
  description: string;               // One-line description
  candidate_code?: string;           // Base120 nomination code, if any (e.g. "SY21")
  tags: readonly string[];           // Search / filter tags
}

// ---------------------------------------------------------------------------
// Memory Palace Registry
// ---------------------------------------------------------------------------

export const MEMORY_PALACE: readonly MemoryPalaceEntry[] = [

  // ── TALEB cluster ─────────────────────────────────────────────────────────

  {
    slug: 'antifragility',
    room: 'TALEB',
    canonical_name: 'Antifragility',
    aliases: ['Anti-fragility', 'antifragile'],
    source: 'Nassim Nicholas Taleb, Antifragile (2012)',
    description: 'Systems that gain from disorder, uncertainty, and volatility',
    tags: ['risk', 'resilience', 'uncertainty', 'taleb'],
  },
  {
    slug: 'black-swan',
    room: 'TALEB',
    canonical_name: 'Black Swan',
    aliases: ['Black Swan Event', 'black swan theory'],
    source: 'Nassim Nicholas Taleb, The Black Swan (2007)',
    description: 'High-impact unpredictable events rationalized in hindsight',
    tags: ['risk', 'uncertainty', 'prediction', 'taleb'],
  },
  {
    slug: 'skin-in-the-game',
    room: 'TALEB',
    canonical_name: 'Skin in the Game',
    aliases: ['skin-in-the-game', 'risk-bearing alignment'],
    source: 'Nassim Nicholas Taleb, Skin in the Game (2018)',
    description: 'Alignment of decision-making with risk-bearing as governance mechanism',
    tags: ['governance', 'incentives', 'accountability', 'taleb'],
  },
  {
    slug: 'via-negativa',
    room: 'TALEB',
    canonical_name: 'Via Negativa',
    aliases: ['subtraction principle'],
    source: 'Nassim Nicholas Taleb; apophatic theology tradition',
    description: 'Improvement through subtraction rather than addition',
    tags: ['design', 'simplicity', 'taleb'],
  },
  {
    slug: 'lindy-effect',
    room: 'TALEB',
    canonical_name: 'Lindy Effect',
    aliases: ['Lindy', 'lindy filter'],
    source: 'Nassim Nicholas Taleb (formalised), Benoit Mandelbrot',
    description: 'Expected lifespan of non-perishable things scales with current age',
    tags: ['longevity', 'time', 'durability', 'taleb'],
  },
  {
    slug: 'survivorship-bias',
    room: 'TALEB',
    canonical_name: 'Survivorship Bias',
    aliases: ['Survivorship bias', 'survival bias'],
    source: 'Abraham Wald (WWII), popularised by Taleb',
    description: 'Focusing on survivors while ignoring those that failed',
    tags: ['bias', 'statistics', 'reasoning'],
  },
  {
    slug: 'fat-tails',
    room: 'TALEB',
    canonical_name: 'Fat Tails',
    aliases: ['fat-tail', 'heavy tails', 'power law tails'],
    source: 'Nassim Nicholas Taleb, The Statistical Consequences of Fat Tails (2020)',
    description: 'Extreme events underweighted by standard statistical models',
    tags: ['statistics', 'risk', 'distribution', 'taleb'],
  },

  // ── EPISTEMICS ─────────────────────────────────────────────────────────────

  {
    slug: 'ooda-loop',
    room: 'EPISTEMICS',
    canonical_name: 'OODA Loop',
    aliases: ['OODA', 'ooda loop', 'observe-orient-decide-act'],
    source: 'Colonel John Boyd, USAF (1970s)',
    description: 'Observe-Orient-Decide-Act decision cycle for dynamic environments',
    tags: ['decision-making', 'military', 'strategy', 'cycles'],
  },
  {
    slug: 'circle-of-competence',
    room: 'EPISTEMICS',
    canonical_name: 'Circle of Competence',
    aliases: ['circle of competence', 'competence boundary'],
    source: 'Warren Buffett and Charlie Munger, Berkshire Hathaway letters',
    description: 'Knowing the boundaries of one\'s reliable knowledge domain',
    tags: ['epistemics', 'decision-making', 'humility'],
  },
  {
    slug: 'map-vs-territory',
    room: 'EPISTEMICS',
    canonical_name: 'Map vs Territory',
    aliases: ['Map is not the Territory', 'map-territory distinction'],
    source: 'Alfred Korzybski, Science and Sanity (1933)',
    description: 'Models of reality are not reality itself; confusing them is a category error',
    tags: ['epistemics', 'representation', 'abstraction'],
  },
  {
    slug: 'occams-razor',
    room: 'EPISTEMICS',
    canonical_name: "Occam's Razor",
    aliases: ["Occam's razor", "Ockham's razor", 'parsimony principle'],
    source: 'William of Ockham (~1320)',
    description: 'Prefer the simplest explanation that fits the evidence',
    tags: ['epistemics', 'simplicity', 'reasoning'],
  },
  {
    slug: 'hanlons-razor',
    room: 'EPISTEMICS',
    canonical_name: "Hanlon's Razor",
    aliases: ["Hanlon's razor"],
    source: 'Robert J. Hanlon (attributed)',
    description: 'Never attribute to malice what can be explained by incompetence',
    tags: ['epistemics', 'attribution', 'reasoning'],
  },
  {
    slug: 'regression-to-mean',
    room: 'EPISTEMICS',
    canonical_name: 'Regression to the Mean',
    aliases: ['regression toward the mean', 'mean reversion'],
    source: 'Francis Galton (1886)',
    description: 'Extreme measurements tend toward the average on re-measurement',
    tags: ['statistics', 'bias', 'prediction'],
  },

  // ── ARCANA lenses ─────────────────────────────────────────────────────────

  {
    slug: 'mimetic-desire',
    room: 'ARCANA',
    canonical_name: 'Mimetic Desire',
    aliases: ['mimetic theory', 'triangular desire'],
    source: 'René Girard, Deceit, Desire and the Novel (1961)',
    description: 'Desire is borrowed from models/rivals, not intrinsic to objects',
    tags: ['girard', 'desire', 'social', 'arcana'],
  },
  {
    slug: 'scapegoat-mechanism',
    room: 'ARCANA',
    canonical_name: 'Scapegoat Mechanism',
    aliases: ['scapegoating', 'sacrificial mechanism'],
    source: 'René Girard, The Scapegoat (1982)',
    description: 'Communities resolve mimetic crises through unanimous violence against an arbitrary victim',
    tags: ['girard', 'violence', 'social', 'arcana'],
  },

  // ── PRAXIS lenses ─────────────────────────────────────────────────────────

  {
    slug: 'aurelius',
    room: 'PRAXIS',
    canonical_name: 'Aurelius Lens',
    aliases: ['Marcus Aurelius', 'Reluctant Sovereign'],
    source: 'Marcus Aurelius, Meditations (167–180 CE); PRAXIS module v0.1',
    description: 'Power exercised with continuous self-audit; governance as private practice made institutional',
    tags: ['praxis', 'stoicism', 'governance', 'accountability'],
  },
  {
    slug: 'cincinnatus',
    room: 'PRAXIS',
    canonical_name: 'Cincinnatus Lens',
    aliases: ['Cincinnatus', 'Temporary Sovereign'],
    source: 'Lucius Quinctius Cincinnatus (458 BCE); PRAXIS module v0.1',
    description: 'Legitimacy through voluntary relinquishment of authority',
    tags: ['praxis', 'governance', 'accountability', 'kill-switch'],
  },
  {
    slug: 'demerzel',
    room: 'PRAXIS',
    canonical_name: 'Demerzel Lens',
    aliases: ['Demerzel', 'R. Daneel Olivaw', 'Governor in Plain Sight'],
    source: 'Isaac Asimov, Foundation series; PRAXIS module v0.1',
    description: 'Governance through architecture, defaults, and incentives — not command',
    tags: ['praxis', 'governance', 'architecture', 'psychohistory'],
  },
  {
    slug: 'prospero',
    room: 'PRAXIS',
    canonical_name: 'Prospero Lens',
    aliases: ['Prospero', 'Knowledge Architect'],
    source: 'Shakespeare, The Tempest (1611); PRAXIS module v0.1',
    description: 'Governance through information asymmetry and model opacity',
    tags: ['praxis', 'governance', 'information', 'transparency'],
  },
  {
    slug: 'janus',
    room: 'PRAXIS',
    canonical_name: 'Janus Lens',
    aliases: ['Janus', 'Threshold Guardian'],
    source: 'Roman mythology; PRAXIS module v0.1',
    description: 'State management at transitions — onboarding, handoffs, version changes',
    tags: ['praxis', 'governance', 'transitions', 'handoff'],
  },
  {
    slug: 'mond',
    room: 'PRAXIS',
    canonical_name: 'Mond Lens',
    aliases: ['Mustapha Mond', 'Architect of Consent'],
    source: 'Aldous Huxley, Brave New World (1932); PRAXIS module v0.1',
    description: 'Governance by shaping what is thinkable, not by direct force',
    tags: ['praxis', 'governance', 'consent', 'power'],
  },

  // ── BKI cluster ───────────────────────────────────────────────────────────

  {
    slug: 'belonging-infrastructure',
    room: 'BKI',
    canonical_name: 'Belonging Infrastructure',
    aliases: ['BKI', 'Belonging as Knowledge Infrastructure'],
    source: 'HUMMBL BKI framework; Walton & Cohen 2011; Edmondson 1999',
    description: 'Belonging as structural precondition for knowledge creation and transmission',
    tags: ['bki', 'belonging', 'knowledge', 'governance'],
  },
  {
    slug: 'biocognitive-os',
    room: 'BKI',
    canonical_name: 'Biocognitive OS',
    aliases: ['Biocognitive Operating System', 'BKI OS'],
    source: 'HUMMBL BKI framework',
    description: 'Six cognitive modes humans shift through depending on belonging conditions',
    tags: ['bki', 'cognition', 'belonging', 'modes'],
  },

];

// ---------------------------------------------------------------------------
// Registry utilities
// ---------------------------------------------------------------------------

/**
 * Build a lookup map from canonical name + all aliases → entry.
 * Throws on duplicate names (registry integrity check).
 */
function buildLookupMap(): Map<string, MemoryPalaceEntry> {
  const map = new Map<string, MemoryPalaceEntry>();

  for (const entry of MEMORY_PALACE) {
    const keys = [entry.canonical_name, ...entry.aliases];
    for (const key of keys) {
      const lower = key.toLowerCase();
      if (map.has(lower)) {
        throw new Error(
          `Memory Palace duplicate: "${key}" appears in both "${map.get(lower)!.slug}" and "${entry.slug}"`
        );
      }
      map.set(lower, entry);
    }
  }

  return map;
}

const _lookupMap = buildLookupMap();

/**
 * Look up a Memory Palace entry by canonical name or alias (case-insensitive).
 * Returns null if not found.
 */
export function lookupMemoryPalace(name: string): MemoryPalaceEntry | null {
  return _lookupMap.get(name.toLowerCase()) ?? null;
}

/**
 * Check if a term is a registered Memory Palace model (canonical or alias).
 */
export function isMemoryPalaceModel(name: string): boolean {
  return _lookupMap.has(name.toLowerCase());
}

/**
 * Get all entries for a given room.
 */
export function getRoom(room: MemoryPalaceRoom): MemoryPalaceEntry[] {
  return MEMORY_PALACE.filter(e => e.room === room);
}

/**
 * Get all canonical names (for drift detection scanning).
 */
export function getAllCanonicalNames(): string[] {
  return MEMORY_PALACE.map(e => e.canonical_name);
}

/**
 * Get all aliases across all entries (for alias scanning).
 */
export function getAllAliases(): string[] {
  return MEMORY_PALACE.flatMap(e => [...e.aliases]);
}

/**
 * Get all slugs (for uniqueness checks).
 */
export function getAllSlugs(): string[] {
  return MEMORY_PALACE.map(e => e.slug);
}

/**
 * Registry health check: returns duplicate slugs, duplicate names, and
 * any entries with missing required fields.
 */
export function auditRegistry(): {
  duplicateSlugs: string[];
  duplicateNames: string[];
  missingFields: Array<{ slug: string; fields: string[] }>;
  totalEntries: number;
  byRoom: Record<string, number>;
} {
  const slugs = getAllSlugs();
  const duplicateSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);

  const allNames = MEMORY_PALACE.flatMap(e => [e.canonical_name, ...e.aliases]);
  const lowerNames = allNames.map(n => n.toLowerCase());
  const duplicateNames = allNames.filter((_, i) => lowerNames.indexOf(lowerNames[i]) !== i);

  const missingFields = MEMORY_PALACE
    .map(e => {
      const missing: string[] = [];
      if (!e.slug) missing.push('slug');
      if (!e.canonical_name) missing.push('canonical_name');
      if (!e.source) missing.push('source');
      if (!e.description) missing.push('description');
      return { slug: e.slug || '(unknown)', fields: missing };
    })
    .filter(r => r.fields.length > 0);

  const byRoom = {} as Record<string, number>;
  for (const e of MEMORY_PALACE) {
    byRoom[e.room] = (byRoom[e.room] ?? 0) + 1;
  }

  return {
    duplicateSlugs,
    duplicateNames,
    missingFields,
    totalEntries: MEMORY_PALACE.length,
    byRoom,
  };
}
