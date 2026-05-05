# Spotter · Site de démonstration

Site web statique présentant le parcours utilisateur Spotter — un outil de détection des pertes de temps pour cabinets comptables.

## Parcours utilisateur

```
index.html (landing)
    ↓
questionnaire.html (10 questions QCM)
    ↓ (auto)
[modal "On paramètre votre app..."]
    ↓ (auto)
download.html (page téléchargement macOS / Windows)
    ↓ (clic plateforme)
[modal "Installation en cours..." avec aperçu]
    ↓ (auto)
dashboard.html (Jour J en attente par défaut, switchable vers aperçu Jour 10)
```

## Structure

```
spotter/
├── index.html              # Landing page
├── questionnaire.html      # Questionnaire 10 questions
├── download.html           # Page téléchargement + animation install
├── dashboard.html          # Dashboard (Jour J + aperçu Jour 10)
├── css/
│   ├── global.css          # Styles partagés (boutons, animations, modals)
│   ├── landing.css         # Styles landing
│   ├── questionnaire.css   # Styles questionnaire + modal configure
│   ├── download.css        # Styles download + modal install
│   └── dashboard.css       # Styles dashboard + modal activate
├── js/
│   ├── utils.js            # Storage + utilitaires partagés
│   ├── data.js             # Données mockées des cabinets (utilisé par dashboard)
│   ├── questionnaire.js    # Logique questionnaire
│   ├── download.js         # Logique téléchargement + install
│   └── dashboard.js        # Logique dashboard + flow activation
├── assets/                 # (vide pour l'instant — pour futurs logos/images)
└── README.md
```

## Lancer en local

C'est du HTML/CSS/JS pur, aucune build step. Plusieurs options :

**Option 1 : Ouvrir directement le fichier**
```
Double-clic sur index.html
```
⚠️ Certains navigateurs limitent `sessionStorage` en mode `file://`. Préférer l'option 2.

**Option 2 : Serveur local Python (recommandé)**
```bash
cd spotter
python3 -m http.server 8000
```
Puis ouvrir http://localhost:8000

**Option 3 : VS Code + Live Server**
Clic droit sur `index.html` → "Open with Live Server".

## Déploiement

### Netlify (le plus simple)
1. Drag & drop le dossier `spotter` sur https://app.netlify.com/drop
2. C'est en ligne en 30 secondes

### Vercel
```bash
cd spotter
npx vercel
```

### GitHub Pages
1. Push le dossier sur un repo GitHub
2. Settings → Pages → Source : `main` branch / root
3. Le site est dispo sur `https://<user>.github.io/<repo>/`

## Données

Les données affichées dans le dashboard (cabinets, actions répétitives, automatisations) sont **mockées** dans `js/data.js`. Pour ajouter/modifier un cabinet, éditer ce fichier directement.

Les réponses au questionnaire sont stockées en `sessionStorage` (effacées à la fermeture de l'onglet).

## Notes

- Aucune dépendance externe (pas de framework, pas de bundler)
- Compatible tous navigateurs modernes
- Responsive (testé jusqu'à 380px de large)
