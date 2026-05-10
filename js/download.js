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

function startInstall(platform) {
  if (installTriggered) return;
  installTriggered = true;

  showLoadingOverlay(platform);

  const answers  = SpotterStorage.getAnswers() || {};
  const now      = new Date();
  const email    = answers.email || 'unknown';
  const vertical = answers._vertical || 'inconnu';

  submitToFormspree(
    {
      submission_type: 'platform_clicked',
      _subject: `[Spotter] Téléchargement ${platform} — ${email}`,
      platform: platform,
      vertical: vertical,
      email: email,
      visitor_ip: downloadIP || 'non disponible',
      submitted_at: now.toISOString(),
      submitted_at_local: formatLocalTime(now)
    },
    { wait: true }
  ).then(() => {
    goTo('maintenance.html');
  });
}

function showLoadingOverlay(platform) {
  const installModal = document.getElementById('installModal');
  installModal.classList.add('show');

  document.getElementById('installPlatform').textContent = platform;
  document.getElementById('installIcon').textContent     = '📦';
  document.getElementById('installTitle').textContent    = 'Préparation de votre app...';
  document.getElementById('installStatus').textContent   = 'Connexion au serveur...';
  document.getElementById('installProgress').style.width = '0%';
  document.getElementById('installPercent').textContent  = '';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 4;
    if (progress > 95) progress = 95;
    document.getElementById('installProgress').style.width = progress + '%';
  }, 100);
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
