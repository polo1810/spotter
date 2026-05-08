// ===========================================
// SPOTTER · Logique du questionnaire (multi-vertical)
// ===========================================

// --- Détection de la verticale depuis l'URL (?v=recrutement) ---
const params = new URLSearchParams(window.location.search);
const verticalKey = params.get('v');

// Si aucune verticale valide n'est fournie, on renvoie vers le sélecteur métier
if (!verticalKey || !VERTICALS[verticalKey]) {
  window.location.href = 'index.html#metiers';
  throw new Error('Vertical manquante — redirection vers la landing');
}

const currentVertical = VERTICALS[verticalKey];
const TOTAL_STEPS = currentVertical.questions.length;

let qStep = 1;
let configureStarted = false;
let clientIP = null;

// ===========================================
// RENDU DYNAMIQUE DES QUESTIONS
// ===========================================

function renderStep(q, stepIndex) {
  const stepNum = stepIndex + 1;
  const isLast = stepNum === TOTAL_STEPS;
  const isFirst = stepNum === 1;

  const labelText = isLast
    ? `Question ${stepNum} / ${TOTAL_STEPS} · Dernière !`
    : `Question ${stepNum} / ${TOTAL_STEPS}`;

  let content = '';

  if (q.type === 'multi') {
    const opts = q.options.map(o =>
      `<div class="check-option" data-value="${o.value}"><span class="checkmark">✓</span>${o.label}</div>`
    ).join('');
    content = `<div class="multi-grid" data-qid="${q.id}">${opts}</div>`;

  } else if (q.type === 'radio') {
    const opts = q.options.map(o =>
      `<div class="radio-option" data-value="${o.value}">${o.label}</div>`
    ).join('');
    content = `<div class="radio-list radio-group" data-group="${q.id}" data-qid="${q.id}">${opts}</div>`;

  } else if (q.type === 'slider') {
    const def = q.defaultValue ?? 5;
    const defLabel = q.formatValue ? q.formatValue(def) : def + 'h';
    content = `
      <div class="slider-container">
        <div class="slider-value" id="sliderValue">${defLabel}</div>
        <div class="slider-unit">par semaine</div>
        <input type="range" min="${q.min}" max="${q.max}" step="${q.step}"
               value="${def}" class="slider" id="hoursSlider" data-qid="${q.id}">
        <div class="slider-bounds"><span>${q.min}h</span><span>${q.max}h+</span></div>
      </div>`;

  } else if (q.type === 'email') {
    content = `<input type="email" class="email-input" id="emailInput"
                      placeholder="${q.placeholder || 'vous@exemple.fr'}" />`;
  }

  return `
    <div class="q-step${isFirst ? ' active' : ''}" data-step="${stepNum}" data-qid="${q.id}">
      <div class="q-step-num">${labelText}</div>
      <div class="q-question">${q.question}</div>
      ${q.helper ? `<div class="q-helper">${q.helper}</div>` : ''}
      ${content}
    </div>`;
}

function renderAllQuestions() {
  const body = document.querySelector('.q-body');
  body.innerHTML = currentVertical.questions.map((q, i) => renderStep(q, i)).join('');
}

// ===========================================
// NAVIGATION
// ===========================================

function updateView() {
  document.querySelectorAll('.q-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.q-step[data-step="${qStep}"]`).classList.add('active');

  document.getElementById('qProgressFill').style.width = (qStep / TOTAL_STEPS * 100) + '%';
  document.getElementById('qBack').style.display = qStep > 1 ? 'block' : 'none';

  const nextBtn = document.getElementById('qNext');
  if (qStep === TOTAL_STEPS) {
    // Pré-charge l'IP dès l'arrivée sur l'étape email
    if (!clientIP) {
      getClientIP().then(ip => { clientIP = ip; });
    }
    nextBtn.textContent = 'Démarrer →';
    nextBtn.classList.remove('q-btn-next');
    nextBtn.classList.add('q-btn-final');
    nextBtn.disabled = !isValidEmail(document.getElementById('emailInput').value);
  } else {
    nextBtn.textContent = 'Continuer';
    nextBtn.classList.add('q-btn-next');
    nextBtn.classList.remove('q-btn-final');
    nextBtn.disabled = false;
  }

  document.querySelector('.q-body').scrollTop = 0;
}

function checkEmail() {
  if (qStep === TOTAL_STEPS) {
    document.getElementById('qNext').disabled =
      !isValidEmail(document.getElementById('emailInput').value);
  }
}

function qNext() {
  if (qStep < TOTAL_STEPS) {
    qStep++;
    updateView();
  } else {
    saveAnswersAndConfigure();
  }
}

function qPrev() {
  if (qStep > 1) {
    qStep--;
    updateView();
  }
}

// ===========================================
// COLLECTE DES RÉPONSES
// ===========================================

function collectAnswers() {
  const answers = {};

  currentVertical.questions.forEach(q => {
    if (q.type === 'email') {
      answers.email = document.getElementById('emailInput').value;
      return;
    }

    const container = document.querySelector(`.q-step[data-qid="${q.id}"]`);
    if (!container) return;

    if (q.type === 'multi') {
      answers[q.id] = Array.from(container.querySelectorAll('.check-option.selected'))
        .map(el => el.dataset.value);
    } else if (q.type === 'radio') {
      const sel = container.querySelector('.radio-option.selected');
      answers[q.id] = sel ? sel.dataset.value : null;
    } else if (q.type === 'slider') {
      answers[q.id] = parseInt(container.querySelector('.slider').value, 10);
    }
  });

  return answers;
}

// ===========================================
// SOUMISSION
// ===========================================

function saveAnswersAndConfigure() {
  if (configureStarted) return;
  configureStarted = true;

  const answers = collectAnswers();
  SpotterStorage.saveAnswers(answers);

  const payload = {
    submission_type: 'questionnaire_completed',
    _subject: `[Spotter] Questionnaire — ${currentVertical.label}`,
    vertical: verticalKey,
    visitor_ip: clientIP || 'non disponible',
    submitted_at: new Date().toISOString(),
  };

  // Aplatit toutes les réponses dans le payload
  currentVertical.questions.forEach(q => {
    const val = answers[q.id];
    if (val === undefined || val === null) return;
    payload[q.id] = Array.isArray(val) ? val.join(', ') : val;
  });

  submitToFormspree(payload);
  startConfigureAnimation();
}

// ===========================================
// ANIMATION DE CONFIGURATION
// ===========================================

function startConfigureAnimation() {
  document.getElementById('configureModal').classList.add('show');

  document.querySelectorAll('.config-step').forEach(s => {
    s.classList.remove('active', 'done');
    const icon = s.querySelector('.config-step-icon');
    icon.textContent = parseInt(s.dataset.config) + 1;
  });

  const steps = document.querySelectorAll('.config-step');
  const stepDelay = 700;

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('active');
      step.querySelector('.config-step-icon').innerHTML = '<span class="mini-spinner"></span>';
    }, i * stepDelay);

    setTimeout(() => {
      step.classList.remove('active');
      step.classList.add('done');
      step.querySelector('.config-step-icon').textContent = '✓';
    }, i * stepDelay + stepDelay - 50);
  });

  setTimeout(() => {
    goTo('download.html');
  }, steps.length * stepDelay + 500);
}

// ===========================================
// INITIALISATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  // Injecter le chip/titre de la verticale
  const chipEl = document.getElementById('qChip');
  if (chipEl) chipEl.textContent = currentVertical.chip;
  const titleEl = document.getElementById('qTitle');
  if (titleEl) titleEl.textContent = currentVertical.title;
  const subtitleEl = document.getElementById('qSubtitle');
  if (subtitleEl) subtitleEl.textContent = currentVertical.subtitle;

  // Générer les questions
  renderAllQuestions();

  // Multi-select
  document.querySelectorAll('.multi-grid .check-option').forEach(opt => {
    opt.addEventListener('click', () => opt.classList.toggle('selected'));
  });

  // Radio groups
  document.querySelectorAll('.radio-group').forEach(group => {
    group.querySelectorAll('.radio-option').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  });

  // Slider
  const slider = document.getElementById('hoursSlider');
  if (slider) {
    const sliderQ = currentVertical.questions.find(q => q.id === 'hours');
    slider.addEventListener('input', () => {
      document.getElementById('sliderValue').textContent =
        sliderQ.formatValue ? sliderQ.formatValue(slider.value) : slider.value + 'h';
    });
  }

  // Email
  document.getElementById('emailInput').addEventListener('input', checkEmail);

  // Boutons de navigation
  document.getElementById('qNext').addEventListener('click', qNext);
  document.getElementById('qBack').addEventListener('click', qPrev);

  updateView();
});
