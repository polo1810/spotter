# Spotter · Site + Dashboard

Site web statique avec un dashboard fonctionnel branché sur Supabase.

## Parcours utilisateur

```
index.html (landing — choix métier)
    ↓
questionnaire.html?v=<vertical>   → INSERT clients (Supabase)
    ↓ (auto)
[modal "On paramètre votre app..."]
    ↓ (auto)
download.html
    ├─ Étape 1 : crée ton mot de passe → Supabase Auth signUp + lien user_id ↔ client
    └─ Étape 2 : choix plateforme
       ├─ Windows : téléchargement direct du .exe
       └─ macOS : message "pas encore disponible"
    ↓
login.html (retour client : email + mot de passe)
    ↓
dashboard.html (vraies données Supabase, ses répétitions à lui)
```

Espace admin séparé :

```
login.html (en tant que ADMIN_EMAIL)
    → admin.html (vérif session, redirige login si pas admin)
        → liste tous les clients
        → édition profil cabinet (nom, info, période)
        → CRUD des répétitions par client
```

## Setup Supabase (à faire une seule fois)

### 1. Créer le projet
Si pas encore fait : créer un projet sur https://supabase.com (gratuit).

### 2. Créer le compte admin
Dans Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user** :
- Email : ton email admin (ex : `admin@spotter.app`)
- Password : choisi librement (sera mis aussi dans le code)
- Auto-confirm user : ✅ coché

### 3. Exécuter le schéma SQL
Dans Supabase Dashboard → **SQL Editor** → **New query** → coller tout le contenu de
[`supabase-schema.sql`](./supabase-schema.sql) → **Run**.

⚠️ **Important** : dans `supabase-schema.sql`, modifie la fonction `public.admin_email()`
pour qu'elle retourne le **même email** que celui du compte admin Supabase, puis ré-exécute.

### 4. (Optionnel) Désactiver la confirmation par email
Dans Supabase Dashboard → **Authentication** → **Sign In / Up** → désactiver
"Enable email confirmations" si tu veux que les comptes soient utilisables tout de suite.

### 5. Renseigner les credentials côté front
Édite [`js/supabase-config.js`](./js/supabase-config.js) :

```js
window.SPOTTER_CONFIG = {
  SUPABASE_URL:      'https://xxxxxxxxx.supabase.co',     // Project Settings → API → Project URL
  SUPABASE_ANON_KEY: 'eyJh...',                            // Project Settings → API → anon public
  ADMIN_EMAIL:       'admin@spotter.app',                  // même email qu'à l'étape 2
};
```

Le mot de passe admin n'est PAS dans le code : tu te connectes via `login.html`
avec ton email admin + ton mot de passe Supabase Auth, et tu es automatiquement
redirigé vers `admin.html`.

## Lancer en local

```bash
cd spotter
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

⚠️ Ouvrir directement les fichiers en `file://` ne marche pas pour Supabase Auth (CORS).
Utilise toujours un serveur local.

## Structure

```
spotter/
├── index.html              # SEULE page à la racine : la landing
│
├── pages/                  # Toutes les autres pages
│   ├── questionnaire.html
│   ├── download.html
│   ├── login.html
│   ├── dashboard.html
│   └── admin.html
│
├── css/                    # 1 fichier par page + global.css
│   ├── global.css
│   ├── landing.css
│   ├── questionnaire.css
│   ├── download.css
│   ├── login.css
│   ├── dashboard.css
│   └── admin.css
│
├── js/
│   ├── lib/                # Code partagé entre plusieurs pages
│   │   ├── supabase-config.js   # ⚠️ Credentials Supabase (à configurer)
│   │   ├── supabase-client.js   # Wrapper Supabase (auth, queries)
│   │   ├── utils.js             # Storage, IP, validation email
│   │   └── verticals.js         # Définition des verticaux + questionnaires
│   │
│   └── pages/              # 1 fichier = 1 page (logique spécifique)
│       ├── landing.js
│       ├── questionnaire.js
│       ├── download.js
│       ├── login.js
│       ├── dashboard.js
│       └── admin.js
│
├── supabase-schema.sql     # SQL à exécuter dans Supabase (1 fois)
├── _redirects              # Aliases Netlify (/login, /admin, /comptable...)
└── README.md
```

**URLs propres en production (via `_redirects` Netlify)** :
- `/login` → `/pages/login.html`
- `/dashboard` → `/pages/dashboard.html`
- `/admin` → `/pages/admin.html`
- `/comptable` → `/pages/questionnaire.html?v=comptable`
- `/recrutement` → `/pages/questionnaire.html?v=recrutement`

**Convention** : tous les chemins (CSS, JS, navigation entre pages) sont **absolus**
(commencent par `/`). Du coup, peu importe d'où on charge le fichier, les chemins restent valides.

Chaque page HTML charge ses dépendances dans cet ordre :
1. Le SDK Supabase via CDN (si la page en a besoin)
2. Les libs partagées (`/js/lib/...`)
3. Le script de la page (`/js/pages/...`)

## Schéma de base de données

### Table `clients`
| Colonne                 | Type        | Description                                     |
|-------------------------|-------------|-------------------------------------------------|
| `id`                    | uuid PK     | ID interne                                      |
| `user_id`               | uuid FK     | Lien vers `auth.users` (rempli après signUp)    |
| `email`                 | text unique | Email du client                                 |
| `vertical`              | text        | `comptable`, `recrutement`, etc.                |
| `questionnaire_answers` | jsonb       | Toutes les réponses du questionnaire            |
| `cabinet_name`          | text        | Nom du cabinet (rempli par l'admin)             |
| `cabinet_info`          | text        | Sous-titre (ex: "5 collabs · Caen")             |
| `period_label`          | text        | Badge période (ex: "7-14 nov.")                 |
| `ip`                    | text        | IP au moment du questionnaire                   |
| `created_at`            | timestamptz | Date de création                                |
| `updated_at`            | timestamptz | Date de dernière modif                          |

### Table `repetitions`
| Colonne                | Type        | Description                                  |
|------------------------|-------------|----------------------------------------------|
| `id`                   | uuid PK     | ID interne                                   |
| `client_id`            | uuid FK     | Lien vers `clients.id`                       |
| `libelle`              | text        | Nom de l'action répétitive                   |
| `description`          | text        | Détail (optionnel)                           |
| `frequence`            | integer     | Nombre d'occurrences                         |
| `frequence_unit`       | text        | `jour` / `semaine` / `mois`                  |
| `temps_perdu_minutes`  | integer     | Temps total perdu sur la période, en minutes |
| `statut`               | text        | `detected` / `automatable` / `automated`     |
| `ordre`                | integer     | Ordre d'affichage                            |
| `created_at`           | timestamptz | Date de création                             |
| `updated_at`           | timestamptz | Date de dernière modif                       |

### Politiques RLS
- **clients** :
  - Anon : INSERT autorisé (questionnaire)
  - User : SELECT/UPDATE de son propre profil (par `user_id` ou `email` si pas encore lié)
  - Admin : tout
- **repetitions** :
  - User : SELECT de ses propres répétitions (via `client_id`)
  - Admin : tout

L'admin est identifié par son email JWT (cf. fonction `admin_email()` dans le schéma).

## Notes

- Aucune dépendance build : c'est du HTML/CSS/JS pur, juste le SDK Supabase via CDN
- `data.js` (mock) **n'est plus utilisé** par le dashboard, mais reste pour référence
- Formspree continue à recevoir les notifications questionnaire/download (traçabilité)
- L'accès admin est protégé par l'authentification Supabase (le mot de passe n'est pas dans le code) ; les policies RLS filtrent les données sur l'email JWT
