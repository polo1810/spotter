#!/usr/bin/env node
/**
 * PRODUCTLY · Build script
 *
 * Concatène les 9 partials de partials/landing/*.html dans le squelette
 * partials/landing/_skeleton.html et produit index.html à la racine.
 *
 * Pourquoi un build step :
 *   - SEO : le HTML servi à Google contient TOUT le texte
 *   - DX : chaque section reste un petit fichier facile à éditer (20-150 lignes)
 *   - Speed : un seul HTML statique = un seul round-trip
 *
 * Netlify lance ce script à chaque déploiement (cf. netlify.toml).
 * En local : `node tools/build.js`
 *
 * Aucune dépendance externe (Node.js standard library uniquement).
 */

const fs   = require('fs');
const path = require('path');

const ROOT          = path.resolve(__dirname, '..');
const PARTIALS_DIR  = path.join(ROOT, 'partials', 'landing');
const SKELETON_FILE = path.join(PARTIALS_DIR, '_skeleton.html');
const OUT_FILE      = path.join(ROOT, 'index.html');

const SECTIONS = ['nav', 'hero', 'metiers', 'how-it-works', 'privacy', 'founder', 'faq', 'final-cta', 'footer'];

// ---- 1) Lire le squelette ----
if (!fs.existsSync(SKELETON_FILE)) {
  console.error(`✗ Squelette introuvable : ${SKELETON_FILE}`);
  process.exit(1);
}
let html = fs.readFileSync(SKELETON_FILE, 'utf8');

// ---- 2) Remplacer chaque <!--INCLUDE:nom--> par le partial ----
for (const name of SECTIONS) {
  const file  = path.join(PARTIALS_DIR, `${name}.html`);
  if (!fs.existsSync(file)) {
    console.error(`✗ Partial manquant : ${file}`);
    process.exit(1);
  }
  const token   = `<!--INCLUDE:${name}-->`;
  const content = fs.readFileSync(file, 'utf8').trim();

  if (!html.includes(token)) {
    console.warn(`⚠ Token absent du squelette : ${token}`);
    continue;
  }
  html = html.replace(token, content);
}

// ---- 3) Vérification finale ----
if (html.includes('<!--INCLUDE:')) {
  console.warn('⚠ Il reste des tokens INCLUDE non remplacés dans le HTML final.');
}

// ---- 4) Écriture ----
fs.writeFileSync(OUT_FILE, html);

const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
const lines  = html.split('\n').length;
console.log(`✓ index.html généré (${sizeKb} Ko · ${lines} lignes · ${SECTIONS.length} sections)`);
