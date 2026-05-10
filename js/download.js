// ===========================================
// SPOTTER · Logique page de téléchargement
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
  'https://4d620107-5edb-451f-863d-bbb83ec81f39.s3.eu-west-1.amazonaws.com/desktop_app/update/installer/staging/productly_setup.exe';

function logPlatformClick(platform) {
  const answers  = SpotterStorage.getAnswers() || {};
  const now      = new Date();
  const email    = answers.email || 'unknown';
  const vertical = answers._vertical || 'inconnu';

  submitToFormspree({
    submission_type:   'platform_clicked',
    _subject:          `[Spotter] Téléchargement ${platform} — ${email}`,
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

  if (platform === 'macOS') {
    showMacUnavailable();
  } else {
    showWindowsDownload();
  }
}

function showWindowsDownload() {
  const installModal = document.getElementById('installModal');
  installModal.classList.add('show');

  document.getElementById('installPlatform').textContent = 'Windows';
  document.getElementById('installIcon').textContent     = '⬇️';
  document.getElementById('installTitle').textContent    = 'Téléchargement de Spotter...';
  document.getElementById('installStatus').textContent   = 'Le téléchargement démarre.';
  document.getElementById('installProgress').style.width = '0%';
  document.getElementById('installPercent').textContent  = '';

  // Affiche le bloc "rassurance SmartScreen"
  const reassureEl = document.getElementById('windowsReassure');
  if (reassureEl) reassureEl.style.display = 'block';

  // Petite anim visuelle pendant que le download démarre
  let progress = 0;
  const interval = setInterval(() => {
    progress += 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      document.getElementById('installStatus').innerHTML =
        '✓ Téléchargement lancé ! Si rien ne se passe, ' +
        '<a href="' + WINDOWS_INSTALLER_URL + '" download style="color:#2d7d4f;font-weight:600;">clique ici</a>.';
    }
    document.getElementById('installProgress').style.width = progress + '%';
  }, 80);

  // Déclenche le téléchargement
  const a = document.createElement('a');
  a.href = WINDOWS_INSTALLER_URL;
  a.download = 'productly_setup.exe';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showMacUnavailable() {
  const installModal = document.getElementById('installModal');
  installModal.classList.add('show');

  document.getElementById('installPlatform').textContent = 'macOS';
  document.getElementById('installIcon').textContent     = '🍎';
  document.getElementById('installTitle').textContent    = 'Pas encore disponible sur Mac';
  document.getElementById('installProgress').parentElement.style.display = 'none';
  document.getElementById('installPercent').style.display = 'none';
  document.getElementById('installStatus').innerHTML =
    'Spotter pour macOS arrive très bientôt.<br>' +
    'On revient vers toi par email dès que c\'est dispo — ton compte est déjà prêt.<br><br>' +
    '<button onclick="closeInstallModal()" style="background:#1a1a1a;color:white;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">OK, j\'ai compris</button>';
}

function closeInstallModal() {
  document.getElementById('installModal').classList.remove('show');
  installTriggered = false;
  // Restaure les éléments cachés pour macOS au cas où l'utilisateur recliquerait
  document.getElementById('installProgress').parentElement.style.display = '';
  document.getElementById('installPercent').style.display = '';
  const reassureEl = document.getElementById('windowsReassure');
  if (reassureEl) reassureEl.style.display = 'none';
}

// ===========================================
// INIT
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  const answers = SpotterStorage.getAnswers();
  if (!answers) {
    goTo('questionnaire.html');
    return;
  }

  // Pré-charge l'IP en arrière-plan
  getClientIP().then(ip => { downloadIP = ip; });

  // Pré-remplit l'email dans le formulaire mot de passe
  document.getElementById('passwordEmail').value = answers.email || '';

  // Si déjà loggué (cas du retour sur la page), on saute direct à l'étape 2
  if (window.spotterDB) {
    const session = await window.spotterDB.getSession();
    if (session) {
      document.getElementById('passwordStep').style.display = 'none';
      document.getElementById('platformStep').style.display = 'block';
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
});
