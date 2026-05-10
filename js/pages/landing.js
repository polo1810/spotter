// ===========================================
// SPOTTER · Landing — génération des cartes métiers
// ===========================================
// Lit VERTICALS (depuis verticals.js) et injecte une carte par métier.

(function renderMetierCards() {
  const grid = document.getElementById('metiersGrid');
  if (!grid || typeof VERTICALS !== 'object') return;

  const html = Object.entries(VERTICALS).map(([key, v]) => `
    <a href="questionnaire.html?v=${key}" class="metier-card">
      <div class="metier-card-icon">${v.landingIcon || '⚡'}</div>
      <div class="metier-card-title">${v.landingTitle || v.label}</div>
      <div class="metier-card-desc">${v.landingDesc || ''}</div>
      <div class="metier-card-cta">
        Démarrer le questionnaire
        <span>→</span>
      </div>
    </a>
  `).join('');

  grid.innerHTML = html;
})();
