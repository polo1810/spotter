// ===========================================
// PRODUCTLY · Client Supabase + helpers
// ===========================================
// Charge le SDK Supabase via CDN, expose `window.spotterDB` avec toutes
// les fonctions utiles (auth, queries clients, queries repetitions, admin).
//
// Pré-requis : js/supabase-config.js doit être chargé AVANT ce fichier,
// et le script CDN <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// doit être inclus dans la page.

(function () {
  const cfg = window.SPOTTER_CONFIG || {};

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Spotter] SDK Supabase manquant — ajoute le <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> dans la page.');
    return;
  }

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL === 'CHANGE_ME') {
    console.warn('[Spotter] SUPABASE_URL non configurée — édite js/supabase-config.js');
  }

  const sb = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );

  // ===========================================
  // AUTH
  // ===========================================

  async function signUp(email, password) {
    const { data, error } = await sb.auth.signUp({ email, password });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    return await sb.auth.signOut();
  }

  async function getSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  async function getUser() {
    const { data } = await sb.auth.getUser();
    return data.user;
  }

  // ===========================================
  // CLIENTS
  // ===========================================

  /**
   * Crée (ou met à jour si existe déjà) une ligne client à partir des
   * réponses du questionnaire. Appelé en fin de questionnaire, avant
   * que le user ait un compte (insert anonyme autorisé par RLS).
   */
  async function upsertClientFromQuestionnaire({ email, vertical, answers, ip }) {
    // INSERT simple (pas upsert : .upsert() exige INSERT+UPDATE en RLS, et anon
    // n'a pas UPDATE — pour de bonnes raisons de sécurité).
    // Si l'email existe déjà (code 23505), on ignore : le user reprend probablement
    // un questionnaire entamé. Ses réponses initiales restent, l'admin peut les voir.
    const payload = {
      email,
      vertical,
      questionnaire_answers: answers,
      ip,
    };

    const { error } = await sb.from('clients').insert(payload);

    if (error && error.code === '23505') {
      // Email déjà en base, pas grave
      return { data: { email }, error: null };
    }

    return { data: { email }, error };
  }

  /**
   * Lie le user_id Supabase Auth au client existant (par email).
   * Appelé après le signUp, sur la page download.
   */
  async function linkUserIdToClient(email, userId) {
    const { data, error } = await sb
      .from('clients')
      .update({ user_id: userId })
      .eq('email', email)
      .select()
      .single();
    return { data, error };
  }

  /**
   * Récupère le profil client du user courant (loggué).
   */
  async function getCurrentClient() {
    const user = await getUser();
    if (!user) return { data: null, error: new Error('Non authentifié') };

    const { data, error } = await sb
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return { data, error };
  }

  /**
   * Récupère les répétitions d'un client (par id), triées par ordre.
   */
  async function getRepetitionsForClient(clientId) {
    const { data, error } = await sb
      .from('repetitions')
      .select('*')
      .eq('client_id', clientId)
      .order('ordre', { ascending: true })
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  }

  // ===========================================
  // ADMIN (réservé à admin.html)
  // ===========================================

  async function adminListClients() {
    const { data, error } = await sb
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  }

  async function adminGetClient(clientId) {
    const { data, error } = await sb
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    return { data, error };
  }

  async function adminUpdateClient(clientId, fields) {
    const { data, error } = await sb
      .from('clients')
      .update(fields)
      .eq('id', clientId)
      .select()
      .single();
    return { data, error };
  }

  async function adminListRepetitions(clientId) {
    return await getRepetitionsForClient(clientId);
  }

  async function adminCreateRepetition(rep) {
    const { data, error } = await sb
      .from('repetitions')
      .insert(rep)
      .select()
      .single();
    return { data, error };
  }

  async function adminUpdateRepetition(id, fields) {
    const { data, error } = await sb
      .from('repetitions')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async function adminDeleteRepetition(id) {
    const { error } = await sb.from('repetitions').delete().eq('id', id);
    return { error };
  }

  // ===========================================
  // EXPORT
  // ===========================================

  window.spotterDB = {
    sb,
    // auth
    signUp, signIn, signOut, getSession, getUser,
    // clients
    upsertClientFromQuestionnaire, linkUserIdToClient,
    getCurrentClient, getRepetitionsForClient,
    // admin
    adminListClients, adminGetClient, adminUpdateClient,
    adminListRepetitions, adminCreateRepetition,
    adminUpdateRepetition, adminDeleteRepetition,
  };
})();
