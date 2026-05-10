// ===========================================
// SPOTTER · Landing — orchestrateur
// ===========================================
// 1) Charge en parallèle les 9 partials de /partials/landing/*.html
// 2) Les insère en ordre dans #app
// 3) Branche la grille des métiers + la barre de recherche
//    (qui dépend de VERTICALS chargé depuis /js/lib/verticals.js)

const SECTIONS = [
  'nav',
  'hero',
  'metiers',
  'how-it-works',
  'privacy',
  'founder',
  'faq',
  'final-cta',
  'footer',
];

// ---------- Chargement parallèle des partials ----------
async function loadAllSections() {
  const responses = await Promise.all(
    SECTIONS.map(async name => {
      const res = await fetch(`/partials/landing/${name}.html`);
      if (!res.ok) {
        console.error(`[landing] ${name}.html — HTTP ${res.status}`);
        return '';
      }
      return res.text();
    })
  );

  // On insère le tout d'un coup pour éviter des reflows successifs
  document.getElementById('app').innerHTML = responses.join('\n');
}

// ===========================================
// Grille des métiers + recherche
// ===========================================

const METIERS_META = {
  comptable:   { tools: 'Pennylane · Cegid · Outlook',   peers: '1 200+ équipes' },
  recrutement: { tools: 'LinkedIn · Workable · Lever',   peers: '720+ équipes'   },
  avocat:      { tools: 'Doctrine · Word · RPVA',        peers: '480+ équipes'   },
  immobilier:  { tools: 'Hektor · SeLoger · WhatsApp',   peers: '360+ équipes'   },
  architecte:  { tools: 'AutoCAD · Revit · ArchiCAD',    peers: '210+ équipes'   },
  conseil:     { tools: 'PowerPoint · Notion · HubSpot', peers: '540+ équipes'   },
  marketing:   { tools: 'HubSpot · Meta Ads · LinkedIn', peers: '480+ équipes'   },
  formation:   { tools: 'Digiforma · Moodle · Outlook',  peers: '180+ équipes'   },
};

function bindMetiersGrid() {
  const grid        = document.getElementById('metiersGrid');
  const searchInput = document.getElementById('metiersSearch');
  const noResults   = document.getElementById('metiersNoResults');

  if (!grid || typeof VERTICALS !== 'object') return;

  const items = Object.entries(VERTICALS).map(([key, v]) => {
    const meta = METIERS_META[key] || { tools: '', peers: '' };
    return {
      key,
      label:    v.landingTitle || v.label || '',
      tools:    meta.tools,
      peers:    meta.peers,
      haystack: [v.landingTitle, v.landingDesc, v.label, meta.tools]
                  .filter(Boolean).join(' ').toLowerCase(),
    };
  });

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function render(filtered) {
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';
    grid.innerHTML = filtered.map(item => `
      <a href="/pages/questionnaire.html?v=${item.key}" class="metier">
        <div class="metier-name">${escapeHtml(item.label)}</div>
        <div class="metier-tools">${escapeHtml(item.tools)}</div>
        <div class="metier-meta">
          <span>${escapeHtml(item.peers)}</span>
          <span>→</span>
        </div>
        <span class="metier-arrow">↗</span>
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
}

// ===========================================
// Init
// ===========================================

(async function init() {
  try {
    await loadAllSections();
    bindMetiersGrid();
  } catch (err) {
    console.error('[landing] init failed:', err);
    document.getElementById('app').innerHTML =
      '<p style="padding:40px;text-align:center;color:#888;">Erreur de chargement. Recharge la page.</p>';
  }
})();
