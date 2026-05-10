// ===========================================
// SPOTTER · Landing — cartes métier + recherche
// ===========================================
// Lit VERTICALS (depuis verticals.js), injecte une carte par métier
// et branche une barre de recherche pour filtrer la liste.

(function () {
  const grid       = document.getElementById('metiersGrid');
  const searchInput = document.getElementById('metiersSearch');
  const noResults  = document.getElementById('metiersNoResults');

  if (!grid || typeof VERTICALS !== 'object') return;

  // Construit l'index des métiers : tableau prêt à filtrer + à rendre
  const items = Object.entries(VERTICALS).map(([key, v]) => ({
    key,
    label:    v.landingTitle || v.label || '',
    desc:     v.landingDesc || '',
    icon:     v.landingIcon || '⚡',
    // Texte indexé pour la recherche (label + desc + label complet)
    haystack: [
      v.landingTitle || '',
      v.landingDesc  || '',
      v.label        || ''
    ].join(' ').toLowerCase()
  }));

  function renderCards(filtered) {
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = filtered.map(item => `
      <a href="/pages/questionnaire.html?v=${item.key}" class="metier-card">
        <div class="metier-card-icon">${item.icon}</div>
        <div class="metier-card-title">${item.label}</div>
        <div class="metier-card-desc">${item.desc}</div>
        <div class="metier-card-cta">
          Démarrer le questionnaire
          <span>→</span>
        </div>
      </a>
    `).join('');
  }

  function filterCards(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      renderCards(items);
      return;
    }
    // On split la requête en mots — chaque mot doit être présent dans le haystack
    const words = q.split(/\s+/).filter(Boolean);
    const filtered = items.filter(item =>
      words.every(w => item.haystack.includes(w))
    );
    renderCards(filtered);
  }

  // Render initial : tous les métiers
  renderCards(items);

  // Branche la recherche
  if (searchInput) {
    searchInput.addEventListener('input', e => filterCards(e.target.value));
  }
})();
