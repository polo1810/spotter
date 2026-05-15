// ===========================================
// PRODUCTLY · Définition des verticales métier
// ===========================================
// Ajouter une nouvelle cible = ajouter une entrée ici.
// Le questionnaire se génère entièrement depuis cette config.

const VERTICALS = {

  comptable: {
    label: 'Cabinet d\'expertise comptable',
    chip: 'Pour cabinets d\'expertise comptable',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly spécifiquement pour vous.',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  recrutement: {
    label: 'Cabinet de recrutement',
    chip: 'Pour cabinets de recrutement',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly spécifiquement pour votre activité.',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  // ===========================================
  // CABINET DE GESTION DE PATRIMOINE
  // ===========================================
  patrimoine: {
    label: 'Cabinet de gestion de patrimoine',
    chip: 'Pour conseillers en gestion de patrimoine',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité de gestion de patrimoine.',
    landingIcon: '💰',
    landingTitle: 'Gestion de patrimoine',
    landingDesc: 'Harvest O2S, Quantalys, MoneyPitch, bilans patrimoniaux, agrégation de comptes, reportings clients...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils utilisez-vous au quotidien ?',
        helper: 'Sélectionnez tout ce qui s\'applique.',
        options: [
          { value: 'harvest',    label: 'Harvest (O2S, Big Expert)' },
          { value: 'quantalys',  label: 'Quantalys' },
          { value: 'moneypitch', label: 'MoneyPitch' },
          { value: 'manymore',   label: 'Manymore' },
          { value: 'kwiper',     label: 'Kwiper' },
          { value: 'outlook',    label: 'Outlook / Gmail' },
          { value: 'excel',      label: 'Excel' },
          { value: 'crm',        label: 'CRM (Salesforce, Ines...)' },
          { value: 'autre',      label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans le cabinet ?',
        options: [
          { value: 'cgp',           label: 'Conseiller en gestion de patrimoine' },
          { value: 'dirigeant',     label: 'Gérant / Dirigeant du cabinet' },
          { value: 'familyofficer', label: 'Family officer' },
          { value: 'assistant',     label: 'Assistant(e) de gestion' },
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
        id: 'specialite', type: 'radio',
        question: 'Quel est votre domaine de conseil principal ?',
        options: [
          { value: 'financier',    label: 'Placements financiers / assurance-vie' },
          { value: 'immo',         label: 'Immobilier (SCPI, défiscalisation)' },
          { value: 'fiscal',       label: 'Optimisation fiscale' },
          { value: 'transmission', label: 'Transmission / succession' },
          { value: 'global',       label: 'Conseil patrimonial global (360°)' },
        ]
      },
      {
        id: 'clients', type: 'radio',
        question: 'Quel type de clientèle gérez-vous principalement ?',
        options: [
          { value: 'particuliers', label: 'Particuliers / cadres' },
          { value: 'dirigeants',   label: 'Chefs d\'entreprise / indépendants' },
          { value: 'hautrevenu',   label: 'Clientèle haut de gamme (HNWI)' },
          { value: 'mix',          label: 'Un mix de profils' },
        ]
      },
      {
        id: 'remuneration', type: 'radio',
        question: 'Comment êtes-vous rémunéré principalement ?',
        options: [
          { value: 'retro',      label: 'Rétrocessions sur encours' },
          { value: 'honoraires', label: 'Honoraires de conseil' },
          { value: 'courtage',   label: 'Commissions de courtage' },
          { value: 'mix',        label: 'Un mix des trois' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous faites toutes les semaines sans vraiment les remettre en question ?',
        helper: 'Bilans patrimoniaux, agrégation de comptes, relances de pièces, saisies KYC...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  // ===========================================
  // AGENCE IMMOBILIÈRE
  // ===========================================
  immobilier: {
    label: 'Agence immobilière',
    chip: 'Pour agences immobilières',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité immobilière.',
    landingIcon: '🏠',
    landingTitle: 'Agence immobilière',
    landingDesc: 'Hektor, Apimo, gestion mandats, suivi visites, relances clients, photos d\'annonces...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils utilisez-vous au quotidien ?',
        options: [
          { value: 'hektor',     label: 'Hektor' },
          { value: 'apimo',      label: 'Apimo' },
          { value: 'jestimo',    label: 'Jestimo' },
          { value: 'imobble',    label: 'Imobble' },
          { value: 'leboncoin',  label: 'Leboncoin Pro' },
          { value: 'seloger',    label: 'SeLoger' },
          { value: 'outlook',    label: 'Outlook / Gmail' },
          { value: 'whatsapp',   label: 'WhatsApp Business' },
          { value: 'autre',      label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans l\'agence ?',
        options: [
          { value: 'gerant',       label: 'Gérant(e) / Dirigeant(e)' },
          { value: 'commercial',   label: 'Conseiller / Négociateur' },
          { value: 'assistant',    label: 'Assistant(e) commercial(e)' },
          { value: 'gestion',      label: 'Gestionnaire de biens' },
          { value: 'autre',        label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans l\'agence ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'specialite', type: 'radio',
        question: 'Sur quel segment êtes-vous principalement positionné ?',
        options: [
          { value: 'residentiel-vente',     label: 'Résidentiel - vente' },
          { value: 'residentiel-location',  label: 'Résidentiel - location' },
          { value: 'gestion-locative',      label: 'Gestion locative' },
          { value: 'commercial',            label: 'Immobilier commercial / professionnel' },
          { value: 'neuf',                  label: 'Programmes neufs' },
          { value: 'mix',                   label: 'Plusieurs segments' },
        ]
      },
      {
        id: 'mandats', type: 'radio',
        question: 'Combien de mandats actifs gérez-vous en moyenne ?',
        options: [
          { value: '1-10',  label: 'Moins de 10' },
          { value: '11-30', label: '11 à 30' },
          { value: '31-80', label: '31 à 80' },
          { value: '80+',   label: 'Plus de 80' },
        ]
      },
      {
        id: 'comm', type: 'radio',
        question: 'Comment vous communiquez principalement avec vos clients ?',
        options: [
          { value: 'mail',     label: 'Surtout par mail' },
          { value: 'tel',      label: 'Surtout par téléphone' },
          { value: 'whatsapp', label: 'Beaucoup de WhatsApp/SMS' },
          { value: 'mix',      label: 'Un mix des trois' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous faites toutes les semaines sans y penser ?',
        helper: 'Relances, mises à jour d\'annonces, comptes-rendus de visite...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@agence.fr'
      }
    ]
  },

  // ===========================================
  // CABINET D'ARCHITECTES
  // ===========================================
  architecte: {
    label: 'Cabinet d\'architectes',
    chip: 'Pour cabinets d\'architectes',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité.',
    landingIcon: '📐',
    landingTitle: 'Architecte',
    landingDesc: 'AutoCAD, Revit, ArchiCAD, suivi de chantier, dossiers permis, comptes-rendus de visite...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels logiciels utilisez-vous principalement ?',
        options: [
          { value: 'autocad',   label: 'AutoCAD' },
          { value: 'revit',     label: 'Revit / BIM' },
          { value: 'archicad',  label: 'ArchiCAD' },
          { value: 'sketchup',  label: 'SketchUp' },
          { value: 'allplan',   label: 'Allplan' },
          { value: 'outlook',   label: 'Outlook / Gmail' },
          { value: 'excel',     label: 'Excel' },
          { value: 'autre',     label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans le cabinet ?',
        options: [
          { value: 'associe',     label: 'Architecte associé / dirigeant' },
          { value: 'salarie',     label: 'Architecte salarié' },
          { value: 'dessinateur', label: 'Dessinateur / Projeteur' },
          { value: 'travaux',     label: 'Conducteur de travaux' },
          { value: 'assistant',   label: 'Assistant(e) administratif(ve)' },
          { value: 'autre',       label: 'Autre' },
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
        id: 'projets', type: 'radio',
        question: 'Sur quel type de projets travaillez-vous principalement ?',
        options: [
          { value: 'residentiel', label: 'Résidentiel (maisons, immeubles)' },
          { value: 'tertiaire',   label: 'Tertiaire / bureaux' },
          { value: 'public',      label: 'Équipements publics' },
          { value: 'reno',        label: 'Rénovation / réhabilitation' },
          { value: 'mix',         label: 'Plusieurs typologies' },
        ]
      },
      {
        id: 'phase', type: 'radio',
        question: 'Sur quelle phase passez-vous le plus de temps ?',
        options: [
          { value: 'esquisse',  label: 'Esquisse / APS' },
          { value: 'apd',       label: 'APD / DCE' },
          { value: 'execution', label: 'Exécution / DET' },
          { value: 'chantier',  label: 'Suivi de chantier' },
          { value: 'mix',       label: 'Un peu de tout selon les projets' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous faites toutes les semaines sans vraiment y penser ?',
        helper: 'Comptes-rendus de chantier, mises à jour de plans, demandes de pièces...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  // ===========================================
  // CABINET DE CONSEIL / CONSULTANTS
  // ===========================================
  conseil: {
    label: 'Cabinet de conseil',
    chip: 'Pour cabinets de conseil',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité de conseil.',
    landingIcon: '💼',
    landingTitle: 'Conseil & Consultants',
    landingDesc: 'PowerPoint, Excel, Notion, livrables clients, comptes-rendus de mission, propales...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils utilisez-vous au quotidien ?',
        options: [
          { value: 'powerpoint',label: 'PowerPoint / Google Slides' },
          { value: 'excel',     label: 'Excel / Google Sheets' },
          { value: 'notion',    label: 'Notion' },
          { value: 'slack',     label: 'Slack / Teams' },
          { value: 'outlook',   label: 'Outlook / Gmail' },
          { value: 'hubspot',   label: 'HubSpot / Salesforce' },
          { value: 'trello',    label: 'Trello / Asana / Monday' },
          { value: 'autre',     label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle ?',
        options: [
          { value: 'associe',   label: 'Associé(e) / Dirigeant(e)' },
          { value: 'manager',   label: 'Manager / Directeur de mission' },
          { value: 'senior',    label: 'Consultant(e) senior' },
          { value: 'junior',    label: 'Consultant(e) junior' },
          { value: 'solo',      label: 'Consultant(e) indépendant(e)' },
          { value: 'autre',     label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans la structure ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'specialite', type: 'radio',
        question: 'Quelle est votre spécialité principale ?',
        options: [
          { value: 'strategie',     label: 'Stratégie' },
          { value: 'organisation',  label: 'Organisation / Transformation' },
          { value: 'rh',            label: 'RH / Management' },
          { value: 'it',            label: 'IT / Digital' },
          { value: 'finance',       label: 'Finance / Performance' },
          { value: 'mix',           label: 'Plusieurs domaines' },
        ]
      },
      {
        id: 'clients', type: 'radio',
        question: 'Quel type de clients gérez-vous principalement ?',
        options: [
          { value: 'tpe',       label: 'TPE / startups' },
          { value: 'pme',       label: 'PME' },
          { value: 'eti',       label: 'ETI' },
          { value: 'grands',    label: 'Grands comptes' },
          { value: 'mix',       label: 'Un mix selon les missions' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches récurrentes que vous refaites de mission en mission ?',
        helper: 'Mise en forme de slides, comptes-rendus, dashboards Excel...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@cabinet.fr'
      }
    ]
  },

  // ===========================================
  // AGENCE MARKETING / COMMUNICATION
  // ===========================================
  marketing: {
    label: 'Agence marketing & communication',
    chip: 'Pour agences marketing',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité marketing.',
    landingIcon: '📣',
    landingTitle: 'Marketing & Com',
    landingDesc: 'HubSpot, Mailchimp, Google Ads, LinkedIn, reportings clients, suivis de campagne...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils utilisez-vous au quotidien ?',
        options: [
          { value: 'hubspot',     label: 'HubSpot' },
          { value: 'mailchimp',   label: 'Mailchimp / Brevo' },
          { value: 'gads',        label: 'Google Ads' },
          { value: 'meta',        label: 'Meta Ads (Facebook/Instagram)' },
          { value: 'linkedin',    label: 'LinkedIn (Sales Nav / Ads)' },
          { value: 'analytics',   label: 'Google Analytics / GA4' },
          { value: 'canva',       label: 'Canva / Adobe' },
          { value: 'notion',      label: 'Notion / Asana' },
          { value: 'autre',       label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle dans l\'agence ?',
        options: [
          { value: 'dirigeant',  label: 'Dirigeant(e) / fondateur(rice)' },
          { value: 'account',    label: 'Account manager / chef de projet' },
          { value: 'creative',   label: 'Créa / DA / Rédacteur' },
          { value: 'traffic',    label: 'Traffic manager / SEA / SEO' },
          { value: 'social',     label: 'Social media manager' },
          { value: 'autre',      label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans l\'agence ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'offre', type: 'radio',
        question: 'Quelle est votre offre principale ?',
        options: [
          { value: 'paid',        label: 'Acquisition payante (SEA / Social Ads)' },
          { value: 'content',     label: 'Content / SEO / Branding' },
          { value: 'social',      label: 'Social media / Community management' },
          { value: 'fullservice', label: 'Full service / 360°' },
          { value: 'evt',         label: 'Événementiel / RP' },
        ]
      },
      {
        id: 'clients', type: 'radio',
        question: 'Sur quels types de clients travaillez-vous principalement ?',
        options: [
          { value: 'b2b',  label: 'Surtout B2B' },
          { value: 'b2c',  label: 'Surtout B2C' },
          { value: 'mix',  label: 'Un mix B2B / B2C' },
          { value: 'pubs', label: 'Institutions / collectivités' },
        ]
      },
      {
        id: 'reporting', type: 'radio',
        question: 'À quelle fréquence vous faites des reportings clients ?',
        options: [
          { value: 'hebdo',    label: 'Hebdomadaire' },
          { value: 'mensuel',  label: 'Mensuel' },
          { value: 'trim',     label: 'Trimestriel' },
          { value: 'demand',   label: 'À la demande' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous refaites de campagne en campagne ?',
        helper: 'Reportings, paramétrage de campagnes, exports de KPI...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@agence.fr'
      }
    ]
  },

  // ===========================================
  // ORGANISME DE FORMATION
  // ===========================================
  formation: {
    label: 'Organisme de formation',
    chip: 'Pour organismes de formation',
    title: 'Quelques questions pour personnaliser votre app',
    subtitle: 'Vos réponses nous permettent de configurer Productly pour votre activité de formation.',
    landingIcon: '🎓',
    landingTitle: 'Formation',
    landingDesc: 'LMS, suivi apprenants, conventions OPCO, supports pédagogiques, attestations...',
    questions: [
      {
        id: 'tools', type: 'multi',
        question: 'Quels outils utilisez-vous au quotidien ?',
        options: [
          { value: 'moodle',    label: 'Moodle' },
          { value: '360',       label: '360Learning' },
          { value: 'rise',      label: 'Rise / Articulate' },
          { value: 'digiforma', label: 'Digiforma' },
          { value: 'eden',      label: 'Edusign' },
          { value: 'outlook',   label: 'Outlook / Gmail' },
          { value: 'excel',     label: 'Excel / Google Sheets' },
          { value: 'canva',     label: 'Canva / Adobe' },
          { value: 'autre',     label: 'Autre' },
        ]
      },
      {
        id: 'role', type: 'radio',
        question: 'Quel est votre rôle ?',
        options: [
          { value: 'dirigeant',   label: 'Dirigeant(e) / Responsable d\'organisme' },
          { value: 'formateur',   label: 'Formateur(rice)' },
          { value: 'ingped',      label: 'Ingénieur(e) pédagogique' },
          { value: 'admin',       label: 'Responsable administratif / commercial' },
          { value: 'assistant',   label: 'Assistant(e)' },
          { value: 'autre',       label: 'Autre' },
        ]
      },
      {
        id: 'size', type: 'radio',
        question: 'Combien êtes-vous dans l\'organisme ?',
        options: [
          { value: 'solo',  label: 'Tout seul' },
          { value: '1-3',   label: '1 à 3 personnes' },
          { value: '4-10',  label: '4 à 10 personnes' },
          { value: '11-30', label: '11 à 30 personnes' },
          { value: '30+',   label: 'Plus de 30 personnes' },
        ]
      },
      {
        id: 'modalite', type: 'radio',
        question: 'Quelle modalité de formation est dominante chez vous ?',
        options: [
          { value: 'presentiel', label: 'Présentiel' },
          { value: 'distanciel', label: 'Distanciel synchrone' },
          { value: 'mixte',      label: 'Mixte (blended learning)' },
          { value: 'async',      label: 'E-learning asynchrone' },
        ]
      },
      {
        id: 'clients', type: 'radio',
        question: 'Quel type de clientèle accueillez-vous principalement ?',
        options: [
          { value: 'entreprises',  label: 'Entreprises (B2B)' },
          { value: 'particuliers', label: 'Particuliers (B2C)' },
          { value: 'opco',         label: 'Financements OPCO / CPF' },
          { value: 'mix',          label: 'Un mix selon les sessions' },
        ]
      },
      {
        id: 'volume', type: 'radio',
        question: 'Combien de sessions de formation organisez-vous par mois ?',
        options: [
          { value: '1-3',  label: 'Moins de 3' },
          { value: '4-10', label: '4 à 10' },
          { value: '11-30',label: '11 à 30' },
          { value: '30+',  label: 'Plus de 30' },
        ]
      },
      {
        id: 'habits', type: 'radio',
        question: 'Y a-t-il des tâches que vous refaites pour chaque session ?',
        helper: 'Conventions, attestations, relances apprenants, mise en forme de supports...',
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
        question: 'Quel email pour votre compte Productly ?',
        helper: 'On vous envoie le lien d\'installation, et vous pourrez vous connecter à votre dashboard depuis n\'importe où.',
        placeholder: 'vous@organisme.fr'
      }
    ]
  }

};
