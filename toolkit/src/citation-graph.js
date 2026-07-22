#!/usr/bin/env node

/**
 * citation-graph.js — Generate a D3.js force-directed citation relationship graph
 * Output: reports/citation_graph.html (self-contained, no CDN dependencies)
 *
 * Edges are created from:
 * 1. Explicit `crossref` fields pointing to another citation key
 * 2. Shared authors across entries (first-author only)
 * 3. Shared HUMMBL keyword tags (e.g. HUMBL:BKI, HUMBL:SY)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeOutboundUrl } from './citation-graph-url-policy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isScript = process.argv[1] === __filename;

// Tier colors (matching bibliography tier structure)
const TIER_COLORS = {
  T1: '#e63946', // canonical — red
  T2: '#457b9d', // empirical — blue
  T3: '#2a9d8f', // applied — teal
  T4: '#e9c46a', // agentic — yellow
  T5: '#f4a261', // engineering — orange
  T6: '#264653', // governance — dark teal
  T7: '#a8dadc', // emerging — light blue
  T8: '#6d6875', // cognition — purple
  T9: '#b5838d', // economics — rose
  T10: '#e76f51', // collaboration — coral
  T11: '#023e8a', // security — navy
  T12: '#606c38', // complexity — olive
  T13: '#9b2226', // reasoning — deep red
  default: '#adb5bd',
};

const SHARED_TAG_MIN_SPECIFICITY = 2; // skip very common generic tags

function usage() {
  console.log('Usage: node citation-graph.js [bibDir]');
  console.log('');
  console.log('Generate HUMBL citation graph data and HTML from a bibliography directory.');
  console.log('Arguments:');
  console.log('  bibDir    Path to directory of .bib files (default: ../bibliography)');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help  Show this message');
  process.exit(0);
}

export function parseCli(rawArgs = []) {
  const args = rawArgs.slice();
  const positional = args.filter((a) => !a.startsWith('--') && !a.startsWith('-'));
  const hasHelp = args.includes('--help') || args.includes('-h');

  if (hasHelp) {
    usage();
  }

  if (positional.length > 1) {
    throw new Error('Expected at most one positional argument: bibDir');
  }

  const unknown = args.filter((arg) => arg.startsWith('-') && arg !== '--help' && arg !== '-h');
  if (unknown.length > 0) {
    throw new Error(`Unknown option: ${unknown[0]}`);
  }

  const defaultBibDir = fs.existsSync(path.resolve('bibliography'))
    ? path.resolve('bibliography')
    : path.resolve(__dirname, '../bibliography');
  const bibDir = path.resolve(positional[0] || defaultBibDir);
  return { bibDir };
}

/**
 * Minimal BibTeX parser — extracts key, type, and field values.
 * Handles multiline values, nested braces, quoted strings, and `@` inside values.
 */
export function parseBibFile(content) {
  if (typeof content !== 'string') {
    throw new TypeError('parseBibFile(content) expects a string');
  }

  const normalized = content
    .replace(/^\uFEFF/, '')
    .replace(/^\s*%.*$/gm, '')
    .replace(/\r\n/g, '\n');

  const entries = [];
  // Non-sticky global regex: searches forward from lastIndex for the next
  // entry header. Sticky matching would fail when lastIndex lands on the
  // whitespace between entries, causing multi-entry files to parse only the
  // first entry. lastIndex is always advanced past each entry's closing
  // brace (via brace-depth counting below), so this never matches an '@'
  // inside a field value.
  const entryHeader = /@([A-Za-z][A-Za-z0-9_-]*)\s*\{/g;

  let match;
  while ((match = entryHeader.exec(normalized)) !== null) {
    const type = match[1].toLowerCase();
    const matchEnd = match.index + match[0].length;

    // Skip non-rendered entries.
    if (type === 'comment' || type === 'string' || type === 'preamble') {
      // Move to next likely entry boundary by searching the next '\n@'.
      const nextAt = normalized.indexOf('\n@', matchEnd);
      if (nextAt === -1) break;
      entryHeader.lastIndex = nextAt + 1;
      continue;
    }

    const openBrace = matchEnd - 1;
    let cursor = openBrace + 1;

    while (cursor < normalized.length && /\s/.test(normalized[cursor])) {
      cursor += 1;
    }

    const keyStart = cursor;
    while (cursor < normalized.length && normalized[cursor] !== ',') {
      cursor += 1;
    }

    if (cursor >= normalized.length) {
      break;
    }

    const key = normalized.slice(keyStart, cursor).trim();
    const bodyStart = cursor + 1;

    let depth = 1;
    let inQuotes = false;
    let escaped = false;
    let i = bodyStart;
    for (; i < normalized.length; i += 1) {
      const ch = normalized[i];

      if (inQuotes) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inQuotes = false;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === '{') {
        depth += 1;
      } else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }

    if (depth !== 0) {
      // Unbalanced braces: skip to next entry boundary to avoid an infinite loop.
      const nextAt = normalized.indexOf('\n@', bodyStart);
      if (nextAt === -1) {
        break;
      }
      entryHeader.lastIndex = nextAt + 1;
      continue;
    }

    const bodyEnd = i;
    const body = normalized.slice(bodyStart, bodyEnd);

    entries.push({
      type,
      key,
      fields: parseFields(body),
    });

    entryHeader.lastIndex = bodyEnd + 1;
  }

  return entries;
}

function parseFields(body) {
  const fields = {};
  let i = 0;
  const len = body.length;

  while (i < len) {
    // Skip whitespace, commas, and newlines.
    while (i < len && /[\s,]/.test(body[i])) {
      i += 1;
    }

    if (i >= len) {
      break;
    }

    // Comment at field level.
    if (body[i] === '%') {
      while (i < len && body[i] !== '\n') i += 1;
      continue;
    }

    const keyStart = i;
    while (i < len && /[^\s=]/.test(body[i])) {
      i += 1;
    }

    const rawName = body.slice(keyStart, i).trim();
    if (!rawName) {
      i += 1;
      continue;
    }

    while (i < len && /\s/.test(body[i])) {
      i += 1;
    }
    if (body[i] !== '=') {
      while (i < len && body[i] !== ',') i += 1;
      continue;
    }
    i += 1;

    while (i < len && /\s/.test(body[i])) {
      i += 1;
    }

    const parsed = parseValue(body, i);
    fields[rawName.toLowerCase()] = parsed.value;
    i = parsed.nextIndex;
  }

  return fields;
}

function parseValue(text, start) {
  if (start >= text.length) {
    return { value: '', nextIndex: text.length };
  }

  const first = text[start];

  // field = {value...}
  if (first === '{') {
    let i = start + 1;
    let depth = 1;
    let escaped = false;
    let inQuotes = false;
    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (escaped) {
          escaped = false;
          i += 1;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          i += 1;
          continue;
        }
        if (ch === '"') {
          inQuotes = false;
        }
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (ch === '{') {
        depth += 1;
      } else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          return {
            value: text.slice(start + 1, i).trim(),
            nextIndex: i + 1,
          };
        }
      }
      i += 1;
    }

    return {
      value: text.slice(start + 1).trim(),
      nextIndex: text.length,
    };
  }

  // field = "value"
  if (first === '"') {
    let i = start + 1;
    let escaped = false;
    while (i < text.length) {
      const ch = text[i];
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        return {
          value: text.slice(start + 1, i).trim(),
          nextIndex: i + 1,
        };
      }
      i += 1;
    }

    return {
      value: text.slice(start + 1).trim(),
      nextIndex: text.length,
    };
  }

  // fallback: read to next comma (or end)
  let i = start;
  while (i < text.length && text[i] !== ',') {
    i += 1;
  }
  return {
    value: text.slice(start, i).trim(),
    nextIndex: i + 1,
  };
}

export function extractAuthors(authorStr) {
  if (!authorStr) return [];
  return authorStr
    .split(/\s+and\s+/i)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function extractHummblTags(keywords) {
  if (!keywords) return [];
  return keywords
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.startsWith('HUMBL:'));
}

function tierFromFile(filename) {
  const matched = filename.match(/^(T\d+)_/);
  return matched ? matched[1] : 'default';
}

function addEdge(edgeSet, edges, source, target, type) {
  const edgeKey = [source, target].sort().join('||');
  if (!edgeSet.has(edgeKey) && source !== target) {
    edgeSet.add(edgeKey);
    edges.push({ source, target, type });
  }
}

function main({ bibDir }) {
  if (!fs.existsSync(bibDir)) {
    console.error(`Bibliography directory not found: ${bibDir}`);
    process.exit(1);
  }

  if (!fs.statSync(bibDir).isDirectory()) {
    console.error(`Expected a directory for bibDir: ${bibDir}`);
    process.exit(1);
  }

  const bibFiles = fs.readdirSync(bibDir).filter((filename) => filename.endsWith('.bib'));
  if (bibFiles.length === 0) {
    console.error(`No .bib files found in ${bibDir}`);
    process.exit(1);
  }

  const allEntries = [];
  for (const file of bibFiles) {
    const tier = tierFromFile(file);
    const content = fs.readFileSync(path.join(bibDir, file), 'utf8');
    const parsedEntries = parseBibFile(content);

    parsedEntries.forEach((entry) => {
      allEntries.push({
        ...entry,
        tier,
        file,
      });
    });
  }

  console.log(`Parsed ${allEntries.length} entries from ${bibFiles.length} files`);

  // Build nodes
  const keyIndex = new Map(allEntries.map((entry) => [entry.key, entry]));
  const nodes = allEntries.map((entry) => ({
    id: entry.key,
    tier: entry.tier,
    title: entry.fields.title || entry.key,
    authors: extractAuthors(entry.fields.author),
    year: entry.fields.year || '',
    doi: entry.fields.doi || '',
    url: normalizeOutboundUrl(entry.fields.url) || '',
    tags: extractHummblTags(entry.fields.keywords || ''),
    file: entry.file,
  }));

  // Build edges
  const edges = [];
  const edgeSet = new Set();

  for (const entry of allEntries) {
    if (entry.fields.crossref && keyIndex.has(entry.fields.crossref)) {
      addEdge(edgeSet, edges, entry.key, entry.fields.crossref, 'crossref');
    }
  }

  const tagToEntries = new Map();
  for (const node of nodes) {
    for (const tag of node.tags) {
      if (!tagToEntries.has(tag)) {
        tagToEntries.set(tag, []);
      }
      tagToEntries.get(tag).push(node.id);
    }
  }
  const maxTagEntries = Math.floor(allEntries.length * 0.5);
  for (const [tag, keys] of tagToEntries) {
    if (keys.length < SHARED_TAG_MIN_SPECIFICITY || keys.length > maxTagEntries) {
      continue;
    }
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        addEdge(edgeSet, edges, keys[i], keys[j], 'shared-tag');
      }
    }
  }

  const firstAuthorToEntries = new Map();
  for (const node of nodes) {
    if (node.authors.length === 0) continue;
    const first = node.authors[0];
    if (!firstAuthorToEntries.has(first)) {
      firstAuthorToEntries.set(first, []);
    }
    firstAuthorToEntries.get(first).push(node.id);
  }
  for (const [, keys] of firstAuthorToEntries) {
    if (keys.length < 2 || keys.length > 10) continue;
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        addEdge(edgeSet, edges, keys[i], keys[j], 'shared-author');
      }
    }
  }

  console.log(`Graph: ${nodes.length} nodes, ${edges.length} edges`);

  const reportsDir = path.resolve(__dirname, '../../reports');
  const outputPath = path.join(reportsDir, 'citation_graph.html');
  const jsonOutputPath = path.join(reportsDir, 'citation_graph.json');
  const graphData = {
    nodes,
    edges,
    meta: {
      generated: new Date().toISOString(),
      entryCount: nodes.length,
      edgeCount: edges.length,
    },
  };

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonOutputPath, JSON.stringify(graphData, null, 2));
  console.log(`JSON: ${jsonOutputPath}`);

  // D3 is embedded as an inline script; external CDN sources are forbidden.
  const d3Path = path.resolve(__dirname, '../node_modules/d3/dist/d3.min.js');
  if (!fs.existsSync(d3Path)) {
    throw new Error(`Required local D3 bundle not found: ${d3Path}`);
  }
  const d3Source = fs.readFileSync(d3Path, 'utf8');
  console.log('Using local d3 from node_modules');

  const graphDataJson = JSON.stringify(graphData);
  const tierColorsJson = JSON.stringify(TIER_COLORS);

  const html = buildHtml(graphDataJson, tierColorsJson, d3Source);
  fs.writeFileSync(outputPath, html);
  console.log(`HTML: ${outputPath}`);
  console.log(`\nDone. Open in browser:\n  open ${outputPath}`);
}

function buildHtml(graphDataJson, tierColorsJson, d3Source) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HUMBL Bibliography Citation Graph</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f1117; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow: hidden; }
  #header { position: fixed; top: 0; left: 0; right: 0; z-index: 10; background: rgba(15,17,23,0.92); border-bottom: 1px solid #2d3748; padding: 10px 16px; display: flex; align-items: center; gap: 16px; }
  #header h1 { font-size: 14px; font-weight: 600; color: #a0aec0; }
  #stats { font-size: 12px; color: #718096; }
  #controls { display: flex; gap: 8px; margin-left: auto; }
  button { background: #2d3748; border: 1px solid #4a5568; color: #e2e8f0; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
  button:hover { background: #4a5568; }
  #legend { position: fixed; bottom: 16px; left: 16px; z-index: 10; background: rgba(15,17,23,0.92); border: 1px solid #2d3748; border-radius: 6px; padding: 10px; font-size: 11px; }
  #legend h3 { font-size: 11px; color: #718096; margin-bottom: 6px; }
  .legend-item { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  #tooltip { position: fixed; z-index: 20; background: #1a202c; border: 1px solid #4a5568; border-radius: 6px; padding: 10px 12px; font-size: 12px; max-width: 280px; pointer-events: none; display: none; }
  #tooltip .t-title { font-weight: 600; color: #e2e8f0; margin-bottom: 4px; line-height: 1.3; }
  #tooltip .t-meta { color: #718096; font-size: 11px; }
  #tooltip .t-tags { margin-top: 4px; }
  #tooltip .t-tag { display: inline-block; background: #2d3748; color: #a0aec0; border-radius: 3px; padding: 1px 5px; font-size: 10px; margin: 1px; }
  svg { display: block; }
  .node circle { cursor: pointer; stroke-width: 1.5; }
  .node circle:hover { stroke-width: 3; }
  .link { stroke-opacity: 0.3; }
  .link.crossref { stroke: #e63946; stroke-opacity: 0.7; }
  .link.shared-author { stroke: #457b9d; stroke-opacity: 0.25; }
  .link.shared-tag { stroke: #2a9d8f; stroke-opacity: 0.2; }
  #filter-panel { position: fixed; top: 48px; right: 16px; z-index: 10; background: rgba(15,17,23,0.92); border: 1px solid #2d3748; border-radius: 6px; padding: 10px; font-size: 12px; min-width: 160px; }
  #filter-panel h3 { font-size: 11px; color: #718096; margin-bottom: 6px; }
  .filter-item { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; cursor: pointer; }
  .filter-item input { cursor: pointer; }
  #search { background: #2d3748; border: 1px solid #4a5568; color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; width: 100%; margin-bottom: 8px; }
</style>
</head>
<body>
<div id="header">
  <h1>HUMBL Bibliography Citation Graph</h1>
  <span id="stats"></span>
  <div id="controls">
    <button id="btn-reset">Reset View</button>
    <button id="btn-toggle-labels">Toggle Labels</button>
  </div>
</div>

<div id="filter-panel">
  <input id="search" type="text" placeholder="Search entries..." />
  <h3>Edge Types</h3>
  <label class="filter-item"><input type="checkbox" data-edge="crossref" checked> Crossref</label>
  <label class="filter-item"><input type="checkbox" data-edge="shared-author" checked> Shared Author</label>
  <label class="filter-item"><input type="checkbox" data-edge="shared-tag" checked> Shared Tag</label>
</div>

<div id="legend">
  <h3>Tiers</h3>
</div>

<div id="tooltip">
  <div class="t-title"></div>
  <div class="t-meta"></div>
  <div class="t-tags"></div>
</div>

<svg id="graph"></svg>

<script>${d3Source}</script>

<script>
const GRAPH = ${graphDataJson};
const TIER_COLORS = ${tierColorsJson};

const TIER_LABELS = {
  T1:'T1 Canonical', T2:'T2 Empirical', T3:'T3 Applied', T4:'T4 Agentic',
  T5:'T5 Engineering', T6:'T6 Governance', T7:'T7 Emerging', T8:'T8 Cognition',
  T9:'T9 Economics', T10:'T10 Collaboration', T11:'T11 Security',
  T12:'T12 Complexity', T13:'T13 Reasoning'
};

function setText(node, text) {
  node.textContent = text ?? '';
}

function renderTags(container, tags) {
  container.replaceChildren();
  tags.forEach((tag) => {
    const tagNode = document.createElement('span');
    tagNode.className = 't-tag';
    tagNode.textContent = tag;
    container.appendChild(tagNode);
  });
}

function addLegendItem(container, label, color) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const dot = document.createElement('span');
  dot.className = 'legend-dot';
  dot.style.background = color || TIER_COLORS.default;

  const title = document.createElement('span');
  title.textContent = label;

  item.appendChild(dot);
  item.appendChild(title);
  container.appendChild(item);
}

// Stats
 document.getElementById('stats').textContent = GRAPH.nodes.length + ' entries · ' + GRAPH.edges.length + ' edges · generated ' + GRAPH.meta.generated.slice(0, 10);

// Legend
const legend = document.getElementById('legend');
const tiers = [...new Set(GRAPH.nodes.map((node) => node.tier))].sort();
tiers.forEach((tier) => addLegendItem(legend, TIER_LABELS[tier] || tier, TIER_COLORS[tier]));

const svg = d3.select('#graph');
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr('width', width).attr('height', height);

const container = svg.append('g');

// Zoom
const zoom = d3.zoom().scaleExtent([0.1, 8]).on('zoom', (event) => container.attr('transform', event.transform));
svg.call(zoom);

// Data copies (d3 mutates)
const nodes = GRAPH.nodes.map((node) => ({ ...node }));
const links = GRAPH.edges.map((edge) => ({ ...edge }));

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((node) => node.id).distance(60).strength(0.3))
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide(10));

// Links
const linkGroup = container.append('g').attr('class', 'links');
const linkEls = linkGroup.selectAll('line')
  .data(links)
  .join('line')
   .attr('class', (edge) => 'link ' + edge.type)
  .attr('stroke', (edge) => edge.type === 'crossref' ? '#e63946' : edge.type === 'shared-author' ? '#457b9d' : '#2a9d8f');

// Nodes
const nodeGroup = container.append('g').attr('class', 'nodes');
const nodeEls = nodeGroup.selectAll('g')
  .data(nodes)
  .join('g')
  .attr('class', 'node')
  .call(d3.drag()
    .on('start', (event, node) => { if (!event.active) simulation.alphaTarget(0.3).restart(); node.fx = node.x; node.fy = node.y; })
    .on('drag', (event, node) => { node.fx = event.x; node.fy = event.y; })
    .on('end', (event, node) => { if (!event.active) simulation.alphaTarget(0); node.fx = null; node.fy = null; }));

nodeEls.append('circle')
  .attr('r', 6)
  .attr('fill', (node) => TIER_COLORS[node.tier] || TIER_COLORS.default)
  .attr('stroke', '#0f1117');

// Labels (hidden by default for large graphs)
let labelsVisible = nodes.length <= 80;
  const labelEls = nodeEls.append('text')
  .attr('dx', 8).attr('dy', 4)
  .style('font-size', '9px').style('fill', '#a0aec0')
  .style('pointer-events', 'none')
  .style('display', labelsVisible ? null : 'none')
  .text((node) => node.id.length > 25 ? node.id.slice(0, 25) + '…' : node.id);

// Tooltip
const tooltip = document.getElementById('tooltip');
const tooltipTitle = tooltip.querySelector('.t-title');
const tooltipMeta = tooltip.querySelector('.t-meta');
const tooltipTags = tooltip.querySelector('.t-tags');

function showTooltip(event, node) {
  const openPath = node.doi ? 'https://doi.org/' + node.doi : node.url;
  const authorText = node.authors.slice(0, 2).join(', ');
  setText(tooltipTitle, node.title);
  setText(tooltipMeta, authorText + (authorText ? '  ' : '') + (node.year || '') + '  [' + node.tier + ']');
  renderTags(tooltipTags, node.tags || []);
  tooltip.dataset.url = openPath || '';
  tooltip.style.display = 'block';
}

nodeEls
  .on('mouseover', showTooltip)
  .on('mousemove', (event) => {
    tooltip.style.left = (event.clientX + 14) + 'px';
    tooltip.style.top = (event.clientY - 10) + 'px';
  })
  .on('mouseout', () => {
    tooltip.style.display = 'none';
  })
  .on('click', (event, node) => {
    const target = tooltip.dataset.url;
    if (target) {
      window.open(target, '_blank');
    }
  });

// Tick
simulation.on('tick', () => {
  linkEls.attr('x1', (edge) => edge.source.x).attr('y1', (edge) => edge.source.y)
    .attr('x2', (edge) => edge.target.x).attr('y2', (edge) => edge.target.y);
  nodeEls.attr('transform', (node) => 'translate(' + node.x + ',' + node.y + ')');
});

// Controls
document.getElementById('btn-reset').addEventListener('click', () => {
  svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
});

document.getElementById('btn-toggle-labels').addEventListener('click', () => {
  labelsVisible = !labelsVisible;
  labelEls.style('display', labelsVisible ? null : 'none');
});

// Edge type filters
document.querySelectorAll('[data-edge]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const edgeType = checkbox.dataset.edge;
    linkEls.filter((edge) => edge.type === edgeType).style('display', checkbox.checked ? null : 'none');
  });
});

// Search
document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  nodeEls.selectAll('circle')
    .attr('stroke', (node) => (!query || node.id.toLowerCase().includes(query) || node.title.toLowerCase().includes(query)) ? '#0f1117' : '#555')
    .attr('opacity', (node) => (!query || node.id.toLowerCase().includes(query) || node.title.toLowerCase().includes(query)) ? 1 : 0.15);
});

// Resize
window.addEventListener('resize', () => {
  svg.attr('width', window.innerWidth).attr('height', window.innerHeight);
  simulation.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
  simulation.alpha(0.1).restart();
});
</script>
</body>
</html>`;
}

if (isScript) {
  try {
    const parsedArgs = parseCli(process.argv.slice(2));
    main(parsedArgs);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
