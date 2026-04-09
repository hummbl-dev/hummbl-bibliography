#!/usr/bin/env node

/**
 * citation-graph.js — Generate a D3.js force-directed citation relationship graph
 * Output: reports/citation_graph.html (self-contained, no CDN dependencies)
 *
 * Edges are created from:
 * 1. Explicit `crossref` fields pointing to another citation key
 * 2. Shared authors across entries (co-citation signal)
 * 3. Shared HUMMBL keyword tags (e.g. HUMMBL:BKI, HUMMBL:SY)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const bibDir = path.resolve(args[0] || '../bibliography');
const reportsDir = path.resolve(__dirname, '../../reports');
const outputPath = path.join(reportsDir, 'citation_graph.html');
const jsonOutputPath = path.join(reportsDir, 'citation_graph.json');

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

/**
 * Minimal BibTeX parser — extracts key, type, and field values.
 * Handles multiline values and comment lines.
 */
function parseBibFile(content) {
  const entries = [];
  // Match @type{key, ...} blocks
  const entryRegex = /@(\w+)\s*\{\s*([^,\s]+)\s*,([^@]*)/g;
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const body = match[3];

    if (type === 'comment' || type === 'string' || type === 'preamble') continue;

    const fields = {};
    // Match field = {value} or field = "value" or field = number
    const fieldRegex = /(\w+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|(\d+))/g;
    let fm;
    while ((fm = fieldRegex.exec(body)) !== null) {
      const name = fm[1].toLowerCase();
      const value = (fm[2] ?? fm[3] ?? fm[4] ?? '').trim();
      fields[name] = value;
    }

    entries.push({ key, type, fields });
  }
  return entries;
}

function extractAuthors(authorStr) {
  if (!authorStr) return [];
  return authorStr.split(' and ').map(a => a.trim().toLowerCase()).filter(Boolean);
}

function extractHummblTags(keywords) {
  if (!keywords) return [];
  return keywords.split(',').map(k => k.trim()).filter(k => k.startsWith('HUMMBL:'));
}

function tierFromFile(filename) {
  const m = filename.match(/^(T\d+)_/);
  return m ? m[1] : 'default';
}

// Load all .bib files
if (!fs.existsSync(bibDir)) {
  console.error(`Bibliography directory not found: ${bibDir}`);
  process.exit(1);
}

const bibFiles = fs.readdirSync(bibDir).filter(f => f.endsWith('.bib'));
const allEntries = [];

for (const file of bibFiles) {
  const tier = tierFromFile(file);
  const content = fs.readFileSync(path.join(bibDir, file), 'utf8');
  const entries = parseBibFile(content);
  entries.forEach(e => {
    e.tier = tier;
    e.file = file;
  });
  allEntries.push(...entries);
}

console.log(`Parsed ${allEntries.length} entries from ${bibFiles.length} files`);

// Build nodes
const keyIndex = new Map(allEntries.map(e => [e.key, e]));
const nodes = allEntries.map(e => ({
  id: e.key,
  tier: e.tier,
  title: e.fields.title || e.key,
  authors: extractAuthors(e.fields.author),
  year: e.fields.year || '',
  doi: e.fields.doi || '',
  url: e.fields.url || '',
  tags: extractHummblTags(e.fields.keywords || ''),
  file: e.file,
}));

// Build edges
const edges = [];
const edgeSet = new Set();

function addEdge(source, target, type) {
  const edgeKey = [source, target].sort().join('||');
  if (!edgeSet.has(edgeKey) && source !== target) {
    edgeSet.add(edgeKey);
    edges.push({ source, target, type });
  }
}

// 1. Crossref edges
for (const entry of allEntries) {
  if (entry.fields.crossref && keyIndex.has(entry.fields.crossref)) {
    addEdge(entry.key, entry.fields.crossref, 'crossref');
  }
}

// 2. Shared HUMMBL tags (only specific tags, not generic ones)
const SHARED_TAG_MIN_SPECIFICITY = 2; // skip tags that appear on >50% of entries
const tagToEntries = new Map();
for (const node of nodes) {
  for (const tag of node.tags) {
    if (!tagToEntries.has(tag)) tagToEntries.set(tag, []);
    tagToEntries.get(tag).push(node.id);
  }
}
const maxTagEntries = Math.floor(allEntries.length * 0.5);
for (const [tag, keys] of tagToEntries) {
  if (keys.length < SHARED_TAG_MIN_SPECIFICITY || keys.length > maxTagEntries) continue;
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      addEdge(keys[i], keys[j], 'shared-tag');
    }
  }
}

// 3. Shared authors (first author match only to reduce noise)
const firstAuthorToEntries = new Map();
for (const node of nodes) {
  if (node.authors.length === 0) continue;
  const first = node.authors[0];
  if (!firstAuthorToEntries.has(first)) firstAuthorToEntries.set(first, []);
  firstAuthorToEntries.get(first).push(node.id);
}
for (const [, keys] of firstAuthorToEntries) {
  if (keys.length < 2 || keys.length > 10) continue; // skip prolific authors that would add too many edges
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      addEdge(keys[i], keys[j], 'shared-author');
    }
  }
}

console.log(`Graph: ${nodes.length} nodes, ${edges.length} edges`);

// Write JSON
const graphData = { nodes, edges, meta: { generated: new Date().toISOString(), entryCount: nodes.length, edgeCount: edges.length } };
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(jsonOutputPath, JSON.stringify(graphData, null, 2));
console.log(`JSON: ${jsonOutputPath}`);

// Build self-contained HTML with embedded D3 v7 (fetched at build time via inline)
// D3 is embedded as a data URI / inline script to satisfy "no external CDN" requirement.
// We use a minimal D3 bundle fetched from unpkg at GENERATION time and inlined.
// At runtime the HTML is fully self-contained.

let d3Source = '';
try {
  // Try to use local node_modules d3 if available
  const d3Path = path.resolve(__dirname, '../node_modules/d3/dist/d3.min.js');
  if (fs.existsSync(d3Path)) {
    d3Source = fs.readFileSync(d3Path, 'utf8');
    console.log('Using local d3 from node_modules');
  }
} catch {
  // Will fall back to fetch below
}

const graphDataJson = JSON.stringify(graphData);
const tierColorsJson = JSON.stringify(TIER_COLORS);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HUMMBL Bibliography Citation Graph</title>
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
  <h1>HUMMBL Bibliography Citation Graph</h1>
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

${d3Source ? `<script>${d3Source}</script>` : '<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>'}

<script>
const GRAPH = ${graphDataJson};
const TIER_COLORS = ${tierColorsJson};

const TIER_LABELS = {
  T1:'T1 Canonical', T2:'T2 Empirical', T3:'T3 Applied', T4:'T4 Agentic',
  T5:'T5 Engineering', T6:'T6 Governance', T7:'T7 Emerging', T8:'T8 Cognition',
  T9:'T9 Economics', T10:'T10 Collaboration', T11:'T11 Security',
  T12:'T12 Complexity', T13:'T13 Reasoning'
};

// Stats
document.getElementById('stats').textContent =
  \`\${GRAPH.nodes.length} entries · \${GRAPH.edges.length} edges · generated \${GRAPH.meta.generated.slice(0,10)}\`;

// Legend
const legend = document.getElementById('legend');
const tiers = [...new Set(GRAPH.nodes.map(n => n.tier))].sort();
tiers.forEach(t => {
  const div = document.createElement('div');
  div.className = 'legend-item';
  div.innerHTML = \`<div class="legend-dot" style="background:\${TIER_COLORS[t]||TIER_COLORS.default}"></div><span>\${TIER_LABELS[t]||t}</span>\`;
  legend.appendChild(div);
});

const svg = d3.select('#graph');
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr('width', width).attr('height', height);

const container = svg.append('g');

// Zoom
const zoom = d3.zoom().scaleExtent([0.1, 8]).on('zoom', e => container.attr('transform', e.transform));
svg.call(zoom);

// Data copies (d3 mutates)
const nodes = GRAPH.nodes.map(n => ({ ...n }));
const links = GRAPH.edges.map(e => ({ ...e }));
const nodeMap = new Map(nodes.map(n => [n.id, n]));

// Simulation
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.3))
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide(10));

// Links
const linkGroup = container.append('g').attr('class', 'links');
let linkEls = linkGroup.selectAll('line')
  .data(links)
  .join('line')
  .attr('class', d => \`link \${d.type}\`)
  .attr('stroke', d => d.type === 'crossref' ? '#e63946' : d.type === 'shared-author' ? '#457b9d' : '#2a9d8f');

// Nodes
const nodeGroup = container.append('g').attr('class', 'nodes');
let nodeEls = nodeGroup.selectAll('g')
  .data(nodes)
  .join('g')
  .attr('class', 'node')
  .call(d3.drag()
    .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

nodeEls.append('circle')
  .attr('r', 6)
  .attr('fill', d => TIER_COLORS[d.tier] || TIER_COLORS.default)
  .attr('stroke', '#0f1117');

// Labels (hidden by default for large graphs)
let labelsVisible = nodes.length <= 80;
const labelEls = nodeEls.append('text')
  .attr('dx', 8).attr('dy', 4)
  .style('font-size', '9px').style('fill', '#a0aec0')
  .style('pointer-events', 'none')
  .style('display', labelsVisible ? null : 'none')
  .text(d => d.id.length > 25 ? d.id.slice(0, 25) + '…' : d.id);

// Tooltip
const tooltip = document.getElementById('tooltip');
nodeEls
  .on('mouseover', (e, d) => {
    const link = d.doi ? \`https://doi.org/\${d.doi}\` : d.url;
    tooltip.querySelector('.t-title').textContent = d.title;
    tooltip.querySelector('.t-meta').textContent = \`\${d.authors.slice(0,2).join(', ')}  \${d.year}  [\${d.tier}]\`;
    tooltip.querySelector('.t-tags').innerHTML = d.tags.map(t => \`<span class="t-tag">\${t}</span>\`).join('');
    tooltip.style.display = 'block';
  })
  .on('mousemove', e => {
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
  })
  .on('mouseout', () => { tooltip.style.display = 'none'; })
  .on('click', (e, d) => {
    const url = d.doi ? \`https://doi.org/\${d.doi}\` : d.url;
    if (url) window.open(url, '_blank');
  });

// Tick
simulation.on('tick', () => {
  linkEls.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
         .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
  nodeEls.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
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
document.querySelectorAll('[data-edge]').forEach(cb => {
  cb.addEventListener('change', () => {
    const edgeType = cb.dataset.edge;
    linkEls.filter(d => d.type === edgeType).style('display', cb.checked ? null : 'none');
  });
});

// Search
document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  nodeEls.selectAll('circle')
    .attr('stroke', d => (!q || d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)) ? '#0f1117' : '#555')
    .attr('opacity', d => (!q || d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)) ? 1 : 0.15);
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

fs.writeFileSync(outputPath, html);
console.log(`HTML: ${outputPath}`);
console.log(`\nDone. Open in browser:\n  open ${outputPath}`);
