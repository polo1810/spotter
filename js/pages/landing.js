// ===========================================
// SPOTTER · Landing — interactivité (grille métiers + recherche + modal)
// ===========================================
// Le contenu textuel de la page est déjà dans le HTML servi
// (concaténé par tools/build.js depuis les partials).
// Ce script s'occupe de :
//   - peupler la grille des métiers à partir de VERTICALS
//   - filtrer la grille selon la recherche
//   - brancher le raccourci ⌘K / Ctrl+K
//   - au clic sur une carte, ouvrir un modal qui détaille le métier
//     (gain estimé + automatisations) AVANT de lancer le questionnaire

const METIERS_META = {
  comptable: {
    tools: 'Pennylane · Cegid · Outlook',
    peers: '1 200+ équipes',
    timeSaved: '+5h30',
    autos: [
      'Auto-correction des saisies récurrentes dans Sage / Pennylane',
      'Templates de mail clients intelligents (réponses-types récurrentes)',
      'Export Pennylane → reporting client en 1 clic',
    ],
  },
  recrutement: {
    tools: 'LinkedIn · Workable · Lever',
    peers: '720+ équipes',
    timeSaved: '+7h00',
    autos: [
      'Auto-formatage CV au template cabinet',
      'Templates LinkedIn personnalisés (prise de contact, relance)',
      'Sync ATS automatique depuis LinkedIn Recruiter',
    ],
  },
  avocat: {
    tools: 'Doctrine · Word · RPVA',
    peers: '480+ équipes',
    timeSaved: '+4h15',
    autos: [
      'Bibliothèque d\'actes-types pré-personnalisés (mises en demeure, contrats)',
      'Suivi facturation horaire automatisé par dossier',
      'Templates de réponses mail clients récurrents',
    ],
  },
  immobilier: {
    tools: 'Hektor · SeLoger · WhatsApp',
    peers: '360+ équipes',
    timeSaved: '+3h45',
    autos: [
      'Sync multi-portails automatique (Hektor → SeLoger, Leboncoin…)',
      'Relance post-visite automatisée (mail/SMS personnalisé)',
      'Reporting propriétaires en 1 clic',
    ],
  },
  architecte: {
    tools: 'AutoCAD · Revit · ArchiCAD',
    peers: '210+ équipes',
    timeSaved: '+6h15',
    autos: [
      'Comptes-rendus de chantier auto-générés (saisie tablette → CR formaté)',
      'Relances pièces automatiques par dossier',
      'Templates dossier permis pré-remplis',
    ],
  },
  conseil: {
    tools: 'PowerPoint · Notion · HubSpot',
    peers: '540+ équipes',
    timeSaved: '+4h30',
    autos: [
      'Auto-mise en page des slides au template cabinet',
      'CR de réunion automatisés (transcription + structure)',
      'Bibliothèque de propales modulaires',
    ],
  },
  marketing: {
    tools: 'HubSpot · Meta Ads · LinkedIn',
    peers: '480+ équipes',
    timeSaved: '+8h00',
    autos: [
      'Reportings multi-plateformes auto-générés (Google Ads + Meta + GA4)',
      'Cross-posting réseaux sociaux automatisé',
      'Templates briefs créatifs intelligents',
    ],
  },
  formation: {
    tools: 'Digiforma · Moodle · Outlook',
    peers: '180+ équipes',
    timeSaved: '+5h45',
    autos: [
      'Génération auto conventions + attestations',
      'Séquences de relance apprenants entre les modules',
      'Bibliothèque de supports modulaires',
    ],
  },
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ===========================================
// Modal métier (preview avant questionnaire)
// ===========================================

function openMetierModal(item) {
  const modal = document.getElementById('metierModal');
  const content = document.getElementById('metierModalContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <button class="metier-modal-close" aria-label="Fermer">×</button>

    <div class="metier-modal-eyebrow">Métier sélectionné</div>
    <h3 class="metier-modal-title">${escapeHtml(item.label)}</h3>
    <div class="metier-modal-tools">${escapeHtml(item.tools)}</div>

    <div class="metier-modal-gain">
      <div class="metier-modal-gain-row">
        <span class="metier-modal-gain-value">${escapeHtml(item.timeSaved)}</span>
        <span class="metier-modal-gain-unit">/ semaine</span>
      </div>
      <div class="metier-modal-gain-label">de gain estimé en moyenne, selon les retours bêta</div>
    </div>

    <div class="metier-modal-section">
      <div class="metier-modal-section-title">Ce que Spotter te proposera</div>
      <ul class="metier-modal-autos">
        ${item.autos.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
      </ul>
    </div>

    <div class="metier-modal-foot">
      <div class="metier-modal-note">10 questions rapides · 30 secondes · aucune carte bancaire</div>
      <div class="metier-modal-actions">
        <button class="btn btn-ghost" data-action="close">Annuler</button>
        <a href="/pages/questionnaire.html?v=${encodeURIComponent(item.key)}"
           class="btn btn-primary btn-lg metier-modal-cta">
          Démarrer mon questionnaire →
        </a>
      </div>
    </div>
  `;

  // Listeners du modal (close)
  modal.querySelector('.metier-modal-close').addEventListener('click', closeMetierModal);
  modal.querySelector('[data-action="close"]').addEventListener('click', closeMetierModal);

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMetierModal() {
  const modal = document.getElementById('metierModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Ferme au clic à l'extérieur de la carte
document.addEventListener('click', e => {
  const modal = document.getElementById('metierModal');
  if (modal && modal.classList.contains('show') && e.target === modal) {
    closeMetierModal();
  }
});

// Ferme avec Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMetierModal();
});

// ===========================================
// Grille métiers + recherche
// ===========================================

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
      <button class="metier" type="button" data-key="${escapeHtml(item.key)}">
        <div class="metier-name">${escapeHtml(item.label)}</div>
        <div class="metier-tools">${escapeHtml(item.tools)}</div>
        <div class="metier-meta">
          <span>${escapeHtml(item.peers)}</span>
          <span class="metier-cta">Démarrer →</span>
        </div>
      </button>
    `).join('');

    // Branche le clic sur chaque carte → ouvre le modal
    grid.querySelectorAll('.metier').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const item = items.find(i => i.key === key);
        if (item) openMetierModal(item);
      });
    });
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
