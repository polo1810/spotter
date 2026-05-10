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
  },

  avocat: {
    repetitions: [
      { libelle: "Recherches de jurisprudence répétitives",      description: "Mêmes requêtes Doctrine / Lexis lancées plusieurs fois par semaine",         frequence: 28, frequence_unit: 'semaine', temps_perdu_minutes: 130, statut: 'automatable' },
      { libelle: "Rédaction d'actes-types répétés",              description: "Mêmes mises en demeure / contrats / conclusions adaptés à la marge",         frequence: 18, frequence_unit: 'semaine', temps_perdu_minutes: 180, statut: 'automatable' },
      { libelle: "Suivi facturation au temps passé",             description: "Saisie manuelle des temps dans Excel + relances clients",                    frequence: 40, frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'detected' },
      { libelle: "Réponses récurrentes aux clients",             description: "Mêmes formulations envoyées plusieurs fois par mail aux clients",            frequence: 35, frequence_unit: 'semaine', temps_perdu_minutes: 75,  statut: 'detected' },
      { libelle: "Vérifications de pièces de dossier",           description: "Pointage manuel des documents reçus / manquants par dossier",                 frequence: 12, frequence_unit: 'semaine', temps_perdu_minutes: 60,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Bibliothèque d'actes-types pré-personnalisés",
        desc:  "Vos modèles d'actes les plus utilisés (mises en demeure, contrats, conclusions) auto-complétés avec les données du dossier en un clic.",
        gain:  "+2h30/sem",
        tools: ["Word"],
        effort: "0 ligne de code · 3 minutes"
      },
      {
        title: "Suivi facturation horaire automatisé",
        desc:  "Détection automatique du temps passé sur chaque dossier (mails, documents) et compilation pour facturation mensuelle.",
        gain:  "+1h45/sem",
        tools: ["Outlook", "Excel"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Templates de réponses mail intelligents",
        desc:  "Les formulations qui reviennent dans 80% de vos mails clients transformées en raccourcis Outlook.",
        gain:  "+1h15/sem",
        tools: ["Outlook"],
        effort: "0 ligne de code · 1 minute"
      }
    ]
  },

  immobilier: {
    repetitions: [
      { libelle: "Mise à jour des annonces multi-portails",       description: "Modifications manuelles sur SeLoger, Leboncoin, etc. après chaque update Hektor", frequence: 22, frequence_unit: 'semaine', temps_perdu_minutes: 110, statut: 'automatable' },
      { libelle: "Relances clients après visite",                description: "Même mail/SMS envoyé après chaque visite pour récolter le retour",            frequence: 45, frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'detected' },
      { libelle: "Comptes-rendus de visite",                     description: "Rédaction manuelle des observations + envoi au propriétaire",                 frequence: 30, frequence_unit: 'semaine', temps_perdu_minutes: 75,  statut: 'automatable' },
      { libelle: "Édition de mandats de vente / location",       description: "Recopie des informations propriétaire / bien dans le contrat",                frequence: 6,  frequence_unit: 'semaine', temps_perdu_minutes: 60,  statut: 'detected' },
      { libelle: "Reporting hebdo aux propriétaires",            description: "Point sur les visites + retours sur leurs biens",                              frequence: 18, frequence_unit: 'semaine', temps_perdu_minutes: 45,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Sync multi-portails automatique",
        desc:  "Mise à jour Hektor → propagation auto sur SeLoger, Leboncoin Pro, votre site, sans toucher à chaque portail à la main.",
        gain:  "+2h15/sem",
        tools: ["Hektor", "SeLoger", "Leboncoin"],
        effort: "0 ligne de code · 3 minutes"
      },
      {
        title: "Relance post-visite automatisée",
        desc:  "Après chaque visite, envoi automatique d'un mail/SMS personnalisé pour récupérer le feedback du visiteur.",
        gain:  "+1h30/sem",
        tools: ["Outlook", "WhatsApp"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Reporting propriétaires en 1 clic",
        desc:  "Génération auto d'un rapport hebdomadaire par bien (visites, retours, contacts) envoyé directement au propriétaire.",
        gain:  "+1h00/sem",
        tools: ["Hektor", "Outlook"],
        effort: "0 ligne de code · 2 minutes"
      }
    ]
  },

  architecte: {
    repetitions: [
      { libelle: "Comptes-rendus de chantier hebdomadaires",     description: "Mise en forme + photos + envoi à toutes les parties prenantes",                frequence: 6,  frequence_unit: 'semaine', temps_perdu_minutes: 165, statut: 'automatable' },
      { libelle: "Mise à jour de plans après réunion",           description: "Reprise manuelle des annotations dans AutoCAD / Revit",                       frequence: 12, frequence_unit: 'semaine', temps_perdu_minutes: 130, statut: 'detected' },
      { libelle: "Demandes de pièces aux entreprises",           description: "Relances mail récurrentes pour récupérer DOE, attestations, devis...",        frequence: 25, frequence_unit: 'semaine', temps_perdu_minutes: 75,  statut: 'automatable' },
      { libelle: "Préparation dossiers permis de construire",    description: "Compilation manuelle des pièces standards (notice, plans, formulaires)",      frequence: 3,  frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'detected' },
      { libelle: "Nomenclatures et bordereaux récurrents",       description: "Recopie de quantitatifs entre logiciels / Excel",                              frequence: 8,  frequence_unit: 'semaine', temps_perdu_minutes: 50,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Comptes-rendus de chantier auto-générés",
        desc:  "Saisie sur tablette pendant la visite → génération auto du CR avec photos, mise en page, envoi à la liste de diffusion.",
        gain:  "+2h45/sem",
        tools: ["Word", "Outlook"],
        effort: "0 ligne de code · 4 minutes"
      },
      {
        title: "Relances pièces automatiques par dossier",
        desc:  "Suivi automatique des pièces attendues par entreprise + relance par mail à J+7 si manquantes.",
        gain:  "+1h15/sem",
        tools: ["Outlook", "Excel"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Templates dossier permis pré-remplis",
        desc:  "Génération automatique des pièces administratives standards à partir des informations du projet (CERFA, notice, etc.).",
        gain:  "+1h30/sem",
        tools: ["Word"],
        effort: "0 ligne de code · 3 minutes"
      }
    ]
  },

  conseil: {
    repetitions: [
      { libelle: "Mise en forme de slides PowerPoint",           description: "Reprise du template cabinet / mise aux couleurs sur chaque livrable",          frequence: 18, frequence_unit: 'semaine', temps_perdu_minutes: 165, statut: 'automatable' },
      { libelle: "Comptes-rendus de réunion clients",            description: "Rédaction manuelle des CR + envoi à la liste de diffusion",                    frequence: 12, frequence_unit: 'semaine', temps_perdu_minutes: 110, statut: 'automatable' },
      { libelle: "Dashboards Excel récurrents",                  description: "Recopie/retraitement de données pour les mêmes indicateurs chaque mois",       frequence: 8,  frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'detected' },
      { libelle: "Propales clients",                             description: "Rédaction de propositions commerciales avec sections récurrentes",            frequence: 4,  frequence_unit: 'semaine', temps_perdu_minutes: 75,  statut: 'detected' },
      { libelle: "Suivi hebdo des missions en cours",            description: "Compilation manuelle de l'avancement multi-missions pour le management",       frequence: 5,  frequence_unit: 'semaine', temps_perdu_minutes: 45,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Auto-mise en page slides au template cabinet",
        desc:  "Glisser-déposer du contenu brut → application auto du template (couleurs, polices, footer, numérotation).",
        gain:  "+2h30/sem",
        tools: ["PowerPoint"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "CR de réunion automatisés",
        desc:  "Transcription auto + structuration en CR formaté + envoi à la liste de diffusion en un clic.",
        gain:  "+1h45/sem",
        tools: ["Outlook", "Word"],
        effort: "0 ligne de code · 3 minutes"
      },
      {
        title: "Bibliothèque de propales modulaires",
        desc:  "Sections-types pré-rédigées (méthodologie, équipe, planning) à assembler en quelques clics selon le client.",
        gain:  "+1h15/sem",
        tools: ["Word", "PowerPoint"],
        effort: "0 ligne de code · 3 minutes"
      }
    ]
  },

  marketing: {
    repetitions: [
      { libelle: "Reportings clients récurrents",                description: "Export Google Ads + Meta + GA4 → mise en forme dans le template agence",       frequence: 22, frequence_unit: 'semaine', temps_perdu_minutes: 180, statut: 'automatable' },
      { libelle: "Paramétrage de campagnes similaires",          description: "Copie de structures Google/Meta Ads avec ajustements à la marge",              frequence: 14, frequence_unit: 'semaine', temps_perdu_minutes: 120, statut: 'detected' },
      { libelle: "Posts récurrents sur réseaux sociaux",         description: "Adaptation des mêmes formats (carrousels, posts) sur 3-4 plateformes",          frequence: 30, frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'automatable' },
      { libelle: "Briefings créatifs",                           description: "Rédaction des briefs DA avec mêmes sections par projet",                       frequence: 8,  frequence_unit: 'semaine', temps_perdu_minutes: 60,  statut: 'detected' },
      { libelle: "Suivi mensuel des KPI multi-clients",          description: "Compilation manuelle de la performance globale pour le management",            frequence: 1,  frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Reportings multi-plateformes auto-générés",
        desc:  "Connexion Google Ads + Meta + GA4 → reporting client formaté envoyé automatiquement chaque lundi.",
        gain:  "+3h00/sem",
        tools: ["Google Ads", "Meta Ads", "Google Analytics"],
        effort: "0 ligne de code · 4 minutes"
      },
      {
        title: "Cross-posting réseaux sociaux automatisé",
        desc:  "Un post → adaptation auto du format pour LinkedIn + Insta + Facebook + publication programmée.",
        gain:  "+1h30/sem",
        tools: ["LinkedIn", "Meta", "Canva"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Templates briefs créatifs intelligents",
        desc:  "Génération auto du brief créa avec contexte client, objectifs, contraintes pré-remplis depuis votre CRM.",
        gain:  "+1h00/sem",
        tools: ["HubSpot", "Notion"],
        effort: "0 ligne de code · 3 minutes"
      }
    ]
  },

  formation: {
    repetitions: [
      { libelle: "Conventions de formation à émettre",            description: "Recopie des données apprenant + entreprise dans le modèle de convention",      frequence: 18, frequence_unit: 'semaine', temps_perdu_minutes: 110, statut: 'automatable' },
      { libelle: "Attestations de présence post-session",         description: "Génération + envoi individuel des attestations à chaque apprenant",            frequence: 35, frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'automatable' },
      { libelle: "Relances apprenants entre les modules",         description: "Mêmes mails de motivation envoyés à chaque cohorte",                            frequence: 50, frequence_unit: 'semaine', temps_perdu_minutes: 75,  statut: 'detected' },
      { libelle: "Préparation de supports avant chaque session",  description: "Reprise et mise à jour des supports PowerPoint à la marge",                    frequence: 12, frequence_unit: 'semaine', temps_perdu_minutes: 90,  statut: 'detected' },
      { libelle: "Relances OPCO / pièces de financement",         description: "Mails de suivi pour les financements en cours",                                 frequence: 8,  frequence_unit: 'semaine', temps_perdu_minutes: 50,  statut: 'automated' },
    ],
    autos: [
      {
        title: "Génération auto conventions + attestations",
        desc:  "À l'inscription d'un apprenant → convention pré-remplie. À la fin de session → attestation auto envoyée. Plus besoin de copier-coller.",
        gain:  "+2h30/sem",
        tools: ["Digiforma", "Outlook"],
        effort: "0 ligne de code · 3 minutes"
      },
      {
        title: "Séquences de relance apprenants",
        desc:  "Vos mails de motivation et rappels programmés automatiquement entre chaque module, par cohorte.",
        gain:  "+1h30/sem",
        tools: ["Outlook"],
        effort: "0 ligne de code · 2 minutes"
      },
      {
        title: "Bibliothèque de supports modulaires",
        desc:  "Sections-types à assembler en quelques clics pour préparer un nouveau support sans repartir de zéro.",
        gain:  "+1h15/sem",
        tools: ["PowerPoint"],
        effort: "0 ligne de code · 3 minutes"
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
