// ===========================================
// SPOTTER · Admin — gestion clients & répétitions
// ===========================================
//
// Sécurité : on s'appuie uniquement sur la session Supabase Auth.
// Pour accéder à cette page, il faut être loggué avec le compte
// dont l'email correspond à ADMIN_EMAIL (côté config).
// Si on n'est pas loggué (ou pas en tant qu'admin), on est redirigé sur login.html.
// Les policies RLS "admin_*" filtrent côté DB sur cet email.

let allClients = [];
let selectedClient = null;
let currentRepetitions = [];

async function checkAdminSession() {
  const messageEl = document.getElementById('gateMessage');

  if (!window.spotterDB) {
    messageEl.textContent = 'Erreur Supabase. Recharge la page.';
    return;
  }

  const session = await window.spotterDB.getSession();
  const cfg = window.SPOTTER_CONFIG || {};
  const adminEmail = (cfg.ADMIN_EMAIL || '').toLowerCase();
  const userEmail  = (session && session.user && session.user.email || '').toLowerCase();

  if (!session || !adminEmail || userEmail !== adminEmail) {
    // Pas connecté en admin → redirection login
    messageEl.textContent = 'Accès refusé. Redirection vers la page de connexion...';
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return;
  }

  // Session admin OK
  document.getElementById('adminGate').style.display = 'none';
  document.getElementById('adminApp').style.display  = 'grid';
  await loadClients();
}

// ===========================================
// CLIENTS — sidebar
// ===========================================

async function loadClients() {
  const { data, error } = await window.spotterDB.adminListClients();
  if (error) {
    toast('Impossible de charger les clients : ' + error.message, true);
    return;
  }
  allClients = data;
  renderClientList();
}

function renderClientList() {
  const search = (document.getElementById('clientSearch').value || '').toLowerCase().trim();
  const filtered = search
    ? allClients.filter(c => (c.email || '').toLowerCase().includes(search)
        || (c.cabinet_name || '').toLowerCase().includes(search))
    : allClients;

  const ul = document.getElementById('clientList');
  if (filtered.length === 0) {
    ul.innerHTML = '<li style="color:#777;font-size:12px;padding:10px;">Aucun client.</li>';
    return;
  }

  ul.innerHTML = filtered.map(c => `
    <li class="admin-client-item ${selectedClient && selectedClient.id === c.id ? 'active' : ''}"
        data-id="${c.id}">
      <div class="admin-client-email">${escapeHtml(c.email)}</div>
      <div class="admin-client-meta">
        ${escapeHtml(c.vertical || '—')} · ${formatDate(c.created_at)}
      </div>
    </li>
  `).join('');

  ul.querySelectorAll('.admin-client-item').forEach(li => {
    li.addEventListener('click', () => selectClient(li.dataset.id));
  });
}

async function selectClient(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  selectedClient = client;
  renderClientList();

  // Charge les répétitions
  const { data: reps } = await window.spotterDB.adminListRepetitions(id);
  currentRepetitions = reps || [];
  renderClientPanel();
}

// ===========================================
// PANEL : édition client + répétitions
// ===========================================

function renderClientPanel() {
  const c = selectedClient;
  const reps = currentRepetitions;

  const html = `
    <div class="admin-client-header">
      <div>
        <div class="admin-client-name">${escapeHtml(c.cabinet_name || c.email)}</div>
        <div class="admin-client-sub">
          ${escapeHtml(c.email)} · ${escapeHtml(c.vertical || '—')} ·
          créé le ${formatDate(c.created_at)}
          ${c.user_id ? '· ✓ compte créé' : '· ⏳ pas encore de compte'}
        </div>
      </div>
    </div>

    <!-- Profil cabinet -->
    <div class="admin-section">
      <div class="admin-section-title">Profil cabinet (visible sur le dashboard du client)</div>
      <div class="admin-form-grid">
        <div class="admin-field">
          <label>Nom du cabinet</label>
          <input type="text" id="fieldCabinetName" value="${escapeAttr(c.cabinet_name || '')}" placeholder="Ex: Cabinet Lefèvre & Associés" />
        </div>
        <div class="admin-field">
          <label>Sous-titre / info</label>
          <input type="text" id="fieldCabinetInfo" value="${escapeAttr(c.cabinet_info || '')}" placeholder="Ex: 5 collaborateurs · Caen" />
        </div>
      </div>
      <div class="admin-form-grid cols-1">
        <div class="admin-field">
          <label>Période analysée (badge en haut à droite)</label>
          <input type="text" id="fieldPeriod" value="${escapeAttr(c.period_label || '')}" placeholder="Ex: Période analysée : 7-14 nov." />
        </div>
      </div>
      <div class="admin-btn-row">
        <button class="admin-btn" id="saveProfileBtn">Enregistrer le profil</button>
      </div>
    </div>

    <!-- Réponses du questionnaire (lecture seule) -->
    <div class="admin-section">
      <div class="admin-section-title">Réponses du questionnaire</div>
      <pre style="font-family:ui-monospace,monospace;font-size:12px;color:#4a4a4a;white-space:pre-wrap;background:#fafaf7;padding:12px;border-radius:8px;border:1px solid #ece9e0;margin:0;">${escapeHtml(formatAnswers(c.questionnaire_answers))}</pre>
    </div>

    <!-- Répétitions -->
    <div class="admin-section">
      <div class="admin-section-title">Répétitions détectées (${reps.length})</div>
      <div id="repsList">
        ${reps.length === 0
          ? '<div class="admin-empty-reps">Aucune répétition. Ajoute la première ci-dessous.</div>'
          : reps.map(renderRepRow).join('')}
      </div>
    </div>

    <!-- Ajouter une répétition -->
    <div class="admin-section">
      <div class="admin-section-title">Ajouter une répétition</div>
      <div class="admin-form-grid cols-1">
        <div class="admin-field">
          <label>Libellé *</label>
          <input type="text" id="newLibelle" placeholder="Ex: Renommage manuel pièces OCR" />
        </div>
        <div class="admin-field">
          <label>Description (optionnelle)</label>
          <textarea id="newDescription" placeholder="Détail de l'action répétitive"></textarea>
        </div>
      </div>
      <div class="admin-form-grid cols-3">
        <div class="admin-field">
          <label>Fréquence (nombre)</label>
          <input type="number" id="newFrequence" min="0" value="0" />
        </div>
        <div class="admin-field">
          <label>Unité de fréquence</label>
          <select id="newFrequenceUnit">
            <option value="jour">par jour</option>
            <option value="semaine" selected>par semaine</option>
            <option value="mois">par mois</option>
          </select>
        </div>
        <div class="admin-field">
          <label>Temps perdu (minutes / période)</label>
          <input type="number" id="newTempsPerdu" min="0" value="0" />
        </div>
      </div>
      <div class="admin-form-grid cols-1">
        <div class="admin-field">
          <label>Statut</label>
          <select id="newStatut">
            <option value="detected" selected>Détecté</option>
            <option value="automatable">Automatisable</option>
            <option value="automated">Automatisé</option>
          </select>
        </div>
      </div>
      <div class="admin-btn-row">
        <button class="admin-btn" id="addRepBtn">Ajouter</button>
      </div>
    </div>
  `;

  document.getElementById('adminContent').innerHTML = html;

  // Listeners
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('addRepBtn').addEventListener('click', addRepetition);
  document.querySelectorAll('[data-rep-edit]').forEach(b => {
    b.addEventListener('click', () => editRep(b.dataset.repEdit));
  });
  document.querySelectorAll('[data-rep-delete]').forEach(b => {
    b.addEventListener('click', () => deleteRep(b.dataset.repDelete));
  });
}

function renderRepRow(r) {
  const freqLabel = ({ jour: '/j', semaine: '/sem', mois: '/mois' })[r.frequence_unit] || '';
  const statutLabel = ({
    detected: 'Détecté', automatable: 'Automatisable', automated: 'Automatisé'
  })[r.statut] || r.statut;

  return `
    <div class="admin-rep-row">
      <div>
        <div class="admin-rep-name">${escapeHtml(r.libelle)}</div>
        <div class="admin-rep-meta">
          ${r.frequence}× ${freqLabel} ·
          ${formatMinutes(r.temps_perdu_minutes)} ·
          <strong>${statutLabel}</strong>
          ${r.description ? '<br>' + escapeHtml(r.description) : ''}
        </div>
      </div>
      <div class="admin-rep-actions">
        <button class="admin-btn admin-btn-secondary" data-rep-edit="${r.id}">Éditer</button>
        <button class="admin-btn admin-btn-danger" data-rep-delete="${r.id}">Suppr.</button>
      </div>
    </div>
  `;
}

// ===========================================
// ACTIONS
// ===========================================

async function saveProfile() {
  if (!selectedClient) return;
  const fields = {
    cabinet_name: document.getElementById('fieldCabinetName').value.trim() || null,
    cabinet_info: document.getElementById('fieldCabinetInfo').value.trim() || null,
    period_label: document.getElementById('fieldPeriod').value.trim() || null,
  };
  const { data, error } = await window.spotterDB.adminUpdateClient(selectedClient.id, fields);
  if (error) {
    toast('Erreur : ' + error.message, true);
    return;
  }
  Object.assign(selectedClient, data);
  // Mise à jour cache liste
  const idx = allClients.findIndex(c => c.id === selectedClient.id);
  if (idx >= 0) allClients[idx] = { ...allClients[idx], ...data };
  toast('Profil enregistré');
  renderClientList();
  renderClientPanel();
}

async function addRepetition() {
  if (!selectedClient) return;
  const libelle = document.getElementById('newLibelle').value.trim();
  if (!libelle) { toast('Le libellé est requis', true); return; }

  const rep = {
    client_id:           selectedClient.id,
    libelle:             libelle,
    description:         document.getElementById('newDescription').value.trim() || null,
    frequence:           parseInt(document.getElementById('newFrequence').value, 10) || 0,
    frequence_unit:      document.getElementById('newFrequenceUnit').value,
    temps_perdu_minutes: parseInt(document.getElementById('newTempsPerdu').value, 10) || 0,
    statut:              document.getElementById('newStatut').value,
    ordre:               currentRepetitions.length,
  };

  const { data, error } = await window.spotterDB.adminCreateRepetition(rep);
  if (error) {
    toast('Erreur : ' + error.message, true);
    return;
  }
  currentRepetitions.push(data);
  toast('Répétition ajoutée');
  renderClientPanel();
}

async function editRep(id) {
  const r = currentRepetitions.find(x => x.id === id);
  if (!r) return;

  const newLibelle = prompt('Libellé', r.libelle);
  if (newLibelle === null) return;
  const newFreq = prompt('Fréquence (nombre)', r.frequence);
  if (newFreq === null) return;
  const newUnit = prompt('Unité (jour, semaine, mois)', r.frequence_unit);
  if (newUnit === null) return;
  const newTemps = prompt('Temps perdu (minutes)', r.temps_perdu_minutes);
  if (newTemps === null) return;
  const newStatut = prompt('Statut (detected, automatable, automated)', r.statut);
  if (newStatut === null) return;
  const newDesc = prompt('Description', r.description || '');
  if (newDesc === null) return;

  const fields = {
    libelle:             newLibelle.trim(),
    frequence:           parseInt(newFreq, 10) || 0,
    frequence_unit:      ['jour', 'semaine', 'mois'].includes(newUnit) ? newUnit : 'semaine',
    temps_perdu_minutes: parseInt(newTemps, 10) || 0,
    statut:              ['detected', 'automatable', 'automated'].includes(newStatut) ? newStatut : 'detected',
    description:         newDesc.trim() || null,
  };

  const { data, error } = await window.spotterDB.adminUpdateRepetition(id, fields);
  if (error) { toast('Erreur : ' + error.message, true); return; }
  const idx = currentRepetitions.findIndex(x => x.id === id);
  if (idx >= 0) currentRepetitions[idx] = data;
  toast('Répétition mise à jour');
  renderClientPanel();
}

async function deleteRep(id) {
  if (!confirm('Supprimer cette répétition ?')) return;
  const { error } = await window.spotterDB.adminDeleteRepetition(id);
  if (error) { toast('Erreur : ' + error.message, true); return; }
  currentRepetitions = currentRepetitions.filter(r => r.id !== id);
  toast('Répétition supprimée');
  renderClientPanel();
}

// ===========================================
// HELPERS
// ===========================================

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMinutes(min) {
  if (!min || min <= 0) return '0min';
  if (min < 60) return min + 'min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? h + 'h' : h + 'h' + String(m).padStart(2, '0');
}

function formatAnswers(answers) {
  if (!answers || typeof answers !== 'object') return '(aucune)';
  return Object.entries(answers)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n');
}

let toastTimer = null;
function toast(msg, isError = false) {
  let el = document.querySelector('.admin-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'admin-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.toggle('error', !!isError);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ===========================================
// INIT
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminSession();

  document.getElementById('clientSearch').addEventListener('input', renderClientList);

  document.getElementById('adminSignOutBtn').addEventListener('click', async () => {
    if (window.spotterDB) await window.spotterDB.signOut();
    window.location.href = 'login.html';
  });
});
