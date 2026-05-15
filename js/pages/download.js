// ===========================================
// PRODUCTLY · Logique page de téléchargement
// ===========================================

let installTriggered = false;
let downloadIP = null;

function formatLocalTime(date) {
  return date.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// ===========================================
// ÉTAPE 1 — création du compte (mot de passe)
// ===========================================

function showPasswordError(msg) {
  document.getElementById('passwordError').textContent = msg || '';
}

function checkPasswordReady() {
  const pwd     = document.getElementById('passwordInput').value;
  const confirm = document.getElementById('passwordConfirm').value;
  const ok      = pwd.length >= 6 && pwd === confirm;
  document.getElementById('passwordSubmit').disabled = !ok;
  if (pwd.length > 0 && pwd.length < 6) {
    showPasswordError('6 caractères minimum.');
  } else if (confirm.length > 0 && pwd !== confirm) {
    showPasswordError('Les mots de passe ne correspondent pas.');
  } else {
    showPasswordError('');
  }
}

async function submitPassword() {
  const submitBtn = document.getElementById('passwordSubmit');
  const email     = document.getElementById('passwordEmail').value;
  const pwd       = document.getElementById('passwordInput').value;

  if (!email || !pwd || pwd.length < 6) {
    showPasswordError('Remplis bien email + mot de passe (6 caractères minimum).');
    return;
  }

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Création du compte...';

  try {
    if (!window.spotterDB) {
      showPasswordError('Erreur de chargement Supabase. Recharge la page.');
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Créer mon compte et continuer →';
      return;
    }

    // 1) signUp Supabase Auth
    const { data: signUpData, error: signUpError } = await window.spotterDB.signUp(email, pwd);

    if (signUpError) {
      // Si user déjà existant : on tente un signIn (cas où il revient après avoir fermé l'onglet)
      const { data: signInData, error: signInError } = await window.spotterDB.signIn(email, pwd);
      if (signInError) {
        showPasswordError(
          signUpError.message.includes('already')
            ? 'Compte déjà existant. Mauvais mot de passe ? Reconnecte-toi sur login.html.'
            : (signUpError.message || 'Échec de la création du compte.')
        );
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Créer mon compte et continuer →';
        return;
      }
      // signIn réussi
    }

    // 2) On lie le user_id au client (créé en base lors du questionnaire)
    const user = await window.spotterDB.getUser();
    if (user) {
      await window.spotterDB.linkUserIdToClient(email, user.id);
    }

    // 3) Étape suivante : choix plateforme
    document.getElementById('passwordStep').style.display  = 'none';
    document.getElementById('platformStep').style.display  = 'block';

  } catch (e) {
    console.error('[Spotter] Signup error:', e);
    showPasswordError('Erreur inattendue. Réessaie.');
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Créer mon compte et continuer →';
  }
}

// ===========================================
// ÉTAPE 2 — téléchargement plateforme
// ===========================================

const WINDOWS_INSTALLER_URL =
  'https://spybox-public.s3.eu-west-3.amazonaws.com/a-archive/d482c494-e995-419b-8063-8864b126e2f6/desktop_app/update/installer/productly_setup.exe';
const MAC_INSTALLER_URL =
  'https://spybox-public.s3.eu-west-3.amazonaws.com/a-archive/d482c494-e995-419b-8063-8864b126e2f6/desktop_app/update/installer/productly_setup.dmg';

function logPlatformClick(platform) {
  const answers  = SpotterStorage.getAnswers() || {};
  const now      = new Date();
  const email    = answers.email || 'unknown';
  const vertical = answers._vertical || 'inconnu';

  submitToFormspree({
    submission_type:   'platform_clicked',
    _subject:          `[Productly] Téléchargement ${platform} — ${email}`,
    platform:          platform,
    vertical:          vertical,
    email:             email,
    visitor_ip:        downloadIP || 'non disponible',
    submitted_at:      now.toISOString(),
    submitted_at_local: formatLocalTime(now)
  });
}

function startInstall(platform) {
  if (installTriggered) return;
  installTriggered = true;

  logPlatformClick(platform);
  showPlatformDownload(platform);
}

const ICON_DOWNLOAD = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v9M4 7l4 4 4-4M2 14h12"/></svg>';
const ICON_APPLE = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.18 8.43c-.02-2.06 1.69-3.06 1.77-3.1-.96-1.41-2.46-1.6-3-1.62-1.28-.13-2.5.75-3.15.75-.66 0-1.66-.74-2.73-.72-1.4.02-2.7.81-3.42 2.07-1.46 2.53-.37 6.27 1.05 8.32.69 1 1.52 2.13 2.6 2.09 1.04-.04 1.44-.67 2.7-.67s1.62.67 2.73.65c1.13-.02 1.84-1.02 2.53-2.03.8-1.16 1.12-2.29 1.14-2.35-.03-.01-2.19-.84-2.22-3.32zM9.13 2.4c.58-.7.97-1.67.86-2.64-.83.03-1.84.55-2.43 1.25-.54.62-1.01 1.6-.88 2.56.93.07 1.87-.47 2.45-1.17z"/></svg>';

// Config par plateforme : tout ce qui diffère entre Windows et macOS.
const PLATFORMS = {
  Windows: {
    label:      'Windows',
    icon:       ICON_DOWNLOAD,
    url:        WINDOWS_INSTALLER_URL,
    filename:   'productly_setup.exe',
    reassureId: 'windowsReassure',   // bloc d'aide SmartScreen, propre à Windows
  },
  macOS: {
    label:      'macOS',
    icon:       ICON_APPLE,
    url:        MAC_INSTALLER_URL,
    filename:   'productly_setup.dmg',
    reassureId: null,
  },
};

// Déclenche le téléchargement d'un fichier sans quitter la page.
function triggerFileDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Anime la barre de progression, puis affiche le lien de secours.
function animateInstallProgress(fallbackUrl) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      document.getElementById('installStatus').innerHTML =
        '✓ Téléchargement lancé ! Si rien ne se passe, ' +
        '<a href="' + fallbackUrl + '" download>clique ici</a>.';
    }
    document.getElementById('installProgress').style.width = progress + '%';
  }, 80);
}

// Ouvre le modal d'installation et lance le téléchargement pour la plateforme choisie.
function showPlatformDownload(platform) {
  const cfg = PLATFORMS[platform];
  if (!cfg) return;

  document.getElementById('installModal').classList.add('show');
  document.getElementById('installPlatform').textContent = cfg.label;
  document.getElementById('installIcon').innerHTML       = cfg.icon;
  document.getElementById('installTitle').textContent    = 'Téléchargement de Productly…';
  document.getElementById('installStatus').textContent   = 'Le téléchargement démarre.';
  document.getElementById('installProgress').style.width = '0%';
  document.getElementById('installPercent').textContent  = '';

  // Bloc d'aide éventuel propre à la plateforme (SmartScreen Windows…)
  if (cfg.reassureId) {
    const reassureEl = document.getElementById(cfg.reassureId);
    if (reassureEl) reassureEl.style.display = 'block';
  }

  // CTA dashboard toujours mis en avant
  const ctaEl = document.getElementById('installDashboardCta');
  if (ctaEl) ctaEl.style.display = 'flex';

  animateInstallProgress(cfg.url);
  triggerFileDownload(cfg.url, cfg.filename);

  // L'user vient de créer son compte → il est authentifié : on ouvre son dashboard
  window.open('/pages/dashboard.html', '_blank', 'noopener');
}

function closeInstallModal() {
  document.getElementById('installModal').classList.remove('show');
  installTriggered = false;
  // Masque les blocs spécifiques au cas où l'utilisateur recliquerait sur une autre plateforme
  const reassureEl = document.getElementById('windowsReassure');
  if (reassureEl) reassureEl.style.display = 'none';
  const ctaEl = document.getElementById('installDashboardCta');
  if (ctaEl) ctaEl.style.display = 'none';
}

// ===========================================
// INIT
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  const answers = SpotterStorage.getAnswers();
  if (!answers) {
    goTo('/pages/questionnaire.html');
    return;
  }

  // Pré-charge l'IP en arrière-plan
  getClientIP().then(ip => { downloadIP = ip; });

  // Pré-remplit l'email dans le formulaire mot de passe
  document.getElementById('passwordEmail').value = answers.email || '';

  // Saut de l'étape mot de passe UNIQUEMENT si la session active correspond
  // exactement à l'email du questionnaire courant. Sinon (vieille session
  // d'un autre user qui traîne), on la nettoie et on reste sur l'étape password.
  if (window.spotterDB) {
    const session = await window.spotterDB.getSession();
    const sessionEmail  = (session && session.user && session.user.email || '').toLowerCase();
    const expectedEmail = (answers.email || '').toLowerCase();

    if (session && sessionEmail && sessionEmail === expectedEmail) {
      // Même user, déjà loggué → on saute direct au choix plateforme
      document.getElementById('passwordStep').style.display = 'none';
      document.getElementById('platformStep').style.display = 'block';
    } else if (session) {
      // Session active pour un AUTRE user → on la vire pour pas confondre
      await window.spotterDB.signOut();
    }
  }

  // Listeners formulaire mot de passe
  document.getElementById('passwordInput').addEventListener('input', checkPasswordReady);
  document.getElementById('passwordConfirm').addEventListener('input', checkPasswordReady);
  document.getElementById('passwordSubmit').addEventListener('click', submitPassword);

  // Listeners boutons plateforme
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => startInstall(btn.dataset.platform));
  });

  // Fermeture de la popup : croix, clic sur l'overlay, touche Escape
  const installModalEl = document.getElementById('installModal');
  const installCloseEl = document.getElementById('installModalClose');
  if (installCloseEl) installCloseEl.addEventListener('click', closeInstallModal);
  if (installModalEl) {
    installModalEl.addEventListener('click', (e) => {
      if (e.target === installModalEl) closeInstallModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && installModalEl && installModalEl.classList.contains('show')) {
      closeInstallModal();
    }
  });
});
