import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'plaatjes S4');
const outViz = path.join(root, 'assets/visuals');
const outImg = path.join(root, 'assets/s4-viz');

fs.mkdirSync(outViz, { recursive: true });
fs.mkdirSync(outImg, { recursive: true });

function findFile(prefix) {
  const match = fs.readdirSync(srcDir).find((f) => f.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!match) throw new Error(`Missing file with prefix: ${prefix}`);
  return path.join(srcDir, match);
}

function extractTemplate(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const marker = '<script type="__bundler/template">';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`No bundler template in ${filePath}`);
  const contentStart = start + marker.length + 1;
  const end = html.indexOf('\n  </script>', contentStart);
  if (end === -1) throw new Error(`No template end in ${filePath}`);
  const raw = html.slice(contentStart, end).trim();
  return JSON.parse(raw);
}

const htmlMap = [
  { prefix: 'CONSOLIDATIE', out: 's4-consolidatie.html' },
  { prefix: 'VIJF BOUWSTENEN', out: 's4-bouwstenen-bril.html' },
  { prefix: 'KOMENDE FEATURES', out: 's4-komende-features.html' },
];

for (const { prefix, out } of htmlMap) {
  const template = extractTemplate(findFile(prefix));
  fs.writeFileSync(path.join(outViz, out), template);
  console.log('Wrote', out);
}

const imgMap = [
  ['FRAMEVIEW', 'frameview-canvas.png'],
  ['SPIEGEL', 'spiegel.png'],
  ['AI-GEGENEREERDE BRIL', 'ai-gegenereerde-bril.png'],
  ['ELICITATIE OEFENINGEN', 'elicitatie-oefeningen.png'],
  ['PERSOONLIJKE SPIEGEL', 'persoonlijke-spiegel.png'],
  ['PROJECT-ONBOARDING', 'project-onboarding.png'],
  ['CFA-BOUWSTENEN', 'cfa-bouwstenen.png'],
  ['DE SLIJPERIJ', 'de-slijperij.png'],
  ['CONTEXTFACTOREN', 'contextfactoren.png'],
  ['MENTAAL MODEL', 'mentaal-model.png'],
  ['BOUWSTENEN', 'bouwstenen.png'],
  ['ADMIN-PANEL', 'admin-panel.png'],
  ['GEBRUIKER START ZELF', 'gebruiker-start-zelf.png'],
  ['ZWITSERS ZAKMES', 'zwitsers-zakmes.png'],
  ['VIJF GEBIEDEN', 'vijf-gebieden-notificaties.png'],
];

for (const [prefix, out] of imgMap) {
  const src = findFile(prefix);
  fs.copyFileSync(src, path.join(outImg, out));
  console.log('Copied', out);
}
