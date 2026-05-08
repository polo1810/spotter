// ===========================================
// SPOTTER · Logique du questionnaire
// ===========================================

const TOTAL_STEPS = 10;
let qStep = 1;
let configureStarted = false;
let clientIP = null;

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
    document.getElementById('qNext').disabled = !isValidEmail(document.getElementById('emailInput').value);
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

function collectAnswers() {
  const tools = Array.from(document.querySelectorAll('#step1Options .check-option.selected'))
    .map(el => el.dataset.value);
  
  const radioGroups = {};
  document.querySelectorAll('.radio-group').forEach(group => {
    const selected = group.querySelector('.radio-option.selected');
    radioGroups[group.dataset.group] = selected ? selected.dataset.value : null;
  });
  
  return {
    tools,
    role: radioGroups.role,
    size: radioGroups.size,
    clients: radioGroups.clients,
    reports: radioGroups.reports,
    comm: radioGroups.comm,
    habits: radioGroups.habits,
    auto: radioGroups.auto,
    hours: parseInt(document.getElementById('hoursSlider').value, 10),
    email: document.getElementById('emailInput').value
  };
}

function saveAnswersAndConfigure() {
  if (configureStarted) return;
  configureStarted = true;

  const answers = collectAnswers();
  SpotterStorage.saveAnswers(answers);

  // Soumission Formspree non-bloquante.
  // L'animation de configure dure ~3s, ce qui laisse largement
  // le temps à la requête de partir avant la redirection.
  submitToFormspree({
    submission_type: 'questionnaire_completed',
    _subject: '[Spotter] Nouveau questionnaire complété',
    email: answers.email,
    tools: (answers.tools || []).join(', '),
    role: answers.role,
    cabinet_size: answers.size,
    clients: answers.clients,
    reports_frequency: answers.reports,
    communication: answers.comm,
    habits: answers.habits,
    automation_experience: answers.auto,
    estimated_hours_lost_per_week: answers.hours,
    visitor_ip: clientIP || 'non disponible',
    submitted_at: new Date().toISOString()
  });

  startConfigureAnimation();
}

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

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
  // Multi-select
  document.querySelectorAll('#step1Options .check-option').forEach(opt => {
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
  const sliderValue = document.getElementById('sliderValue');
  slider.addEventListener('input', () => {
    sliderValue.textContent = slider.value === '15' ? '15h+' : slider.value + 'h';
  });
  
  // Buttons
  document.getElementById('qNext').addEventListener('click', qNext);
  document.getElementById('qBack').addEventListener('click', qPrev);
  document.getElementById('emailInput').addEventListener('input', checkEmail);
  
  updateView();
});
