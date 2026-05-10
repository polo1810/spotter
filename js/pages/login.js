// ===========================================
// SPOTTER · Logique page de connexion
// ===========================================

async function attemptLogin() {
  const errorEl  = document.getElementById('loginError');
  const submitBtn = document.getElementById('loginSubmit');
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Renseigne email et mot de passe.';
    return;
  }

  if (!window.spotterDB) {
    errorEl.textContent = 'Erreur de chargement Supabase. Recharge la page.';
    return;
  }

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Connexion...';

  const { data, error } = await window.spotterDB.signIn(email, password);

  if (error || !data || !data.user) {
    errorEl.textContent = 'Email ou mot de passe incorrect.';
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Se connecter →';
    return;
  }

  // Si c'est un compte admin → redirection vers admin.html
  const adminEmail = (window.SPOTTER_CONFIG && window.SPOTTER_CONFIG.ADMIN_EMAIL) || '';
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
    window.location.href = '/pages/admin.html';
    return;
  }

  window.location.href = '/pages/dashboard.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Si déjà loggué, redirection directe
  if (window.spotterDB) {
    const session = await window.spotterDB.getSession();
    if (session) {
      const adminEmail = (window.SPOTTER_CONFIG && window.SPOTTER_CONFIG.ADMIN_EMAIL) || '';
      const userEmail  = (session.user && session.user.email) || '';
      if (adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase()) {
        window.location.href = '/pages/admin.html';
      } else {
        window.location.href = '/pages/dashboard.html';
      }
      return;
    }
  }

  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    attemptLogin();
  });

  document.getElementById('loginSubmit').addEventListener('click', attemptLogin);
});
