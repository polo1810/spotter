// ===========================================
// SPOTTER · Définition des verticales métier
// ===========================================
// Ajouter une nouvelle cible = ajouter une entrée ici.
// Le questionnaire se génère entièrement depuis cette config.

const VERTICALS = {

  comptable: {
    label: 'Cabinet d\'expertise comptable',
    chip: 'Pour cabinets d\'expertise comptable',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Spotter spécifiquement pour vous.',
    // --- Méta pour la carte de la landing ---
    landingIcon: '📊',
    landingTitle: 'Expertise comptable',
    landingDesc: 'Pennylane, Cegid, OCR fournisseurs, reportings clients, relances justificatifs...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Sur quels outils principaux vous bossez au quotidien ?',
        helper: 'Sélectionnez tout ce qui s\'applique.',
        options: [
          { value: 'pennylane', label: 'Pennylane' },
          { value: 'cegid',     label: 'Cegid' },
          { value: 'tiime',     label: 'Tiime' },
          { value: 'dext',      label: 'Dext' },
          { value: 'outlook',   label: 'Outlook / Gmail' },
          { value: 'excel',     label: 'Excel' },
          { value: 'slack',     label: 'Slack / Teams' },
          { value: 'autre',     label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans le cabinet ?',
        options: [
          { value: 'expert',        label: 'Expert-comptable' },
          { value: 'collaborateur', label: 'Collaborateur comptable' },
          { value: 'chef',          label: 'Chef de cabinet / Dirigeant' },
          { value: 'assistant',     label: 'Assistant(e)' },
          { value: 'autre',         label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans le cabinet ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'clients', type: 'radio',
        question: 'Quel type de clientèle vous gérez principalement ?',
        options: [
          { value: 'tpe',    label: 'Surtout des TPE / indépendants' },
          { value: 'pme',    label: 'Surtout des PME' },
          { value: 'mix',    label: 'Un mix des deux' },
          { value: 'grands', label: 'Plutôt des grands comptes' },
        ]
      },
      {
        id: 'reports', type: 'radio',
        question: 'À quelle fréquence vous envoyez des reportings à vos clients ?',
        options: [
          { value: 'mensuel',      label: 'Mensuels (tous les mois)' },
          { value: 'trimestriel',  label: 'Trimestriels' },
          { value: 'annuel',       label: 'Plutôt annuels (bilans)' },
          { value: 'mix',          label: 'Un mix selon les clients' },
        ]
      },
      {
        id: 'comm', type: 'radio',
        question: 'Comment vous communiquez principalement avec vos clients ?',
        options: [
          { value: 'mail',    label: 'Par mail surtout' },
          { value: 'portail', label: 'Via un portail client (type Pennylane)' },
          { value: 'mix',     label: 'Un mix mail + portail' },
          { value: 'phone',   label: 'Beaucoup de téléphone aussi' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous faites tous les jours sans vraiment savoir pourquoi ?',
        helper: 'Genre des trucs hérités d\'une habitude qu\'on remet jamais en question.',
        options: [
          { value: 'oui-clair', label: 'Oui, très clairement' },
          { value: 'oui-vague', label: 'Probablement, mais je saurais pas dire lesquelles' },
          { value: 'non',       label: 'Non, je vois pas trop' },
        ]
      },
      {
        id: 'auto', type: 'radio',
        question: 'Vous avez déjà essayé d\'automatiser des choses dans votre quotidien ?',
        options: [
          { value: 'oui-bcp',   label: 'Oui, on a mis pas mal de trucs en place' },
          { value: 'oui-peu',   label: 'Quelques essais, mais rien de structuré' },
          { value: 'non-envie', label: 'Non, mais on aimerait s\'y mettre' },
          { value: 'non-temps', label: 'Non, on a jamais eu le temps' },
        ]
      },
      {
        id: 'hours', type: 'slider',
        question: 'Combien d\'heures par semaine vous estimez perdre sur des tâches répétitives ?',
        helper: 'À la louche. Ça nous aide à calibrer les seuils de détection.',
        min: 0, max: 15, step: 1, defaultValue: 5,
        formatValue: v => parseInt(v) >= 15 ? '15h+' : v + 'h'
      },
      {
        id: 'email', type: 'email',
        question: 'Quel email pour votre compte Spotter ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  recrutement: {
    label: 'Cabinet de recrutement',
    chip: 'Pour cabinets de recrutement',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Spotter spécifiquement pour votre activité.',
    // --- Méta pour la carte de la landing ---
    landingIcon: '🎯',
    landingTitle: 'Recrutement',
    landingDesc: 'ATS (Lever, Workable...), LinkedIn Recruiter, sourcing, viviers candidats, comptes-rendus mission...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils vous utilisez au quotidien ?',
        helper: 'Sélectionnez tout ce qui s\'applique.',
        options: [
          { value: 'linkedin',   label: 'LinkedIn Recruiter' },
          { value: 'workable',   label: 'Workable' },
          { value: 'lever',      label: 'Lever' },
          { value: 'greenhouse', label: 'Greenhouse' },
          { value: 'recruitee',  label: 'Recruitee' },
          { value: 'outlook',    label: 'Outlook / Gmail' },
          { value: 'excel',      label: 'Excel / Google Sheets' },
          { value: 'autre',      label: 'Autre ATS' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans le cabinet ?',
        options: [
          { value: 'consultant', label: 'Consultant(e) en recrutement' },
          { value: 'chasseur',   label: 'Chargé(e) de recherche / chasseur de tête' },
          { value: 'manager',    label: 'Manager / Responsable équipe' },
          { value: 'dirigeant',  label: 'Dirigeant(e) du cabinet' },
          { value: 'autre',      label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans le cabinet ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'profils', type: 'radio',
        question: 'Sur quels types de profils recrutez-vous principalement ?',
        options: [
          { value: 'tech',     label: 'Tech / IT' },
          { value: 'commerce', label: 'Commerce / Business Dev' },
          { value: 'finance',  label: 'Finance / Comptabilité' },
          { value: 'cadres',   label: 'Cadres dirigeants / C-level' },
          { value: 'volume',   label: 'Profils en volume' },
          { value: 'multi',    label: 'Tous secteurs / multi-spécialités' },
        ]
      },
      {
        id: 'vivier', type: 'radio',
        question: 'Comment gérez-vous votre vivier de candidats ?',
        options: [
          { value: 'ats',   label: 'Uniquement dans l\'ATS' },
          { value: 'excel', label: 'Excel / Google Sheets' },
          { value: 'crm',   label: 'CRM dédié (HubSpot, Salesforce...)' },
          { value: 'mix',   label: 'Un mix de plusieurs outils' },
          { value: 'aucun', label: 'Pas vraiment de vivier structuré' },
        ]
      },
      {
        id: 'missions', type: 'radio',
        question: 'Combien de missions actives gérez-vous simultanément ?',
        options: [
          { value: '1-5',  label: '1 à 5 missions' },
          { value: '6-15', label: '6 à 15 missions' },
          { value: '16-30',label: '16 à 30 missions' },
          { value: '30+',  label: 'Plus de 30 missions' },
        ]
      },
      {
        id: 'reporting', type: 'radio',
        question: 'Comment vous faites vos reportings clients (avancement des missions) ?',
        options: [
          { value: 'mail',    label: 'Par mail au fil de l\'eau' },
          { value: 'excel',   label: 'Fichier Excel / tableau partagé' },
          { value: 'portail', label: 'Portail ou outil dédié' },
          { value: 'etape',   label: 'À chaque étape clé uniquement' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous faites chaque semaine sans vraiment les remettre en question ?',
        helper: 'Reformatage de CVs, saisies répétées, copier-coller entre outils...',
        options: [
          { value: 'oui-clair', label: 'Oui, très clairement' },
          { value: 'oui-vague', label: 'Probablement, mais je saurais pas dire lesquelles' },
          { value: 'non',       label: 'Non, je vois pas trop' },
        ]
      },
      {
        id: 'hours', type: 'slider',
        question: 'Combien d\'heures par semaine vous estimez perdre sur des tâches répétitives ?',
        helper: 'À la louche. Ça nous aide à calibrer les seuils de détection.',
        min: 0, max: 15, step: 1, defaultValue: 5,
        formatValue: v => parseInt(v) >= 15 ? '15h+' : v + 'h'
      },
      {
        id: 'email', type: 'email',
        question: 'Quel email pour votre compte Spotter ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  }

};
