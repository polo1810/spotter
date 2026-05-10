// ===========================================
// SPOTTER · Landing — interactivité (grille métiers + recherche)
// ===========================================
// Le contenu textuel de la page est déjà dans le HTML servi
// (concaténé par tools/build.js depuis les partials).
// Ce script s'occupe de :
//   - peupler la grille des métiers à partir de VERTICALS
//   - filtrer la grille selon la recherche
//   - brancher le raccourci ⌘K / Ctrl+K

const METIERS_META = {
  comptable: {
    tools: 'Pennylane · Cegid · Outlook',
    peers: '1 200+ équipes',
    timeSaved: '+5h30 / sem',
    autos: [
      'Auto-correction des saisies récurrentes',
      'Templates de mail clients intelligents',
      'Export Pennylane → reporting en 1 clic',
    ],
  },
  recrutement: {
    tools: 'LinkedIn · Workable · Lever',
    peers: '720+ équipes',
    timeSaved: '+6h15 / sem',
    autos: [
      'Auto-formatage CV au template cabinet',
      'Templates LinkedIn personnalisés',
      'Sync ATS automatique depuis LinkedIn',
    ],
  },
  avocat: {
    tools: 'Doctrine · Word · RPVA',
    peers: '480+ équipes',
    timeSaved: '+5h30 / sem',
    autos: [
      'Bibliothèque d\'actes-types pré-personnalisés',
      'Suivi facturation horaire automatisé',
      'Templates de réponses mail clients',
    ],
  },
  immobilier: {
    tools: 'Hektor · SeLoger · WhatsApp',
    peers: '360+ équipes',
    timeSaved: '+4h45 / sem',
    autos: [
      'Sync multi-portails automatique',
      'Relance post-visite automatisée',
      'Reporting propriétaires en 1 clic',
    ],
  },
  architecte: {
    tools: 'AutoCAD · Revit · ArchiCAD',
    peers: '210+ équipes',
    timeSaved: '+5h30 / sem',
    autos: [
      'Comptes-rendus de chantier auto-générés',
      'Relances pièces automatiques par dossier',
      'Templates dossier permis pré-remplis',
    ],
  },
  conseil: {
    tools: 'PowerPoint · Notion · HubSpot',
    peers: '540+ équipes',
    timeSaved: '+5h30 / sem',
    autos: [
      'Auto-mise en page des slides au template',
      'CR de réunion automatisés',
      'Bibliothèque de propales modulaires',
    ],
  },
  marketing: {
    tools: 'HubSpot · Meta Ads · LinkedIn',
    peers: '480+ équipes',
    timeSaved: '+5h30 / sem',
    autos: [
      'Reportings multi-plateformes auto-générés',
      'Cross-posting réseaux sociaux',
      'Templates briefs créatifs intelligents',
    ],
  },
  formation: {
    tools: 'Digiforma · Moodle · Outlook',
    peers: '180+ équipes',
    timeSaved: '+5h15 / sem',
    autos: [
      'Conventions + attestations auto-générées',
      'Séquences de relance apprenants',
      'Bibliothèque de supports modulaires',
    ],
  },
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

(function () {
  const grid        = document.getElementById('metiersGrid');
  const searchInput = document.getElementById('metiersSearch');
  const noResults   = document.getElementById('metiersNoResults');

  if (!grid || typeof VERTICALS !== 'object') {
    console.warn('[landing] grid ou VERTICALS introuvable', { grid: !!grid, verticals: typeof VERTICALS });
    return;
  }

  const items = Object.entries(VERTICALS).map(([key, v]) => {
    const meta = METIERS_META[key] || {};
    return {
      key,
      label:     v.landingTitle || v.label || '',
      tools:     meta.tools     || '',
      peers:     meta.peers     || '',
      timeSaved: meta.timeSaved || '',
      autos:     meta.autos     || [],
      haystack:  [v.landingTitle, v.landingDesc, v.label, meta.tools, (meta.autos || []).join(' ')]
                   .filter(Boolean).join(' ').toLowerCase(),
    };
  });

  function render(filtered) {
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = filtered.map(item => `
      <a href="/pages/questionnaire.html?v=${item.key}" class="metier">
        <div class="metier-head">
          <div class="metier-name">${escapeHtml(item.label)}</div>
          <div class="metier-tools">${escapeHtml(item.tools)}</div>
        </div>

        <div class="metier-gain">
          <span class="metier-gain-value">${escapeHtml(item.timeSaved)}</span>
          <span class="metier-gain-label">de gain moyen estimé</span>
        </div>

        <ul class="metier-autos">
          ${item.autos.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>

        <div class="metier-foot">
          <span class="metier-peers">${escapeHtml(item.peers)}</span>
          <span class="metier-cta">Démarrer →</span>
        </div>
      </a>
    `).join('');
  }

  function filter(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) { render(items); return; }
    const words = q.split(/\s+/).filter(Boolean);
    render(items.filter(item => words.every(w => item.haystack.includes(w))));
  }

  render(items);

  if (searchInput) {
    searchInput.addEventListener('input', e => filter(e.target.value));
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }
})();
