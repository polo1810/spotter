// ===========================================
// SPOTTER · Landing — cartes métier + recherche
// ===========================================
// Lit VERTICALS (depuis verticals.js), injecte une carte par métier
// dans la grille, et branche une barre de recherche pour filtrer.
//
// Le format de carte suit le design Claude Design : nom, ligne d'outils
// (mono, en gris), et bas de carte avec "Démarrer" + flèche.

(function () {
  const grid        = document.getElementById('metiersGrid');
  const searchInput = document.getElementById('metiersSearch');
  const noResults   = document.getElementById('metiersNoResults');

  if (!grid || typeof VERTICALS !== 'object') return;

  /**
   * Métadonnées d'affichage par vertical : "tools" (3-4 outils principaux
   * en mono) et "peers" (nombre fictif d'équipes — sert à crédibiliser).
   * Dérivé de la liste réelle d'outils dans verticals.js, mais raccourci
   * pour tenir sur une ligne.
   */
  const META = {
    comptable:   { tools: 'Pennylane · Cegid · Outlook',  peers: '1 200+ équipes' },
    recrutement: { tools: 'LinkedIn · Workable · Lever',  peers: '720+ équipes'   },
    avocat:      { tools: 'Doctrine · Word · RPVA',       peers: '480+ équipes'   },
    immobilier:  { tools: 'Hektor · SeLoger · WhatsApp',  peers: '360+ équipes'   },
    architecte:  { tools: 'AutoCAD · Revit · ArchiCAD',   peers: '210+ équipes'   },
    conseil:     { tools: 'PowerPoint · Notion · HubSpot',peers: '540+ équipes'   },
    marketing:   { tools: 'HubSpot · Meta Ads · LinkedIn',peers: '480+ équipes'   },
    formation:   { tools: 'Digiforma · Moodle · Outlook', peers: '180+ équipes'   },
  };

  // Construit l'index des métiers
  const items = Object.entries(VERTICALS).map(([key, v]) => {
    const meta = META[key] || { tools: '', peers: '' };
    return {
      key,
      label: v.landingTitle || v.label || '',
      tools: meta.tools,
      peers: meta.peers,
      // Texte indexé pour la recherche
      haystack: [
        v.landingTitle || '',
        v.landingDesc  || '',
        v.label        || '',
        meta.tools     || ''
      ].join(' ').toLowerCase()
    };
  });

  function renderCards(filtered) {
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

  function filterCards(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      renderCards(items);
      return;
    }
    const words = q.split(/\s+/).filter(Boolean);
    const filtered = items.filter(item =>
      words.every(w => item.haystack.includes(w))
    );
    renderCards(filtered);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // Render initial : tous les métiers
  renderCards(items);

  // Branche la recherche
  if (searchInput) {
    searchInput.addEventListener('input', e => filterCards(e.target.value));
    // Raccourci ⌘K / Ctrl+K
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }
})();
