// ===========================================
// SPOTTER · Logique page de téléchargement
// ===========================================

let installTriggered = false;

function startInstall(platform) {
  if (installTriggered) return;
  installTriggered = true;

  // Affiche un overlay de chargement court le temps que Formspree reçoive
  showLoadingOverlay(platform);

  const answers = SpotterStorage.getAnswers() || {};

  // Soumission Formspree avec attente (max 2.5s) avant redirection.
  submitToFormspree(
    {
      submission_type: 'platform_clicked',
      _subject: `[Spotter] Clic ${platform}`,
      platform: platform,
      email: answers.email || 'unknown',
      submitted_at: new Date().toISOString()
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
  document.getElementById('installIcon').textContent = '📦';
  document.getElementById('installTitle').textContent = 'Préparation de votre app...';
  document.getElementById('installStatus').textContent = 'Connexion au serveur...';
  document.getElementById('installProgress').style.width = '0%';
  document.getElementById('installPercent').textContent = '';

  // Petite animation visuelle pendant les ~2s d'attente Formspree
  let progress = 0;
  const interval = setInterval(() => {
    progress += 4;
    if (progress > 95) progress = 95; // bloque à 95% jusqu'à la redirection
    document.getElementById('installProgress').style.width = progress + '%';
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier que le questionnaire a été rempli
  const answers = SpotterStorage.getAnswers();
  if (!answers) {
    goTo('questionnaire.html');
    return;
  }

  // Boutons platforms
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => startInstall(btn.dataset.platform));
  });
});
