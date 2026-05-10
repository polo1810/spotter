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
    └─ Étape 2 : choix plateforme → maintenance.html
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
├── index.html              # Landing
├── questionnaire.html      # Questionnaire (INSERT client en base)
├── download.html           # Création mot de passe + choix plateforme
├── login.html              # Connexion client existant
├── dashboard.html          # Dashboard client (vraies données)
├── admin.html              # Espace admin (CRUD répétitions)
├── maintenance.html        # Page de maintenance (post-download)
├── supabase-schema.sql     # Schéma SQL à exécuter dans Supabase
├── css/
│   ├── global.css          # Styles partagés
│   ├── landing.css         # Styles landing
│   ├── questionnaire.css   # Styles questionnaire
│   ├── download.css        # Styles download (+ étape password)
│   ├── login.css           # Styles login
│   ├── dashboard.css       # Styles dashboard
│   ├── admin.css           # Styles admin
│   └── maintenance.css     # Styles maintenance
├── js/
│   ├── supabase-config.js  # ⚠️ À configurer (URL + anon key + admin)
│   ├── supabase-client.js  # Wrapper Supabase + helpers (auth, queries)
│   ├── utils.js            # Storage, IP, validation email...
│   ├── verticals.js        # Définition des questionnaires par métier
│   ├── landing.js          # Génération des cartes métier
│   ├── questionnaire.js    # Logique questionnaire (INSERT client)
│   ├── download.js         # Logique download (signUp + choix plateforme)
│   ├── login.js            # Logique login
│   ├── dashboard.js        # Logique dashboard (fetch reps + render)
│   └── admin.js            # Logique admin (gate + CRUD)
└── README.md
```

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
