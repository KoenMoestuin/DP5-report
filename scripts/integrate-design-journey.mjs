#!/usr/bin/env node
/**
 * Integrates standalone Design Journey HTML into index.html
 * using the same conventions as the previous embed:
 * - CSS scoped under .dj-embed
 * - SVG defs prefixed with dj-
 * - images/ → assets/design-journey/
 * - section ids prefixed with dj-
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'Design journey midterm report-3/index.html');
const TARGET = path.join(ROOT, 'index.html');

const source = fs.readFileSync(SOURCE, 'utf8');

// --- Extract inline CSS from standalone ---
const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error('No <style> block found in source');
let rawCss = styleMatch[1];

// Drop standalone-only globals
rawCss = rawCss
  .replace(/^\s*\*\s*\{[^}]+\}/m, '')
  .replace(/^\s*html\s*\{[^}]+\}/m, '')
  .replace(/^\s*body\s*\{[^}]+\}/m, '');

// Drop intro / rail / bridge blocks (not embedded in report)
const skipBlocks = [
  /\/\* ============ PAGE INTRO ============ \*\/[\s\S]*?(?=\/\* ============|$)/,
  /\/\* progress rail[\s\S]*?@media \(max-width: 1080px\) \{ \.rail \{ display: none; \} \}/,
  /\/\* ============ BRIDGE ============ \*\/[\s\S]*?(?=\/\* ============ SPRINT 1)/,
];
for (const re of skipBlocks) rawCss = rawCss.replace(re, '');

// Scope selectors under .dj-embed
function scopeCss(css) {
  const tokens = [];
  let i = 0;
  const tokenize = (input) => {
    const out = [];
    let j = 0;
    while (j < input.length) {
      if (input[j] === '@') {
        const m = input.slice(j).match(/^@(media|keyframes)[^{]+(\{)/);
        if (m) {
          const start = j;
          j += m[0].length;
          let depth = 1;
          while (j < input.length && depth) {
            if (input[j] === '{') depth++;
            else if (input[j] === '}') depth--;
            j++;
          }
          out.push({ type: 'at', text: input.slice(start, j) });
          continue;
        }
      }
      if (input[j] === '/' && input[j + 1] === '*') {
        const end = input.indexOf('*/', j + 2);
        out.push({ type: 'comment', text: input.slice(j, end + 2) });
        j = end + 2;
        continue;
      }
      if (input[j] === '{') {
        const selStart = j;
        while (j > 0 && /\s/.test(input[j - 1])) j--;
        // walk back to selector start
        let k = j;
        while (k > 0 && input[k - 1] !== '}' && input[k - 1] !== ';' && !(input[k - 1] === '/' && input[k - 2] === '*')) k--;
        const selector = input.slice(k, selStart).trim();
        j = selStart + 1;
        let depth = 1;
        const bodyStart = j;
        while (j < input.length && depth) {
          if (input[j] === '{') depth++;
          else if (input[j] === '}') depth--;
          j++;
        }
        out.push({ type: 'rule', selector, body: input.slice(bodyStart, j - 1) });
        continue;
      }
      j++;
    }
    return out;
  };

  const parts = tokenize(css);
  const scoped = [];

  const prefixSelector = (sel) => {
    if (!sel.trim()) return sel;
    return sel
      .split(',')
      .map((s) => {
        s = s.trim();
        if (!s) return s;
        if (s.startsWith('.dj-embed')) return s;
        if (s.startsWith('@')) return s;
        return `.dj-embed ${s}`;
      })
      .join(', ');
  };

  for (const part of parts) {
    if (part.type === 'comment') scoped.push(part.text);
    else if (part.type === 'at') {
      const inner = part.text.replace(/\{([\s\S]*)\}$/, (_, body) => `{${scopeCss(body)}}`);
      scoped.push(inner);
    } else if (part.type === 'rule') {
      scoped.push(`${prefixSelector(part.selector)} {${part.body}}`);
    }
  }
  return scoped.join('\n');
}

const scopedCss = scopeCss(rawCss);

const embedCss = `/* ============================================================
   DESIGN JOURNEY EMBED — scoped under .dj-embed
   Mirrors the standalone "Design journey midterm report" layout
   ============================================================ */
.dj-embed {
  /* ---------- design tokens (from report_tokens.css) ---------- */
  --rp-bg:        #F1ECE2;
  --rp-bg-deep:   #E6E0D2;
  --rp-card:      #FFFFFF;
  --rp-ink:       #0A0A0A;
  --rp-ink-soft:  #2A2620;
  --rp-muted:     #847C70;
  --rp-line:      #0A0A0A;
  --rp-line-soft: #C9C2B3;
  --rp-s1: #FF3B1F;
  --rp-s2: #FFC629;
  --rp-s3: #1E3CFF;
  --rp-s4: #00B86A;
  --rp-s5: #B53BFF;
  --rp-s6: #FF7AB3;
  --rp-phase-framing:    var(--rp-ink);
  --rp-phase-concepting: var(--rp-s3);
  --rp-phase-viz:        var(--rp-s1);
  --rp-phase-eval:       var(--rp-s4);
  --rp-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --rp-body:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --rp-bw:       1.5px;
  --rp-bw-bold:  2px;
  --rp-shadow-card:  5px 5px 0 rgba(10,10,10,0.09);
  --rp-shadow-hard:  5px 5px 0 var(--rp-ink);
  --rp-shadow-deep:  8px 8px 0 var(--rp-ink);

  margin: 48px calc(-1 * var(--gutter, 32px)) 0;
  width: auto;
  max-width: none;
  background: var(--rp-bg);
  color: var(--rp-ink);
  font-family: var(--rp-body);
  border-top: var(--rp-bw-bold) solid var(--rp-ink);
}
.dj-embed * { box-sizing: border-box; }

${scopedCss}

@media print {
  .dj-embed {
    width: 100% !important;
    margin: 12px 0 0;
    border-top-width: 1px;
  }
  .dj-embed .phase {
    min-height: 0;
    padding: 14px 0 10px;
    page-break-inside: avoid;
  }
  .dj-embed .ph-num { font-size: 28pt; }
  .dj-embed .ph-title { font-size: 14pt; }
  .dj-embed .eyebrow,
  .dj-embed .meta-stat,
  .dj-embed .ph-stripe .lbl { font-size: 7pt; }
  .dj-embed .diagram-wrap { max-width: 100%; }
  .dj-embed .phase[data-phase="sprint1"] .diagram-wrap,
  .dj-embed .phase[data-phase="sprint2"] .diagram-wrap,
  .dj-embed .phase[data-phase="sprint3"] .diagram-wrap,
  .dj-embed .phase[data-phase="sprint4"] .diagram-wrap { aspect-ratio: 1280 / 520; }
  .dj-embed .phase[data-phase="sprint1"] .diagram,
  .dj-embed .phase[data-phase="sprint2"] .diagram,
  .dj-embed .phase[data-phase="sprint3"] .diagram,
  .dj-embed .phase[data-phase="sprint4"] .diagram { height: 520px; }
  .dj-embed .insight .ins-text { font-size: 9pt; }
  .dj-embed .mini-insight .mi-text { font-size: 8pt; }
}`;

// --- Extract phase HTML ---
const bodyMatch = source.match(/<body>([\s\S]*?)<\/body>/);
if (!bodyMatch) throw new Error('No body found');
let html = bodyMatch[1];

// Remove rail nav
html = html.replace(/<!-- ============ FIXED PROGRESS RAIL[\s\S]*?<\/nav>\s*/m, '');

// Keep only phase sections
const phases = [];
const phaseRe = /<section class="phase"[\s\S]*?<\/section>/g;
let m;
while ((m = phaseRe.exec(html)) !== null) phases.push(m[0]);
if (phases.length !== 5) throw new Error(`Expected 5 phases, got ${phases.length}`);
html = phases.join('\n\n');

// Transform paths and ids
html = html.replace(/src="images\//g, 'src="assets/design-journey/');

const idMap = {
  exploration: 'dj-exploration',
  'sprint-1': 'dj-sprint-1',
  'sprint-2': 'dj-sprint-2',
  'sprint-3': 'dj-sprint-3',
  'sprint-4': 'dj-sprint-4',
};
for (const [from, to] of Object.entries(idMap)) {
  html = html.replace(new RegExp(`id="${from}"`, 'g'), `id="${to}"`);
}

// Prefix SVG def ids (same scheme as previous embed)
const svgIdPatterns = [
  ['arr-s4', 'dj-arr-s4'],
  ['arr-s3', 'dj-arr-s3'],
  ['arr-s2', 'dj-arr-s2'],
  ['arr-s1', 'dj-arr-s1'],
  ['dotgrid-s4', 'dj-dotgrid-s4'],
  ['dotgrid-s3', 'dj-dotgrid-s3'],
  ['dotgrid-s2', 'dj-dotgrid-s2'],
  ['dotgrid-s1', 'dj-dotgrid-s1'],
  ['dotgrid', 'dj-dotgrid'],
  ['arr', 'dj-arr'],
];
for (const [from, to] of svgIdPatterns) {
  html = html.replace(new RegExp(`id="${from}"`, 'g'), `id="${to}"`);
  html = html.replace(new RegExp(`url\\(#${from}\\)`, 'g'), `url(#${to})`);
}

// Indent for embedding
html = html
  .split('\n')
  .map((line) => (line.trim() ? '        ' + line : line))
  .join('\n');

const embedHtml = `      <!-- ============================================================
           DESIGN JOURNEY — embedded, scoped under .dj-embed
           Telt NIET mee voor het woordenbudget (geen [data-prose]).
           ============================================================ -->
      <div class="dj-embed">

${html}

      </div>`;

// --- Patch index.html ---
let index = fs.readFileSync(TARGET, 'utf8');

const cssStart = index.indexOf('/* ============================================================\n   DESIGN JOURNEY EMBED');
const cssEnd = index.indexOf('</style>', cssStart);
if (cssStart === -1 || cssEnd === -1) throw new Error('Could not find DJ CSS block in index.html');
index = index.slice(0, cssStart) + embedCss + index.slice(cssEnd);

const htmlStartMarker = '      <!-- ============================================================\n           DESIGN JOURNEY — embedded, scoped under .dj-embed';
const htmlStart = index.indexOf(htmlStartMarker);
const htmlEnd = index.indexOf('\n\n      <div class="page-inner">\n        <div class="page-footer">\n          <span>02 / Design Journey</span>', htmlStart);
if (htmlStart === -1 || htmlEnd === -1) throw new Error('Could not find DJ HTML block in index.html');
index = index.slice(0, htmlStart) + embedHtml + '\n' + index.slice(htmlEnd + 1);

fs.writeFileSync(TARGET, index);
console.log('Integrated design journey v3 into index.html');
console.log(`  CSS: ${embedCss.split('\n').length} lines`);
console.log(`  HTML: ${phases.length} phases`);
