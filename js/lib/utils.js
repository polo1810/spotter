// ===========================================
// PRODUCTLY · Utilitaires partagés entre pages
// ===========================================
 
/**
 * Endpoint Formspree pour collecter les soumissions.
 * Toutes les pages utilisent le même endpoint, on distingue
 * les types d'événements via le champ `submission_type`.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdabgren';
 
/**
 * Envoie un payload à Formspree.
 *
 * @param {Object} payload - Les données à envoyer (incluant submission_type)
 * @param {Object} [options] - Options : { wait: boolean } pour attendre la réponse
 * @returns {Promise} - Résolue quand l'envoi est terminé (ou échoue silencieusement)
 */
function submitToFormspree(payload, options = {}) {
  const { wait = false } = options;
 
  const fetchPromise = fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(err => {
    // On ne bloque jamais le user en cas d'erreur réseau
    console.warn('Formspree submission failed:', err);
  });
 
  if (wait) {
    // Timeout de sécurité 2.5s : on ne bloque pas plus longtemps
    return Promise.race([
      fetchPromise,
      new Promise(resolve => setTimeout(resolve, 2500))
    ]);
  }
 
  return fetchPromise;
}
 
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
 * Récupère l'IP publique du visiteur via l'API ipify.
 * Résout avec null en cas d'échec (timeout 3s).
 * @returns {Promise<string|null>}
 */
async function getClientIP() {
  try {
    const res = await Promise.race([
      fetch('https://api.ipify.org?format=json'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]);
    const data = await res.json();
    return data.ip || null;
  } catch {
    return null;
  }
}
 
/**
 * Navigation entre pages
 */
function goTo(page) {
  window.location.href = page;
}
