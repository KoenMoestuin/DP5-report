#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const SECTIONS = [
  { id: 's3-framing', title: 'Framing', phase: 'Phase 1' },
  { id: 's3-concepting', title: 'Concepting', phase: 'Phase 2' },
  { id: 's3-viz', title: 'Visualising & Prototyping', phase: 'Phase 3' },
  { id: 's3-eval', title: 'Evaluation', phase: 'Phase 4' },
];

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x2011;/g, '\u2011')
    .replace(/&mdash;/g, '—')
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function inlineToMd(s) {
  let t = s;
  t = t.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  t = t.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  return stripTags(t);
}

function extractSection(id) {
  const re = new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`);
  const m = html.match(re);
  return m ? m[0] : '';
}

function prepareFragment(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<div class="page-footer"[\s\S]*?<\/div>/gi, '')
    .replace(/<div class="phase-nav"[\s\S]*?<\/div>/gi, '')
    .replace(/<div class="sprint-hero"[\s\S]*?<\/div>\s*<\/div>/gi, '');
}

function collectMatches(fragment, re, mapFn) {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(fragment)) !== null) {
    const text = mapFn(m);
    if (text && text.trim()) out.push({ index: m.index, text: text.trimEnd() });
  }
  return out;
}

function extractFragmentText(fragment) {
  const tokens = [];
  const designBlocks = [];

  const body = fragment.replace(
    /<div class="design-question-label"[^>]*>([\s\S]*?)<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/gi,
    (full, label, para, offset) => {
      designBlocks.push({
        index: offset,
        text: `> **${inlineToMd(label)}**  \n> ${inlineToMd(para)}\n`,
      });
      return '';
    }
  );

  tokens.push(...designBlocks);
  tokens.push(...collectMatches(body, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, (m) => `### ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<h3[^>]*class="[^"]*elicit-concept-ttl[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi, (m) => `#### ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<h3[^>]*class="[^"]*dim-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi, (m) => `#### ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<h3[^>]*>([\s\S]*?)<\/h3>/gi, (m) => `#### ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<h4[^>]*class="[^"]*s3-playflow-title[^"]*"[^>]*>([\s\S]*?)<\/h4>/gi, (m) => `##### ${inlineToMd(m[1])}\n`));

  const skipP = /class="[^"]*(obs-text|impl-text|elicit-concept-desc|s3-concept-reason|s3-playflow-phase|s3-playflow-desc|dim-q|rc-desc|rc-reason|cfa-panel-title|cfa-item-text|cfa-side-label|cfa-macht-text|cfa-tension-label)/;

  tokens.push(...collectMatches(body, /<p([^>]*)>([\s\S]*?)<\/p>/gi, (m) => {
    const attrs = m[1];
    const content = m[2];
    if (skipP.test(attrs)) return '';
    if (attrs.includes('class=')) return '';
    const text = inlineToMd(content);
    return text ? `${text}\n` : '';
  }));

  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*dim-q[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*obs-text[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `- *Observatie:* ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*impl-text[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `- *Implicatie:* ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<span class="c-verb">([\s\S]*?)<\/span>\s*<span class="c-noun">([\s\S]*?)<\/span>/gi, (m) => `- **${inlineToMd(m[1])} ${inlineToMd(m[2])}**\n`));
  tokens.push(...collectMatches(body, /<span class="cfa-acronym">([\s\S]*?)<\/span>\s*<span class="cfa-subtitle">([\s\S]*?)<\/span>/gi, (m) => `**${inlineToMd(m[1])}** — ${inlineToMd(m[2])}\n`));
  tokens.push(...collectMatches(body, /<p class="cfa-panel-title">([\s\S]*?)<\/p>/gi, (m) => `**${inlineToMd(m[1])}**\n`));
  tokens.push(...collectMatches(body, /<p class="cfa-item-text">([\s\S]*?)<\/p>/gi, (m) => `- ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p class="cfa-side-label">([\s\S]*?)<\/p>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<p class="cfa-macht-text">([\s\S]*?)<\/p>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<p class="cfa-tension-label">([\s\S]*?)<\/p>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<span class="cfa-dir-lbl">([\s\S]*?)<\/span>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<p class="rc-title">([\s\S]*?)<\/p>/gi, (m) => `#### ${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p class="rc-desc">([\s\S]*?)<\/p>/gi, (m) => `${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p class="rc-reason"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*elicit-concept-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*s3-concept-reason[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*s3-playflow-phase[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<p[^>]*class="[^"]*s3-playflow-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (m) => `${inlineToMd(m[1])}\n`));
  tokens.push(...collectMatches(body, /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, (m) => `*${inlineToMd(m[1])}*\n`));
  tokens.push(...collectMatches(body, /<img[^>]*alt="([^"]*)"[^>]*>/gi, (m) => {
    const alt = inlineToMd(m[1]);
    return alt && !alt.match(/^(FIG\.|viewBox)/i) ? `*[Afbeelding: ${alt}]*\n` : '';
  }));

  tokens.push(...collectMatches(body,
    /<div class="callout-label"[^>]*>([\s\S]*?)<\/div>\s*<div class="callout-body"[^>]*>([\s\S]*?)<\/div>/gi,
    (m) => {
      const label = inlineToMd(m[1]);
      const items = [...m[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => `- ${inlineToMd(x[1])}`);
      return `**${label}**\n\n${items.join('\n')}\n`;
    }
  ));

  tokens.sort((a, b) => a.index - b.index);

  const lines = [];
  const seen = new Set();
  for (const t of tokens) {
    const key = t.text.replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    lines.push(t.text.trimEnd());
  }
  return lines;
}

const doc = [];
doc.push('# Sprint 3 — Samen problemen ontwerpen');
doc.push('');

for (const section of SECTIONS) {
  const raw = extractSection(section.id);
  if (!raw) continue;
  const frag = prepareFragment(raw);
  doc.push(`## ${section.title}`);
  doc.push('');
  doc.push(`*${section.phase}*`);
  doc.push('');
  for (const block of extractFragmentText(frag)) {
    doc.push(block);
    doc.push('');
  }
  doc.push('---');
  doc.push('');
}

const outPath = path.join(root, 'sprint-3.md');
fs.writeFileSync(outPath, doc.join('\n').replace(/\n{3,}/g, '\n\n'));
console.log('Written:', outPath);
