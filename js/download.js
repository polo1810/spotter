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

function startInstall(platform) {
  if (installTriggered) return;
  installTriggered = true;

  // Affiche un overlay de chargement court le temps que Formspree reçoive
  showLoadingOverlay(platform);

  const answers = SpotterStorage.getAnswers() || {};
  const now = new Date();
  const email = answers.email || 'unknown';
  const vertical = answers._vertical || 'inconnu';

  // Soumission Formspree avec attente (max 2.5s) avant redirection.
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

  // Pré-charge l'IP en arrière-plan pour qu'elle soit prête au clic
  getClientIP().then(ip => { downloadIP = ip; });

  // Boutons platforms
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => startInstall(btn.dataset.platform));
  });
});
