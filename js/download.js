// ===========================================
// SPOTTER · Logique page de téléchargement
// ===========================================

function startInstall(platform) {
  const installModal = document.getElementById('installModal');
  installModal.classList.add('show');
  
  document.getElementById('installPlatform').textContent = platform;
  document.getElementById('installIcon').textContent = '📦';
  document.getElementById('installTitle').textContent = 'Installation en cours...';
  document.getElementById('installStatus').textContent = 'Téléchargement...';
  document.getElementById('installProgress').style.width = '0%';
  document.getElementById('installPercent').textContent = '0%';
  document.getElementById('installPreviewMsg').classList.remove('show');
  
  const stages = [
    { until: 30, status: 'Téléchargement...' },
    { until: 60, status: 'Décompression...' },
    { until: 85, status: 'Configuration...' },
    { until: 100, status: 'Finalisation...' }
  ];
  
  let progress = 0;
  let previewShown = false;
  
  const interval = setInterval(() => {
    progress += 2;
    if (progress > 100) progress = 100;
    
    document.getElementById('installProgress').style.width = progress + '%';
    document.getElementById('installPercent').textContent = progress + '%';
    
    const stage = stages.find(s => progress <= s.until);
    if (stage) document.getElementById('installStatus').textContent = stage.status;
    
    if (progress >= 25 && !previewShown) {
      previewShown = true;
      document.getElementById('installPreviewMsg').classList.add('show');
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      
      setTimeout(() => {
        document.getElementById('installIcon').textContent = '✅';
        document.getElementById('installTitle').textContent = 'Installé !';
        document.getElementById('installStatus').textContent = 'Ouverture de l\'app...';
      }, 200);
      
      setTimeout(() => {
        goTo('dashboard.html');
      }, 1400);
    }
  }, 50);
}

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier que le questionnaire a été rempli
  const answers = SpotterStorage.getAnswers();
  if (!answers) {
    // Si pas d'answers, rediriger vers le questionnaire
    goTo('questionnaire.html');
    return;
  }
  
  // Bouton platforms
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => startInstall(btn.dataset.platform));
  });
});
