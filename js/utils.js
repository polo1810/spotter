// ===========================================
// SPOTTER · Utilitaires partagés entre pages
// ===========================================

/**
 * Stockage des réponses du questionnaire entre pages
 * (sessionStorage = effacé quand l'onglet est fermé)
 */
const SpotterStorage = {
  saveAnswers(answers) {
    sessionStorage.setItem('spotter_answers', JSON.stringify(answers));
  },
  
  getAnswers() {
    const raw = sessionStorage.getItem('spotter_answers');
    return raw ? JSON.parse(raw) : null;
  },
  
  clearAnswers() {
    sessionStorage.removeItem('spotter_answers');
  }
};

/**
 * Validation email simple
 */
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * Navigation entre pages
 */
function goTo(page) {
  window.location.href = page;
}
