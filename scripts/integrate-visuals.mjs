import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const defaultSrcDir = path.join(root, 'assets/visuals');
const indexPath = path.join(root, 'index.html');

const VIZ = [
  {
    file: 'stakeholderbelangen.html',
    scope: '#stakeholders .report-figure-box.sh-viz',
    start: '<div class="report-figure-box sh-viz" data-fig-num="4" data-visual-slot="stakeholderbelangen">',
    end: '</div>\n        </figure>',
  },
  {
    file: 'cyclus-eliciteren-reframen.html',
    scope: '#s1-framing .report-figure-box[data-fig-num="1"]',
    start: '<div class="report-figure-box" data-fig-num="1">',
    end: '</div>\n          </figure>',
  },
  {
    file: 'foto-elicitatie-pipeline.html',
    scope: '#s2-viz .report-figure-box.s2-viz-flow',
    start: '<div class="report-figure-box s2-viz-flow" data-fig-num="11" data-visual-slot="foto-elicitatie-pipeline">',
    end: '</div>\n        </figure>',
  },
  {
    file: 's3-framing.html',
    srcDir: path.join(root, 'assets/visuals'),
    scope: '#s3-framing .report-figure-box.s3-framing-viz',
    cssOnce: true,
    figIndex: 0,
    idPrefix: 's3f12-',
    start: '<div class="report-figure-box s3-framing-viz" data-fig-num="12" data-visual-slot="s3-framing-vertrekpunten">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-framing.html',
    srcDir: path.join(root, 'assets/visuals'),
    scope: '#s3-framing .report-figure-box.s3-framing-viz',
    cssOnce: true,
    figIndex: 1,
    idPrefix: 's3f13-',
    start: '<div class="report-figure-box s3-framing-viz" data-fig-num="13" data-visual-slot="s3-framing-zoeken-construeren">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-framing.html',
    srcDir: path.join(root, 'assets/visuals'),
    scope: '#s3-framing .report-figure-box.s3-framing-viz',
    cssOnce: true,
    figIndex: 2,
    idPrefix: 's3f14-',
    start: '<div class="report-figure-box s3-framing-viz" data-fig-num="14" data-visual-slot="s3-framing-cfa">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-framing.html',
    srcDir: path.join(root, 'assets/visuals'),
    scope: '#s3-framing .report-figure-box.s3-framing-viz',
    cssOnce: true,
    figIndex: 3,
    idPrefix: 's3f15-',
    start: '<div class="report-figure-box s3-framing-viz" data-fig-num="15" data-visual-slot="s3-framing-brug">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-concepting.html',
    scope: '#s3-concepting .report-figure-box.s3-concepting-viz',
    cssOnce: true,
    figIndex: 0,
    idPrefix: 's3c16-',
    start: '<div class="report-figure-box s3-concepting-viz" data-fig-num="16" data-visual-slot="s3-concepting-principe">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-concepting.html',
    scope: '#s3-concepting .report-figure-box.s3-concepting-viz',
    cssOnce: true,
    figIndex: 1,
    idPrefix: 's3c17-',
    start: '<div class="report-figure-box s3-concepting-viz" data-fig-num="17" data-visual-slot="s3-concepting-ontwerpruimte">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-concepting.html',
    scope: '#s3-concepting .report-figure-box.s3-concepting-viz',
    cssOnce: true,
    figIndex: 2,
    idPrefix: 's3c18-',
    start: '<div class="report-figure-box s3-concepting-viz" data-fig-num="18" data-visual-slot="s3-concepting-richtingen">',
    end: '</div>\n          </figure>',
  },
  {
    file: 's3-concepting.html',
    scope: '#s3-concepting .report-figure-box.s3-concepting-viz',
    cssOnce: true,
    figIndex: 3,
    idPrefix: 's3c19-',
    start: '<div class="report-figure-box s3-concepting-viz" data-fig-num="19" data-visual-slot="s3-concepting-wijk-kaart">',
    end: '</div>\n            </figure>',
  },
  {
    file: 's3-slijperij-spelflow.html',
    scope: '#s3-viz .report-figure-box.s3-slijperij-viz',
    cssOnce: true,
    figIndex: 0,
    idPrefix: 's3f20-',
    start: '<div class="report-figure-box s3-slijperij-viz" data-fig-num="20" data-visual-slot="s3-slijperij-spelflow">',
    end: '</div>\n        </figure>',
  },
  {
    file: 'final-vier-hoofdpaginas.html',
    scope: '#final-design .report-figure-box.fd-viz--hoofdpaginas',
    cssOnce: true,
    figIndex: 0,
    start: '<div class="report-figure-box fd-viz fd-viz--hoofdpaginas" data-visual-slot="final-vier-hoofdpaginas">',
    end: '</div>\n        </figure>',
  },
  {
    file: 'final-drie-deliverables.html',
    scope: '#final-design .report-figure-box.fd-viz--deliverables',
    cssOnce: true,
    figIndex: 0,
    start: '<div class="report-figure-box fd-viz fd-viz--deliverables" data-visual-slot="final-drie-deliverables">',
    end: '</div>\n        </figure>',
  },
];

const VIZ_VARS = `
  --ink: #111111;
  --ink-2: #2a2a2a;
  --ink-3: #5b5b5b;
  --ink-4: #8a8a8a;
  --paper: #faf7f2;
  --paper-2: #f3ede2;
  --paper-3: #e8e1d3;
  --clay: #d96b3f;
  --clay-soft: #f3c9b4;
  --moss: #6b8f5e;
  --moss-soft: #c9d8c0;
  --sky: #6f9ec4;
  --sky-soft: #cdddea;
  --sun: #e8c66a;
  --sun-soft: #f3e2ad;
  --font-display: 'Sora', 'Space Grotesk', sans-serif;
  --font-body: 'Nunito', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
`;

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function findCloseBrace(str, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('unbalanced braces');
}

function shouldSkipSelector(sel) {
  const parts = sel.split(',').map((s) => s.trim());
  return parts.every((s) => {
    if (!s) return true;
    if (s === 'html' || s === 'body' || s === '.page') return true;
    if (/^html\s/.test(s) || /^body\s/.test(s)) return false;
    return false;
  });
}

function scopeSelectors(selectors, scope) {
  return selectors
    .split(',')
    .map((s) => {
      s = s.trim();
      if (!s) return s;
      if (s.startsWith(scope)) return s;
      return `${scope} ${s}`;
    })
    .join(', ');
}

function scopeCSS(css, scope) {
  css = stripComments(css);
  let out = '';
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;

    if (css[i] === '@') {
      const open = css.indexOf('{', i);
      const close = findCloseBrace(css, open);
      const block = css.slice(i, close + 1);
      const prelude = block.slice(0, block.indexOf('{') + 1);
      const inner = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
      if (/^@(media|supports)/.test(block)) {
        out += prelude + scopeCSS(inner, scope) + '}';
      } else {
        out += block;
      }
      i = close + 1;
      continue;
    }

    const open = css.indexOf('{', i);
    if (open === -1) break;
    const selectors = css.slice(i, open).trim();
    const close = findCloseBrace(css, open);
    const body = css.slice(open + 1, close);
    if (!selectors || shouldSkipSelector(selectors)) {
      i = close + 1;
      continue;
    }
    out += `${scopeSelectors(selectors, scope)}{${body}}`;
    i = close + 1;
  }
  return out;
}

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  return m ? m[1] : '';
}

function findFigcardStarts(html) {
  const starts = [];
  const re = /<div class="figcard[^"]*">/g;
  let match;
  while ((match = re.exec(html)) !== null) starts.push(match.index);
  return starts;
}

function extractFigcardAt(html, index = 0) {
  const starts = findFigcardStarts(html);
  if (index >= starts.length) throw new Error(`figcard index ${index} not found`);
  const start = starts[index];
  let depth = 0;
  let i = start;
  while (i < html.length) {
    if (html.startsWith('<div', i)) {
      const gt = html.indexOf('>', i);
      if (html[gt - 1] !== '/') depth++;
      i = gt + 1;
      continue;
    }
    if (html.startsWith('</div>', i)) {
      depth--;
      i += 6;
      if (depth === 0) return html.slice(start, i);
      continue;
    }
    i++;
  }
  throw new Error('figcard end not found');
}

function prefixSvgIds(html, prefix) {
  if (!prefix) return html;
  return html
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
}

function wrapperReset(scope) {
  return `
${scope} {
${VIZ_VARS}
  font-family: var(--font-body);
  color: var(--ink);
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0;
  max-width: 100%;
}
`;
}

let html = fs.readFileSync(indexPath, 'utf8');
const cssBlocks = [];
const cssSeen = new Set();

for (const cfg of VIZ) {
  const srcDir = cfg.srcDir || defaultSrcDir;
  const src = fs.readFileSync(path.join(srcDir, cfg.file), 'utf8');
  const figIndex = cfg.figIndex ?? 0;
  let inner = extractFigcardAt(src, figIndex);
  inner = prefixSvgIds(inner, cfg.idPrefix);

  const cssKey = `${cfg.file}::${cfg.scope}`;
  if (!cfg.cssOnce || !cssSeen.has(cssKey)) {
    const scoped = scopeCSS(extractStyle(src), cfg.scope);
    cssBlocks.push(`/* viz: ${cfg.file} */\n${wrapperReset(cfg.scope)}\n${scoped}`);
    cssSeen.add(cssKey);
  }

  const startIdx = html.indexOf(cfg.start);
  if (startIdx === -1) throw new Error(`start not found: ${cfg.file} (${cfg.start.slice(0, 60)}…)`);
  const contentStart = startIdx + cfg.start.length;
  const endIdx = html.indexOf(cfg.end, contentStart);
  if (endIdx === -1) throw new Error(`end not found: ${cfg.file}`);
  html =
    html.slice(0, contentStart) +
    '\n            ' +
    inner +
    '\n          ' +
    html.slice(endIdx);
}

const sectionCss = `
/* Ingesloten visualisaties (origineel uit Nieuwe visualisaties) */
#stakeholders .report-diagram,
#s1-framing figure.report-diagram:has([data-fig-num="1"]),
#s2-viz .report-diagram:has(.s2-viz-flow),
#s3-framing .report-diagram,
#s3-concepting .report-diagram,
#s3-viz .report-diagram:has(.s3-slijperij-viz),
#final-design .report-diagram {
  max-width: 100%;
}

${cssBlocks.join('\n\n')}
`;

html = html.replace(
  /\/\* Ingesloten visualisaties[\s\S]*?\/\* Stakeholders — visualisatie/,
  sectionCss + '\n/* Stakeholders — visualisatie'
);

html = html.replace(
  /\n  \/\/ Auto-height voor embedded visualisaties[\s\S]*?window\.addEventListener\('resize', resizeVizFrames\);\n\n/,
  '\n'
);
html = html.replace(/\n  resizeVizFrames\(\);/, '');
html = html.replace(
  /    requestAnimationFrame\(resizeVizFrames\);\n/,
  ''
);
html = html.replace(
  /    setTimeout\(resizeVizFrames, 200\);\n/,
  ''
);

fs.writeFileSync(indexPath, html);
console.log('Integrated', VIZ.length, 'visualization slots inline.');
