// ===========================================
// SPOTTER · Dashboard branché sur Supabase
// ===========================================

let currentClient = null;
let currentRepetitions = [];

// ===========================================
// Helpers d'affichage
// ===========================================

const STATUT_LABELS = {
  detected:    'Détecté',
  automatable: 'Automatisable',
  automated:   'Automatisé',
};

const FREQ_UNIT_LABELS = {
  jour:    'par jour',
  semaine: 'par semaine',
  mois:    'par mois',
};

/** Formate un nombre de minutes en "Xh", "XhYY" ou "XXmin" */
function formatMinutes(min) {
  if (!min || min <= 0) return '0min';
  if (min < 60) return min + 'min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? h + 'h' : h + 'h' + String(m).padStart(2, '0');
}

/** Convertit le temps en minutes par semaine (selon l'unité) */
function toMinutesPerWeek(rep) {
  const m = rep.temps_perdu_minutes || 0;
  switch (rep.frequence_unit) {
    case 'jour':    return m * 7;
    case 'mois':    return m / 4.33;
    case 'semaine':
    default:        return m;
  }
}

/** Capitalise la 1ère lettre */
function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===========================================
// CALCUL DES STATS
// ===========================================

function computeStats(repetitions) {
  const total = repetitions.length;
  const totalMinPerWeek = repetitions.reduce((sum, r) => sum + toMinutesPerWeek(r), 0);

  // Gain potentiel = temps des répétitions automatisables OU automatisées
  const gainMinPerWeek = repetitions
    .filter(r => r.statut === 'automatable' || r.statut === 'automated')
    .reduce((sum, r) => sum + toMinutesPerWeek(r), 0);

  return {
    total,
    tempsPerduSem: formatMinutes(Math.round(totalMinPerWeek)),
    gainSem:       formatMinutes(Math.round(gainMinPerWeek)),
  };
}

// ===========================================
// RENDU
// ===========================================

function renderEmptyState(client) {
  return `
    <div class="page-header">
      <div class="cabinet-title">
        <h1>${escapeHtml(client.cabinet_name || client.email)}</h1>
        <div class="info">${escapeHtml(client.cabinet_info || capitalize(client.vertical || 'En attente'))}</div>
      </div>
      <div class="period-badge pending">Analyse en cours</div>
    </div>
    <div class="waiting-banner">
      <div class="waiting-icon">⏳</div>
      <div class="waiting-text">
        <div class="waiting-title">Pas encore de répétitions détectées</div>
        <div class="waiting-sub">L'outil tourne en fond. Dès que les premières actions répétitives seront détectées, elles apparaîtront ici.</div>
        <div class="waiting-progress"><div class="waiting-progress-fill"></div></div>
      </div>
    </div>
    <div class="empty-actions">
      <div class="empty-actions-icon">🔍</div>
      <div class="empty-actions-title">Détection en cours...</div>
      <div class="empty-actions-sub">Repassez d'ici quelques jours pour voir vos premières répétitions.</div>
    </div>
  `;
}

function renderLoadedState(client, repetitions) {
  const stats = computeStats(repetitions);

  return `
    <div class="page-header">
      <div class="cabinet-title">
        <h1>${escapeHtml(client.cabinet_name || client.email)}</h1>
        <div class="info">${escapeHtml(client.cabinet_info || capitalize(client.vertical || ''))}</div>
      </div>
      <div class="period-badge">${escapeHtml(client.period_label || 'Période en cours')}</div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Temps perdu / sem</div>
        <div class="stat-value danger">${stats.tempsPerduSem}</div>
        <div class="stat-sub">total cumulé sur les répétitions détectées</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Actions répétitives détectées</div>
        <div class="stat-value info">${stats.total}</div>
        <div class="stat-sub">${stats.total > 1 ? 'tâches identifiées' : 'tâche identifiée'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Gain potentiel / sem</div>
        <div class="stat-value success">${stats.gainSem}</div>
        <div class="stat-sub">si toutes les automatisables sont activées</div>
      </div>
    </div>

    <div class="section-title">📊 Top des actions répétitives détectées</div>
    <div class="actions-table">
      ${repetitions.map(renderRepetitionRow).join('')}
    </div>
  `;
}

function renderRepetitionRow(r) {
  const freqLabel = FREQ_UNIT_LABELS[r.frequence_unit] || 'par semaine';
  const statutLabel = STATUT_LABELS[r.statut] || r.statut;
  const statutCls   = `statut-${r.statut}`;

  return `
    <div class="action-row">
      <div>
        <div class="action-name">${escapeHtml(r.libelle)}</div>
        ${r.description ? `<div class="action-desc">${escapeHtml(r.description)}</div>` : ''}
        <span class="statut-badge ${statutCls}">${statutLabel}</span>
      </div>
      <div class="action-freq">
        ${r.frequence}×
        <div class="action-freq-sub">${freqLabel}</div>
      </div>
      <div class="action-time">${formatMinutes(r.temps_perdu_minutes)}</div>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===========================================
// INIT
// ===========================================

async function loadDashboard() {
  if (!window.spotterDB) {
    document.getElementById('dashboard').innerHTML =
      '<div class="dashboard-loading">Erreur de chargement Supabase. Recharge la page.</div>';
    return;
  }

  // 1) Auth check
  const session = await window.spotterDB.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // Si admin loggué, on l'envoie sur admin.html
  const adminEmail = (window.SPOTTER_CONFIG && window.SPOTTER_CONFIG.ADMIN_EMAIL) || '';
  const userEmail  = session.user.email || '';
  if (adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase()) {
    window.location.href = 'admin.html';
    return;
  }

  // 2) Profil client
  const { data: client, error: clientErr } = await window.spotterDB.getCurrentClient();
  if (clientErr || !client) {
    console.error('[Dashboard] Profil introuvable:', clientErr);
    document.getElementById('dashboard').innerHTML =
      '<div class="dashboard-loading">Profil introuvable. Recommence le questionnaire.</div>';
    return;
  }
  currentClient = client;

  // 3) Sidebar user
  document.querySelector('#sidebarUser .sidebar-user-email').textContent = client.email;
  document.querySelector('#sidebarUser .sidebar-user-vertical').textContent =
    capitalize(client.vertical || '');

  // 4) Répétitions
  const { data: reps } = await window.spotterDB.getRepetitionsForClient(client.id);
  currentRepetitions = reps || [];

  // 5) Render
  const dashboardEl = document.getElementById('dashboard');
  if (currentRepetitions.length === 0) {
    dashboardEl.innerHTML = renderEmptyState(client);
  } else {
    dashboardEl.innerHTML = renderLoadedState(client, currentRepetitions);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();

  document.getElementById('signOutBtn').addEventListener('click', async () => {
    if (window.spotterDB) await window.spotterDB.signOut();
    window.location.href = 'login.html';
  });
});
