#!/usr/bin/env node
/**
 * SPOTTER · Build script — assemble la landing à partir des partials.
 *
 * Usage : node tools/build.js
 *
 * Ce que ça fait :
 *   1) Lit src/landing/skeleton.html
 *   2) Remplace chaque <!--INCLUDE:nom--> par le contenu de src/landing/nom.html
 *   3) Inline les CSS critiques (global.css + landing.css) dans <style>
 *      pour éviter le round-trip réseau et accélérer le First Paint
 *   4) Écrit le résultat dans index.html à la racine
 *
 * Aucune dépendance externe (Node.js standard library uniquement).
 * Netlify exécute ce script automatiquement avant chaque déploiement
 * (cf. netlify.toml).
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const SRC_DIR   = path.join(ROOT, 'src', 'landing');
const CSS_DIR   = path.join(ROOT, 'css');
const OUT_FILE  = path.join(ROOT, 'index.html');

const SKELETON  = path.join(SRC_DIR, 'skeleton.html');
const PARTIALS  = ['nav', 'hero', 'metiers', 'how-it-works', 'privacy', 'founder', 'faq', 'final-cta', 'footer'];
const CRITICAL_CSS = ['global.css', 'landing.css'];

// ---------- Lecture utilitaire ----------
function read(file) {
  return fs.readFileSync(file, 'utf8');
}

// ---------- 1) Skeleton ----------
let html = read(SKELETON);

// ---------- 2) Inclusion des partials ----------
for (const name of PARTIALS) {
  const file  = path.join(SRC_DIR, `${name}.html`);
  if (!fs.existsSync(file)) {
    console.error(`✗ Partial manquant : ${file}`);
    process.exit(1);
  }
  const block = read(file);
  const token = `<!--INCLUDE:${name}-->`;

  if (!html.includes(token)) {
    console.warn(`⚠ Token absent dans skeleton : ${token}`);
    continue;
  }
  html = html.replace(token, block.trim());
}

// ---------- 3) Inlining du CSS critique ----------
const css = CRITICAL_CSS.map(name => {
  const file = path.join(CSS_DIR, name);
  return `/* === ${name} === */\n` + read(file);
}).join('\n\n');

const styleBlock = `<style>\n${css}\n</style>`;
html = html.replace('<!--INLINE_CSS-->', styleBlock);

// ---------- 4) Vérifications finales ----------
if (html.includes('<!--INCLUDE:')) {
  console.warn('⚠ Il reste des tokens non remplacés dans le HTML final.');
}
if (html.includes('<!--INLINE_CSS-->')) {
  console.warn('⚠ Le token <!--INLINE_CSS--> n\'a pas été remplacé.');
}

// ---------- 5) Écriture ----------
fs.writeFileSync(OUT_FILE, html);

const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`✓ index.html généré (${sizeKb} Ko, ${PARTIALS.length} partials inclus)`);
