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
      <div class="page-header-actions">
        ${renderPreviewToggleBtn(false)}
        <div class="period-badge pending">Analyse en cours</div>
      </div>
    </div>

    <div class="waiting-banner">
      <div class="waiting-icon">⏳</div>
      <div class="waiting-text">
        <div class="waiting-title">Pas encore de répétitions détectées</div>
        <div class="waiting-sub">L'outil tourne en fond. Dès que les premières actions répétitives seront détectées, elles apparaîtront ici.</div>
        <div class="waiting-progress"><div class="waiting-progress-fill"></div></div>
      </div>
    </div>

    <div class="section-title">📊 Top des actions répétitives détectées <span class="section-pending-badge">EN COURS</span></div>
    <div class="empty-actions">
      <div class="empty-actions-icon">🔍</div>
      <div class="empty-actions-title">Détection en cours...</div>
      <div class="empty-actions-sub">Repassez d'ici quelques jours pour voir vos premières répétitions.</div>
    </div>

    <div class="section-title">⚡ Automatisations prêtes à activer <span class="section-pending-badge">À VENIR</span></div>
    <div class="empty-autos">
      <div class="empty-autos-icon">⚡</div>
      <div class="empty-autos-title">On prépare vos automatisations</div>
      <div class="empty-autos-sub">Une fois l'analyse terminée, on vous proposera ici des automatisations <strong>conçues spécifiquement pour vos pertes de temps</strong>, activables en un clic.</div>
    </div>

    ${renderPreviewSection(client, { hidden: false })}
  `;
}

// ===========================================
// SECTION APERÇU (démo : ce à quoi ressemble le dashboard une fois rempli)
// Données indexées par vertical pour que les exemples parlent au métier du client
// ===========================================

const PREVIEW_DATA = {
  comptable: {
    repetitions: [
      { libelle: "Renommage manuel pièces OCR",         description: "Correction du nom fournisseur ou date après OCR Pennylane",   frequence: 87, frequence_unit: 'semaine', temps_perdu_minutes: 165, statut: 'detected' },
      { libelle: "Réponses récurrentes par mail",       description: "Mêmes formulations envoyées plusieurs fois aux clients",       frequence: 52, frequence_unit: 'semaine', temps_perdu_minutes: 135, statut: 'automatable' },
      { libelle: "Export Pennylane → Excel reportings", description: "Retraitement manuel pour reportings clients mensuels",          frequence: 12, frequence_unit: 'semaine', temps_perdu_minutes: 110, statut: 'automatable' },
      { libelle: "Saisie multi-endroits info client",   description: "Mise à jour adresse/RIB sur Pennylane + Excel suivi",           frequence: 8,  frequence_unit: 'semaine', temps_perdu_minutes: 55,  statut: 'detected' },
      { libelle: "Vérification cohérence TVA",          description: "Contrôle manuel entre Pennylane et déclaration",                frequence: 6,  frequence_unit: 'mois',    temps_perdu_minutes: 45,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Auto-correction OCR fournisseurs récurrents",
        desc:  "On identifie les fournisseurs qui posent problème à l'OCR et on pré-paramètre une règle de mapping qui corrige automatiquement le nom + la date.",
        gain:  "+2h15/sem",
        tools: ["Pennylane"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Templates de réponse mail intelligents",
        desc:  "Les 5 réponses-types qui reviennent dans 80% de vos mails clients sont transformées en raccourcis Outlook, prêts à l'emploi.",
        gain:  "+1h50/sem",
        tools: ["Outlook"],
        effort: "0 ligne de code · 1 minute"
      },
      {
        title: "Export Pennylane → reporting client en 1 clic",
        desc:  "On automatise le retraitement Excel mensuel : extraction Pennylane, mise en forme, envoi au client.",
        gain:  "+1h30/sem",
        tools: ["Pennylane", "Excel", "Outlook"],
        effort: "0 ligne de code · 3 minutes"
      }
    ]
  },

  recrutement: {
    repetitions: [
      { libelle: "Reformatage de CVs avant envoi client",        description: "Adaptation manuelle au template du cabinet (logo, sections, mise en page)", frequence: 35,  frequence_unit: 'semaine', temps_perdu_minutes: 165, statut: 'automatable' },
      { libelle: "Messages LinkedIn de prise de contact",        description: "Mêmes formulations envoyées sur des dizaines de profils similaires",        frequence: 120, frequence_unit: 'semaine', temps_perdu_minutes: 200, statut: 'detected'    },
      { libelle: "Mise à jour fiche candidat dans l'ATS",        description: "Recopie d'infos depuis LinkedIn / mail vers l'ATS (Workable, Lever...)",    frequence: 45,  frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'automatable' },
      { libelle: "Reportings hebdo aux clients",                 description: "Compilation manuelle d'un point d'avancement par mission, par client",       frequence: 8,   frequence_unit: 'semaine', temps_perdu_minutes: 60,  statut: 'automatable' },
      { libelle: "Recherches LinkedIn récurrentes",              description: "Mêmes filtres / mêmes booléens lancés chaque semaine pour scanner le marché",frequence: 25,  frequence_unit: 'semaine', temps_perdu_minutes: 50,  statut: 'automated'   },
    ],
    autos: [
      {
        title: "Auto-formatage CV au template cabinet",
        desc:  "À chaque CV reçu, on l'extrait automatiquement et on le reformate aux couleurs et à la mise en page du cabinet, prêt à envoyer au client.",
        gain:  "+2h45/sem",
        tools: ["Outlook", "Drive"],
        effort: "0 ligne de code · 3 minutes"
      },
      {
        title: "Templates LinkedIn personnalisés intelligents",
        desc:  "Vos 5 messages-types les plus utilisés en raccourci, avec personnalisation auto (prénom, poste, entreprise) à partir du profil LinkedIn.",
        gain:  "+2h00/sem",
        tools: ["LinkedIn"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Sync ATS automatique depuis LinkedIn",
        desc:  "Plus besoin de recopier : à chaque candidat ajouté dans LinkedIn Recruiter, sa fiche se crée automatiquement dans votre ATS avec les infos extraites.",
        gain:  "+1h30/sem",
        tools: ["LinkedIn", "Workable"],
        effort: "0 ligne de code · 4 minutes"
      }
    ]
  }
};

function getPreviewData(vertical) {
  return PREVIEW_DATA[vertical] || PREVIEW_DATA.comptable;
}

function renderPreviewSection(client, { hidden = false } = {}) {
  const data = getPreviewData(client && client.vertical);
  const stats = computeStats(data.repetitions);

  return `
    <div id="previewWrapper" class="preview-section" style="${hidden ? 'display:none;' : ''}">
      <div class="preview-banner">
        <div class="preview-banner-icon">👁️</div>
        <div class="preview-banner-text">
          <div class="preview-banner-title">Aperçu — voici à quoi ressemblera votre dashboard</div>
          <div class="preview-banner-sub">Ces données sont fictives, choisies pour ton métier. Elles donnent une idée concrète de ce que tu verras une fois l'analyse terminée.</div>
        </div>
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
          <div class="stat-sub">tâches identifiées</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Gain potentiel / sem</div>
          <div class="stat-value success">${stats.gainSem}</div>
          <div class="stat-sub">si toutes les automatisables sont activées</div>
        </div>
      </div>

      <div class="section-title">📊 Top des actions répétitives détectées</div>
      <div class="actions-table">
        ${data.repetitions.map(renderRepetitionRow).join('')}
      </div>

      <div class="section-title">⚡ Automatisations prêtes à activer</div>
      <div class="auto-list">
        ${data.autos.map(renderPreviewAutoCard).join('')}
      </div>
    </div>
  `;
}

// Bouton toggle visible en permanence dans la page-header
function renderPreviewToggleBtn(initiallyHidden) {
  return `
    <button class="preview-toggle-btn" id="previewToggleBtn" data-hidden="${initiallyHidden ? '1' : '0'}">
      ${initiallyHidden ? '👁️ Voir l\'aperçu démo' : '✕ Masquer l\'aperçu'}
    </button>
  `;
}

// Toggle global, déclenché par le bouton
function togglePreview() {
  const wrapper = document.getElementById('previewWrapper');
  const btn     = document.getElementById('previewToggleBtn');
  if (!wrapper || !btn) return;

  const isHidden = wrapper.style.display === 'none';
  if (isHidden) {
    wrapper.style.display = '';
    btn.textContent = '✕ Masquer l\'aperçu';
    btn.dataset.hidden = '0';
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    wrapper.style.display = 'none';
    btn.textContent = '👁️ Voir l\'aperçu démo';
    btn.dataset.hidden = '1';
  }
}

function renderPreviewAutoCard(a) {
  return `
    <div class="auto-card preview-auto-card">
      <div class="auto-header">
        <div class="auto-title-block">
          <div class="auto-prefix">⚡ Automatisation conçue pour vous</div>
          <div class="auto-title">${escapeHtml(a.title)}</div>
          <div class="auto-desc">${escapeHtml(a.desc)}</div>
        </div>
        <div class="auto-gain-badge">${escapeHtml(a.gain)}</div>
      </div>
      <div class="auto-tools">
        ${a.tools.map((t, i) => `
          <span class="tool-chip">🔌 ${escapeHtml(t)}</span>
          ${i < a.tools.length - 1 ? '<span class="tool-arrow">→</span>' : ''}
        `).join('')}
      </div>
      <div class="auto-footer">
        <div class="auto-effort">⚙️ <strong>${escapeHtml(a.effort)}</strong></div>
        <button class="activate-btn preview-activate-btn" disabled title="Aperçu — disponible une fois l'analyse terminée">
          Activer en un clic →
        </button>
      </div>
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
      <div class="page-header-actions">
        ${renderPreviewToggleBtn(true)}
        <div class="period-badge">${escapeHtml(client.period_label || 'Période en cours')}</div>
      </div>
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

    ${renderPreviewSection(client, { hidden: true })}
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
    window.location.href = '/pages/login.html';
    return;
  }

  // Si admin loggué, on l'envoie sur admin.html
  const adminEmail = (window.SPOTTER_CONFIG && window.SPOTTER_CONFIG.ADMIN_EMAIL) || '';
  const userEmail  = session.user.email || '';
  if (adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase()) {
    window.location.href = '/pages/admin.html';
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

  // 6) Bouton toggle de l'aperçu démo
  const toggleBtn = document.getElementById('previewToggleBtn');
  if (toggleBtn) toggleBtn.addEventListener('click', togglePreview);
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();

  document.getElementById('signOutBtn').addEventListener('click', async () => {
    if (window.spotterDB) await window.spotterDB.signOut();
    window.location.href = '/pages/login.html';
  });
});
