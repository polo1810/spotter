// ===========================================
// SPOTTER · Données des cabinets (mock)
// ===========================================

const SERVICE_META = {
  "Pennylane": { icon: "P", className: "pennylane" },
  "Cegid":     { icon: "C", className: "cegid" },
  "Outlook":   { icon: "O", className: "outlook" },
  "Excel":     { icon: "X", className: "excel" },
  "HubSpot":   { icon: "H", className: "hubspot" },
  "Notion":    { icon: "N", className: "notion" },
  "Power BI":  { icon: "P", className: "powerbi" }
};

const CABINETS = {
  1: {
    name: "Cabinet Lefèvre & Associés",
    info: "5 collaborateurs · Pennylane · Caen",
    period: "Période analysée : 7-14 nov.",
    stats: [
      { label: "Temps perdu / sem", value: "8h30", type: "danger", sub: "soit ~17% du temps actif" },
      { label: "Actions répétitives détectées", value: "12", type: "info", sub: "sur 7 jours d'analyse" },
      { label: "Gain potentiel / sem", value: "6h15", type: "success", sub: "si toutes les autos activées" }
    ],
    actions: [
      { name: "Renommage manuel pièces OCR", desc: "Correction du nom fournisseur ou date après OCR Pennylane", freq: "87×", freqSub: "cette semaine", time: "2h45" },
      { name: "Réponses récurrentes par mail", desc: "Mêmes formulations envoyées plusieurs fois aux clients", freq: "52×", freqSub: "cette semaine", time: "2h15" },
      { name: "Export Pennylane → Excel reportings", desc: "Retraitement manuel pour reportings clients mensuels", freq: "12×", freqSub: "cette semaine", time: "1h50" },
      { name: "Saisie multi-endroits info client", desc: "Mise à jour adresse/RIB sur Pennylane + Excel suivi", freq: "8×", freqSub: "cette semaine", time: "55min" },
      { name: "Vérification cohérence TVA", desc: "Contrôle manuel entre Pennylane et déclaration", freq: "6×", freqSub: "ce mois", time: "45min" }
    ],
    autos: [
      {
        title: "Auto-correction OCR fournisseurs récurrents",
        desc: "On a identifié 12 fournisseurs qui posent problème à l'OCR Pennylane chez vous. On a pré-paramétré une règle de mapping qui les détecte et corrige automatiquement le nom + la date.",
        gain: "+2h15/sem",
        tools: ["Pennylane"],
        effort: "0 ligne de code · 2 minutes",
        connections: [
          { service: "Pennylane", type: "api_key", helper: "Disponible dans Pennylane → Paramètres → Intégrations → Clés API" }
        ]
      },
      {
        title: "Templates de réponse mail intelligents",
        desc: "5 réponses-types reviennent dans 80% de vos mails clients. On a préparé les templates et la logique qui les insère via raccourci dans Outlook.",
        gain: "+1h50/sem",
        tools: ["Outlook"],
        effort: "0 ligne de code · 1 minute",
        connections: [
          { service: "Outlook", type: "oauth", helper: "On a besoin d'autoriser Spotter à insérer les templates dans votre Outlook" }
        ]
      },
      {
        title: "Auto-génération reportings clients mensuels",
        desc: "Le retraitement Excel suit toujours la même structure. On a construit le template + le pont automatique avec l'export Pennylane.",
        gain: "+1h20/sem",
        tools: ["Pennylane", "Excel"],
        effort: "0 ligne de code · 3 minutes",
        connections: [
          { service: "Pennylane", type: "api_key", helper: "Pennylane → Paramètres → Intégrations" },
          { service: "Excel", type: "oauth", helper: "Accès à votre OneDrive" }
        ]
      }
    ]
  },
  2: {
    name: "Comptaboost",
    info: "12 collaborateurs · Cegid · Lyon",
    period: "Période analysée : 7-14 nov.",
    stats: [
      { label: "Temps perdu / sem (équipe)", value: "14h20", type: "danger", sub: "réparti sur 12 collabs" },
      { label: "Actions répétitives détectées", value: "23", type: "info", sub: "sur 7 jours d'analyse" },
      { label: "Gain potentiel / sem", value: "10h45", type: "success", sub: "si toutes les autos activées" }
    ],
    actions: [
      { name: "Saisie multi-endroits (Cegid + Excel + CRM)", desc: "Même info client saisie dans 3 outils différents", freq: "28×", freqSub: "cette semaine", time: "3h20" },
      { name: "Vérification cohérence TVA inter-outils", desc: "Contrôle manuel Cegid ↔ déclaration EDI", freq: "6×", freqSub: "ce mois", time: "4h40" },
      { name: "Relances pièces clients par mail", desc: "Demandes répétées de justificatifs manquants", freq: "45×", freqSub: "cette semaine", time: "2h00" },
      { name: "Préparation manuelle bilans clients", desc: "Retraitement Cegid pour rendez-vous clients", freq: "9×", freqSub: "cette semaine", time: "2h30" },
      { name: "Suivi internes par mail/Excel", desc: "Communication d'avancement entre collaborateurs", freq: "65×", freqSub: "cette semaine", time: "1h50" }
    ],
    autos: [
      {
        title: "Synchro auto Cegid ↔ HubSpot",
        desc: "Workflow qui détecte toute création/modif client dans Cegid et propage instantanément dans HubSpot.",
        gain: "+3h00/sem",
        tools: ["Cegid", "HubSpot"],
        effort: "0 ligne de code · 4 minutes",
        connections: [
          { service: "Cegid", type: "api_key", helper: "Espace admin Cegid → API & Intégrations" },
          { service: "HubSpot", type: "oauth", helper: "Autoriser Spotter à créer/modifier vos contacts HubSpot" }
        ]
      },
      {
        title: "Relances auto justificatifs J+7 / J+14 / J+21",
        desc: "3 templates de relance progressive + détection automatique des justificatifs manquants.",
        gain: "+1h30/sem",
        tools: ["Cegid", "Outlook"],
        effort: "0 ligne de code · 3 minutes",
        connections: [
          { service: "Cegid", type: "api_key", helper: "Espace admin Cegid → API & Intégrations" },
          { service: "Outlook", type: "oauth", helper: "Autoriser Spotter à envoyer les relances" }
        ]
      },
      {
        title: "Tableau de bord équipe live (Notion)",
        desc: "Workspace Notion pré-configuré avec vues par collaborateur, par dossier, par échéance.",
        gain: "+1h15/sem",
        tools: ["Notion", "Cegid"],
        effort: "0 ligne de code · 2 minutes",
        connections: [
          { service: "Notion", type: "oauth", helper: "Autoriser Spotter à créer le workspace" },
          { service: "Cegid", type: "api_key", helper: "Espace admin Cegid → API & Intégrations" }
        ]
      }
    ]
  },
  3: {
    name: "Cabinet Rousseau",
    info: "3 collaborateurs · Pennylane · Bordeaux",
    period: "Période analysée : 7-14 nov.",
    stats: [
      { label: "Temps perdu / sem", value: "5h45", type: "danger", sub: "soit ~14% du temps actif" },
      { label: "Actions répétitives détectées", value: "9", type: "info", sub: "sur 7 jours d'analyse" },
      { label: "Gain potentiel / sem", value: "4h00", type: "success", sub: "si toutes les autos activées" }
    ],
    actions: [
      { name: "Préparation manuelle tableaux de bord", desc: "Création reportings clients mensuels personnalisés", freq: "8×", freqSub: "cette semaine", time: "2h30" },
      { name: "Renommage pièces OCR", desc: "Correction OCR fournisseurs récurrents", freq: "62×", freqSub: "cette semaine", time: "1h45" },
      { name: "Réponses mails clients standards", desc: "Mêmes questions, mêmes réponses", freq: "38×", freqSub: "cette semaine", time: "1h30" }
    ],
    autos: [
      {
        title: "Reportings clients automatisés (Power BI)",
        desc: "Dashboard Power BI complet branché sur l'API Pennylane. Reportings mensuels générés et envoyés automatiquement.",
        gain: "+2h00/sem",
        tools: ["Pennylane", "Power BI"],
        effort: "0 ligne de code · 3 minutes",
        connections: [
          { service: "Pennylane", type: "api_key", helper: "Pennylane → Paramètres → Intégrations" },
          { service: "Power BI", type: "oauth", helper: "Autoriser Spotter à publier les rapports" }
        ]
      },
      {
        title: "Mapping OCR personnalisé Pennylane",
        desc: "Vos 8 fournisseurs principaux pré-mappés. À chaque facture, le bon nom et la bonne date.",
        gain: "+1h15/sem",
        tools: ["Pennylane"],
        effort: "0 ligne de code · 2 minutes",
        connections: [
          { service: "Pennylane", type: "api_key", helper: "Pennylane → Paramètres → Intégrations" }
        ]
      },
      {
        title: "Bibliothèque réponses clients (Outlook)",
        desc: "5 templates de réponses aux questions fréquentes installés comme raccourcis dans Outlook.",
        gain: "+45min/sem",
        tools: ["Outlook"],
        effort: "0 ligne de code · 1 minute",
        connections: [
          { service: "Outlook", type: "oauth", helper: "Autoriser Spotter à installer les templates dans votre Outlook" }
        ]
      }
    ]
  }
};
