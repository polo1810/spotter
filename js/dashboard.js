// ===========================================
// SPOTTER · Logique du dashboard
// ===========================================

let currentCabinet = 1;
let currentView = 'pending';
let activatedAutos = {};
let previewBannerDismissed = false;

let currentAuto = null;
let currentConnectionIdx = 0;

// === VIEW SWITCHING ===
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-item').forEach(v => v.classList.remove('active'));
  document.querySelector(`.view-item[data-view="${view}"]`).classList.add('active');
  renderDashboard(currentCabinet);
}

function dismissPreviewBanner() {
  previewBannerDismissed = true;
  renderDashboard(currentCabinet);
}

// === RENDER ===
function renderDashboard(id) {
  currentCabinet = id;
  const c = CABINETS[id];
  const activated = activatedAutos[id] || [];
  const isPending = currentView === 'pending';
  
  // Preview banner
  let bannerHtml = '';
  if (!previewBannerDismissed) {
    bannerHtml = `
      <div class="preview-banner">
        <div class="preview-banner-icon">👋</div>
        <div class="preview-banner-text">
          <div class="preview-banner-title">Bienvenue dans votre dashboard Spotter</div>
          <div class="preview-banner-sub">L'analyse de votre quotidien démarre maintenant. Cliquez sur "Aperçu Jour 10" dans la barre latérale pour voir à quoi votre dashboard ressemblera dans 10 jours.</div>
        </div>
        <button class="preview-banner-close" onclick="dismissPreviewBanner()">×</button>
      </div>
    `;
  }
  document.getElementById('previewBannerContainer').innerHTML = bannerHtml;
  
  let html = '';
  
  if (isPending) {
    html = renderPendingView(c);
  } else {
    html = renderLoadedView(c, activated);
  }
  
  document.getElementById('dashboard').innerHTML = html;
}

function renderPendingView(c) {
  return `
    <div class="page-header">
      <div class="cabinet-title">
        <h1>${c.name}</h1>
        <div class="info">${c.info}</div>
      </div>
      <div class="period-badge pending">Jour 1 / 10</div>
    </div>
    <div class="waiting-banner">
      <div class="waiting-icon">⏳</div>
      <div class="waiting-text">
        <div class="waiting-title">Analyse en cours</div>
        <div class="waiting-sub">L'outil tourne en fond. Plus que <strong>9 jours</strong> avant vos premières recommandations.</div>
        <div class="waiting-progress"><div class="waiting-progress-fill"></div></div>
      </div>
    </div>
    <div class="stats">
      <div class="stat-card pending">
        <div class="stat-label">Temps perdu / sem</div>
        <div class="stat-value pending"><span class="pulse-dot"></span><span class="skeleton skel-value"></span></div>
        <div class="stat-sub">Détection en cours...</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-label">Actions répétitives détectées</div>
        <div class="stat-value pending"><span class="pulse-dot"></span><span style="font-size: 18px; color: #d97706;">3 détectées · ~1500 à analyser</span></div>
        <div class="stat-sub">Premières détections en cours...</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-label">Gain potentiel / sem</div>
        <div class="stat-value pending"><span class="pulse-dot"></span><span class="skeleton skel-value"></span></div>
        <div class="stat-sub">Calcul après J+5</div>
      </div>
    </div>
    <div class="section-title">📊 Top des actions répétitives détectées <span class="section-pending-badge">EN COURS</span></div>
    <div class="empty-actions">
      <div class="empty-actions-icon">🔍</div>
      <div class="empty-actions-title">Détection en cours...</div>
      <div class="empty-actions-sub">Les premières actions répétitives apparaîtront ici dès J+3.<br>Pour l'instant, l'outil collecte les données.</div>
    </div>
    <div class="section-title">⚡ Automatisations prêtes à activer <span class="section-pending-badge">À VENIR</span></div>
    <div class="empty-autos">
      <div class="empty-autos-icon">⚡</div>
      <div class="empty-autos-title">On prépare vos automatisations</div>
      <div class="empty-autos-sub">Une fois l'analyse terminée (J+10), nos équipes vous proposent ici des automatisations <strong>conçues spécifiquement pour vos pertes de temps</strong>, activables en un clic.</div>
    </div>
  `;
}

function renderLoadedView(c, activated) {
  return `
    <div class="page-header">
      <div class="cabinet-title">
        <h1>${c.name}</h1>
        <div class="info">${c.info}</div>
      </div>
      <div class="period-badge">${c.period}</div>
    </div>
    <div class="stats">
      ${c.stats.map(s => `
        <div class="stat-card">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value ${s.type}">${s.value}</div>
          <div class="stat-sub">${s.sub}</div>
        </div>
      `).join('')}
    </div>
    <div class="section-title">📊 Top des actions répétitives détectées</div>
    <div class="actions-table">
      ${c.actions.map(a => `
        <div class="action-row">
          <div>
            <div class="action-name">${a.name}</div>
            <div class="action-desc">${a.desc}</div>
          </div>
          <div class="action-freq">${a.freq}<div class="action-freq-sub">${a.freqSub}</div></div>
          <div class="action-time">${a.time}</div>
        </div>
      `).join('')}
    </div>
    <div class="section-title">⚡ Automatisations prêtes à activer</div>
    <div class="auto-list">
      ${c.autos.map((a, idx) => {
        const isActivated = activated.includes(idx);
        return `
          <div class="auto-card ${isActivated ? 'activated' : ''}">
            <div class="auto-header">
              <div class="auto-title-block">
                <div class="auto-prefix">⚡ Automatisation conçue pour vous</div>
                <div class="auto-title">${a.title}</div>
                <div class="auto-desc">${a.desc}</div>
              </div>
              <div class="auto-gain-badge">${a.gain}</div>
            </div>
            <div class="auto-tools">
              ${a.tools.map((t, i) => `
                <span class="tool-chip">🔌 ${t}</span>
                ${i < a.tools.length - 1 ? '<span class="tool-arrow">→</span>' : ''}
              `).join('')}
            </div>
            <div class="auto-footer">
              <div class="auto-effort">⚙️ <strong>${a.effort}</strong></div>
              ${isActivated 
                ? '<div class="activated-badge">✓ Activée</div>'
                : `<button class="activate-btn" onclick="openActivateModal(${idx})">Activer en un clic →</button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// === ACTIVATE FLOW ===
function openActivateModal(idx) {
  currentAuto = CABINETS[currentCabinet].autos[idx];
  currentAuto.idx = idx;
  currentConnectionIdx = 0;
  renderActivateStep();
  document.getElementById('activateModal').classList.add('show');
}

function hideActivateModal() {
  document.getElementById('activateModal').classList.remove('show');
}

function renderActivateStep() {
  const auto = currentAuto;
  const totalSteps = auto.connections.length + 1;
  const currentStep = currentConnectionIdx + 1;
  const isFinalStep = currentConnectionIdx >= auto.connections.length;
  
  const progressHtml = Array.from({length: totalSteps}, (_, i) => {
    let cls = '';
    if (i < currentConnectionIdx) cls = 'completed';
    else if (i === currentConnectionIdx) cls = 'current';
    if (isFinalStep && i === totalSteps - 1) cls = 'current';
    return `<div class="progress-step ${cls}"></div>`;
  }).join('');
  
  let bodyHtml = '', footerHtml = '';
  
  if (isFinalStep) {
    bodyHtml = `
      <div class="step-label">Étape ${currentStep} / ${totalSteps} · Activation finale</div>
      <div class="step-title">Tout est prêt !</div>
      <div class="step-desc">Toutes les connexions sont établies. Cliquez sur "Activer l'automatisation" pour la mettre en place.</div>
      <div class="final-summary">
        <div class="summary-title">Récap des connexions</div>
        ${auto.connections.map(conn => `<div class="summary-line"><span class="check">✓</span> ${conn.service} connecté</div>`).join('')}
      </div>
    `;
    footerHtml = `
      <button class="modal-btn modal-btn-secondary" onclick="hideActivateModal()">Annuler</button>
      <button class="modal-btn modal-btn-primary" onclick="finalizeActivation()">Activer l'automatisation</button>
    `;
  } else {
    const conn = auto.connections[currentConnectionIdx];
    const meta = SERVICE_META[conn.service] || { icon: "?", className: "" };
    
    bodyHtml = `
      <div class="step-label">Étape ${currentStep} / ${totalSteps} · Connexion</div>
      <div class="step-title">Connectez ${conn.service}</div>
      <div class="step-desc">${conn.helper}</div>
      <div class="service-card">
        <div class="service-icon ${meta.className}">${meta.icon}</div>
        <div class="service-info">
          <div class="service-name">${conn.service}</div>
          <div class="service-status" id="serviceStatus">Non connecté</div>
        </div>
      </div>
    `;
    
    if (conn.type === 'oauth') {
      bodyHtml += `<button class="oauth-btn" id="oauthBtn" onclick="simulateOAuth()">🔐 Se connecter à ${conn.service}</button>`;
    } else {
      bodyHtml += `
        <div class="field-group">
          <label class="field-label">Clé API ${conn.service}</label>
          <input type="text" class="field-input" id="apiKeyInput" placeholder="Coller votre clé API ici..." oninput="checkApiKey()" />
        </div>
        <button class="api-connect-btn" id="apiBtn" disabled onclick="simulateApiConnect()">Connecter ${conn.service}</button>
      `;
    }
    
    footerHtml = `
      <button class="modal-btn modal-btn-secondary" onclick="hideActivateModal()">Annuler</button>
      <button class="modal-btn modal-btn-primary" id="nextStepBtn" onclick="nextConnection()" disabled>Étape suivante →</button>
    `;
  }
  
  document.getElementById('activateModalContent').innerHTML = `
    <div class="activate-header">
      <div class="activate-prefix">⚡ Activation en un clic</div>
      <div class="activate-title">${auto.title}</div>
      <div class="activate-sub">${auto.gain} de gain estimé</div>
      <div class="activate-progress">${progressHtml}</div>
    </div>
    <div class="activate-body">${bodyHtml}</div>
    <div class="activate-footer">${footerHtml}</div>
  `;
}

function simulateOAuth() {
  const btn = document.getElementById('oauthBtn');
  const service = currentAuto.connections[currentConnectionIdx].service;
  btn.classList.add('connecting');
  btn.innerHTML = '<span class="spinner"></span> Redirection vers ' + service + '...';
  
  setTimeout(() => {
    btn.classList.remove('connecting');
    btn.classList.add('connected');
    btn.innerHTML = '✓ Connecté à ' + service;
    document.getElementById('serviceStatus').textContent = 'Connecté';
    document.getElementById('serviceStatus').classList.add('connected');
    document.getElementById('nextStepBtn').disabled = false;
  }, 1200);
}

function checkApiKey() {
  const input = document.getElementById('apiKeyInput');
  document.getElementById('apiBtn').disabled = input.value.trim().length < 6;
}

function simulateApiConnect() {
  const btn = document.getElementById('apiBtn');
  const service = currentAuto.connections[currentConnectionIdx].service;
  btn.classList.add('connecting');
  btn.innerHTML = '<span class="spinner"></span> Vérification...';
  
  setTimeout(() => {
    btn.classList.remove('connecting');
    btn.classList.add('connected');
    btn.innerHTML = '✓ ' + service + ' connecté';
    document.getElementById('serviceStatus').textContent = 'Connecté';
    document.getElementById('serviceStatus').classList.add('connected');
    document.getElementById('nextStepBtn').disabled = false;
  }, 900);
}

function nextConnection() {
  currentConnectionIdx++;
  renderActivateStep();
}

function finalizeActivation() {
  document.getElementById('activateModalContent').innerHTML = `
    <div class="activate-success">
      <div class="activate-success-icon">✓</div>
      <h3>Automatisation activée !</h3>
      <p>L'auto est en place. Vous allez commencer à voir l'effet dès aujourd'hui.<br><br><strong>${currentAuto.gain}</strong> de temps libéré.</p>
    </div>
    <div class="activate-footer">
      <button class="modal-btn modal-btn-primary" onclick="hideActivateModal()" style="flex:1;">Parfait, fermer</button>
    </div>
  `;
  
  if (!activatedAutos[currentCabinet]) activatedAutos[currentCabinet] = [];
  activatedAutos[currentCabinet].push(currentAuto.idx);
  
  setTimeout(() => renderDashboard(currentCabinet), 300);
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  // Cabinet switching
  document.querySelectorAll('.cabinet-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.cabinet-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderDashboard(item.dataset.cabinet);
    });
  });
  
  // View switching
  document.querySelectorAll('.view-item').forEach(item => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });
  
  // Close modal on overlay click
  document.getElementById('activateModal').addEventListener('click', (e) => {
    if (e.target.id === 'activateModal') hideActivateModal();
  });
  
  // Initial render
  renderDashboard(1);
});
