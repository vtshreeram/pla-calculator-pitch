// Data state
let hospitalData = {
    name: 'Apollo Specialty Hospital',
    beds: 200,
    occupancyPct: 75,
    dischargeMode: 'day',
    dischargeVolumeInput: 5,
    dailyDischarges: 5,
    dischargeTimeHours: 3,
    numMTs: 3,
    staffCostPerMT: 30000,
    monthlyDischarges: 150,
    staffEffortPerDischarge: 2.1,
    doctorTimeScreen1: 20,
    patientWaitHours: 3,
    doctorTimeMinutes: 20,
    doctorHourlyCost: 2000,
    monthlyDoctorHours: 50,
    monthlyDoctorCost: 100000,
    monthlyMtHours: 315,
    monthlyMtCost: 59063,
    monthlyPatientWaitHours: 450,
    totalEffortHours: 365,
    totalMonthlyCost: 159063,
    costPerDischarge: 1060,
    plaEffortHours: 55,
    plaDocCost: 5906,
    plaCostPerDischarge: 100,
    plaMonthlyCost: 15000,
    monthlySavings: 144063,
    _lastMode: 'day',
    _confettiFrameId: null
};

let currentSlide = 0;

// STATE PERSISTENCE
function loadState() {
    try {
        const saved = localStorage.getItem('pla-hospital-data');
        if (saved) {
            const parsed = JSON.parse(saved);
            hospitalData = { ...hospitalData, ...parsed };
            const elements = {
                'hospitalName': 'name', 'numBeds': 'beds', 'occupancyPct': 'occupancyPct',
                'dischargeVolumeInput': 'dischargeVolumeInput', 'dischargeTime': 'dischargeTimeHours',
                'numMTs': 'numMTs', 'staffCostInput': 'staffCostPerMT'
            };
            for (const [elId, dataKey] of Object.entries(elements)) {
                const el = document.getElementById(elId);
                if (el && hospitalData[dataKey] !== undefined) el.value = hospitalData[dataKey];
            }
            const btnDay = document.getElementById('togglePerDay');
            const btnMonth = document.getElementById('togglePerMonth');
            if (hospitalData.dischargeMode === 'month') {
                btnMonth?.classList.add('active');
                btnDay?.classList.remove('active');
            } else {
                btnDay?.classList.add('active');
                btnMonth?.classList.remove('active');
            }
        }
    } catch (e) { console.warn('Could not load saved state:', e); }
}

function saveState() {
    try { localStorage.setItem('pla-hospital-data', JSON.stringify(hospitalData)); }
    catch (e) { console.warn('Could not save state:', e); }
}

// INPUT VALIDATION
function validateInput(value, min, max, defaultVal) {
    const num = parseFloat(value);
    if (isNaN(num) || num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
}

// MAIN CALCULATION ENGINE
function calculateAndRender() {
    const dischargeVolumeInput = validateInput(document.getElementById('dischargeVolumeInput')?.value, 1, Infinity, 5);
    const dischargeTime = validateInput(document.getElementById('dischargeTime')?.value, 0.5, 24, 3);
    const numMTs = validateInput(document.getElementById('numMTs')?.value, 1, 100, 3);
    const staffCostPerMT = validateInput(document.getElementById('staffCostInput')?.value, 1000, 1000000, 30000);
    const beds = validateInput(document.getElementById('numBeds')?.value, 1, 10000, 200);
    const occupancyPct = validateInput(document.getElementById('occupancyPct')?.value, 0, 100, 75);
    
    let monthlyDischarges = hospitalData.dischargeMode === 'day' ? dischargeVolumeInput * 30 : dischargeVolumeInput;
    monthlyDischarges = Math.max(1, monthlyDischarges);

    const staffEffortPerDischarge = parseFloat((dischargeTime * 0.7).toFixed(1));
    let doctorTimeScreen1;
    if (dischargeTime <= 2) doctorTimeScreen1 = 15;
    else if (dischargeTime <= 4) doctorTimeScreen1 = 20;
    else if (dischargeTime <= 6) doctorTimeScreen1 = 25;
    else doctorTimeScreen1 = 30;
    
    const monthlyDoctorHours = (doctorTimeScreen1 / 60) * monthlyDischarges;
    const monthlyDoctorCost = monthlyDoctorHours * 2000;
    const monthlyMtHours = staffEffortPerDischarge * monthlyDischarges;
    const monthlyMtCost = monthlyMtHours * (staffCostPerMT / 160);
    const totalEffortHours = monthlyDoctorHours + monthlyMtHours;
    const totalMonthlyCost = monthlyDoctorCost + monthlyMtCost;
    const costPerDischarge = totalMonthlyCost / monthlyDischarges;
    const plaEffortHours = totalEffortHours * 0.15;
    const plaDocCost = monthlyMtCost * 0.10;
    const plaMonthlyCost = monthlyDischarges * 100;
    const monthlySavings = plaMonthlyCost > 0 ? totalMonthlyCost - plaMonthlyCost : 0;

    hospitalData = {
        ...hospitalData, beds, occupancyPct, dischargeVolumeInput, monthlyDischarges,
        dischargeTimeHours: dischargeTime, numMTs, staffCostPerMT,
        staffEffortPerDischarge, doctorTimeScreen1, patientWaitHours: dischargeTime,
        doctorTimeMinutes: doctorTimeScreen1, monthlyDoctorHours, monthlyDoctorCost,
        monthlyMtHours, monthlyMtCost, monthlyPatientWaitHours: monthlyDischarges * dischargeTime,
        totalEffortHours, totalMonthlyCost, costPerDischarge,
        plaEffortHours, plaDocCost, plaCostPerDischarge: 100, plaMonthlyCost, monthlySavings
    };

    updateUI();
    saveState();
}

// UI UPDATE
function updateUI() {
    const fmt = (val) => {
        if (!isFinite(val) || isNaN(val)) return '₹0';
        if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
        if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
        return '₹' + Math.round(val).toLocaleString('en-IN');
    };
    const num = (val) => (!isFinite(val) || isNaN(val)) ? '0' : Math.round(val).toLocaleString('en-IN');
    const hrs1 = (val) => (!isFinite(val) || isNaN(val)) ? '0' : parseFloat(val.toFixed(1));

    setText('dispDoctorTimePerDischarge', hospitalData.doctorTimeMinutes + ' minutes per discharge');
    setText('dispDoctorHoursMonth', hrs1(hospitalData.monthlyDoctorHours));
    setText('dispDoctorCostMonth', fmt(hospitalData.monthlyDoctorCost));
    setText('dispMtHoursMonth', hrs1(hospitalData.monthlyMtHours) + ' hours/month');
    setText('dispMtCostMonth', fmt(hospitalData.monthlyMtCost));
    const waitLabel = hospitalData.dischargeTimeHours === 1 ? '1 hour per discharge' : hospitalData.dischargeTimeHours + ' hours per discharge';
    setText('dispPatientWaitPerDischarge', waitLabel);
    setText('dispPatientWaitTotal', num(hospitalData.monthlyPatientWaitHours));
    setText('tblCurrentDischargeTime', hospitalData.dischargeTimeHours === 1 ? '1 hour' : hospitalData.dischargeTimeHours + ' hours');
    setText('tblCurrentDoctorTime', hospitalData.doctorTimeMinutes + ' minutes');
    setText('tblCurrentEffort', num(hospitalData.totalEffortHours) + ' hours/month');
    setText('tblPlaEffort', num(hospitalData.plaEffortHours) + ' hours/month');
    setText('tblCurrentDocCost', fmt(hospitalData.monthlyMtCost) + '/month');
    setText('tblPlaDocCost', fmt(hospitalData.plaDocCost) + '/month');

    const dashWrapper = document.getElementById('dashboardWrapper');
    const panelTitle = document.getElementById('dashPanelTitle');
    const timeCards = document.getElementById('timeImpactCards');
    const costSummary = document.getElementById('costSummaryPanel');
    const financialOutcome = document.getElementById('financialOutcomePanel');
    const footerText = document.getElementById('dashFooterText');
    if (!dashWrapper) return;

    dashWrapper.classList.remove('state-success', 'state-danger');
    if (currentSlide === 0 || currentSlide === 1) dashWrapper.classList.add('state-danger');

    if (timeCards) timeCards.style.display = 'none';
    if (costSummary) costSummary.style.display = 'none';
    if (financialOutcome) financialOutcome.style.display = 'none';

    if (currentSlide === 0) {
        panelTitle.textContent = 'Current Discharge Reality';
        if (timeCards) timeCards.style.display = '';
        setText('dashHospitalEffort', hospitalData.staffEffortPerDischarge + ' ' + (hospitalData.staffEffortPerDischarge === 1 ? 'hour' : 'hours'));
        setText('dashDoctorTime', hospitalData.doctorTimeScreen1 + ' minutes');
        setText('dashPatientWait', hospitalData.dischargeTimeHours + ' ' + (hospitalData.dischargeTimeHours === 1 ? 'hour' : 'hours'));
        if (footerText) footerText.textContent = "Based on your hospital's discharge workflow inputs.";
    } else if (currentSlide === 1 || currentSlide === 2) {
        panelTitle.textContent = 'Monthly Impact Summary';
        if (costSummary) costSummary.style.display = '';
        setText('dashTotalEffortHours', hrs1(hospitalData.totalEffortHours) + ' hours/month');
        setText('dashTotalMonthlyCost', fmt(hospitalData.totalMonthlyCost));
        setText('dashCostPerDischarge', fmt(hospitalData.costPerDischarge));
        if (footerText) footerText.textContent = 'Based on ' + num(hospitalData.monthlyDischarges) + ' monthly discharges';
    } else if (currentSlide >= 3) {
        panelTitle.textContent = 'Monthly Financial Outcome';
        if (financialOutcome) financialOutcome.style.display = '';
        setText('dashCurrentLoss', fmt(hospitalData.totalMonthlyCost));
        setText('dashMonthlySavings', fmt(hospitalData.monthlySavings));
        setText('dashPlaCostPerDischarge', '₹' + hospitalData.plaCostPerDischarge);
        if (footerText) footerText.textContent = 'Based on ' + num(hospitalData.monthlyDischarges) + ' monthly discharges';
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (!el || el.textContent === String(val)) return;
    el.textContent = val;
    el.classList.remove('counter-animating');
    void el.offsetWidth;
    el.classList.add('counter-animating');
    setTimeout(() => el.classList.remove('counter-animating'), 350);
}

// INPUT BINDING
function bindInputs() {
    ['dischargeVolumeInput', 'dischargeTime', 'numMTs', 'staffCostInput', 'numBeds', 'occupancyPct'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.addEventListener('input', calculateAndRender); el.addEventListener('change', calculateAndRender); }
    });
    document.getElementById('hospitalName')?.addEventListener('input', (e) => { hospitalData.name = e.target.value; saveState(); });
}

// DISCHARGE MODE TOGGLE
window.setDischargeMode = function(mode) {
    hospitalData.dischargeMode = mode;
    const btnDay = document.getElementById('togglePerDay');
    const btnMonth = document.getElementById('togglePerMonth');
    const input = document.getElementById('dischargeVolumeInput');
    if (!btnDay || !btnMonth || !input) return;
    const currentVal = parseInt(input.value) || 1;
    if (mode === 'day') {
        btnDay.classList.add('active'); btnMonth.classList.remove('active');
        if (hospitalData._lastMode === 'month') input.value = Math.max(1, Math.round(currentVal / 30));
    } else {
        btnMonth.classList.add('active'); btnDay.classList.remove('active');
        if (hospitalData._lastMode === 'day') input.value = currentVal * 30;
    }
    hospitalData._lastMode = mode;
    calculateAndRender();
};

// SLIDE NAVIGATION
window.goToSlide = function(n) {
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active-slide'));
    document.getElementById(`slide-${n}`)?.classList.add('active-slide');
    const layout = document.querySelector('.main-layout');
    if (layout) layout.classList.toggle('full-width-active', n === 2 || n >= 4);
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.dot[data-step="${n}"]`)?.classList.add('active');
    currentSlide = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    retriggerDashboardAnimations(n);
    if (n === 3) setTimeout(() => { launchConfetti(); addSparkles(); }, 400);
    updateUI();
};

// KEYBOARD NAVIGATION
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { if (currentSlide < 5) goToSlide(currentSlide + 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { if (currentSlide > 0) goToSlide(currentSlide - 1); }
        else if (e.key === 'Home') goToSlide(0);
        else if (e.key === 'End') goToSlide(5);
    });
}

// CONFETTI ENGINE (Fixed memory leak)
function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (hospitalData._confettiFrameId) cancelAnimationFrame(hospitalData._confettiFrameId);
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#00695C', '#1DE9B6', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
    const confettiPieces = [];
    for (let i = 0; i < 120; i++) {
        confettiPieces.push({
            x: canvas.width * Math.random(), y: -20 - Math.random() * 200,
            w: 6 + Math.random() * 6, h: 3 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: 2 + Math.random() * 4, vx: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 12,
            opacity: 1, gravity: 0.08 + Math.random() * 0.04,
            wobble: Math.random() * 10, wobbleSpeed: 0.03 + Math.random() * 0.05,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }
    let frame = 0, maxFrames = 200;
    function animate() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        confettiPieces.forEach(p => {
            if (p.y > canvas.height + 20 || p.opacity <= 0) return;
            alive = true;
            p.vy += p.gravity; p.y += p.vy;
            p.x += p.vx + Math.sin(p.wobble) * 0.8;
            p.wobble += p.wobbleSpeed; p.rotation += p.rotationSpeed;
            if (frame > maxFrames * 0.7) p.opacity -= 0.015;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color;
            if (p.shape === 'rect') ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            else { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        });
        if (alive && frame < maxFrames) { hospitalData._confettiFrameId = requestAnimationFrame(animate); }
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); hospitalData._confettiFrameId = null; }
    }
    animate();
}

// DASHBOARD ANIMATIONS
function retriggerDashboardAnimations(slideIndex) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dashWrapper = document.getElementById('dashboardWrapper');
    if (!dashWrapper) return;
    const panelMap = { 0: '#timeImpactCards .time-card', 1: '#costSummaryPanel .summary-metric', 2: '#costSummaryPanel .summary-metric', 3: '#financialOutcomePanel .summary-metric', 4: '#financialOutcomePanel .summary-metric', 5: '#financialOutcomePanel .summary-metric' };
    const selector = panelMap[slideIndex];
    if (!selector) return;
    document.querySelectorAll(selector).forEach((card, i) => {
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = '';
        card.style.animationDelay = (0.2 + i * 0.2) + 's';
    });
    dashWrapper.classList.toggle('state-success', slideIndex >= 3);
}

// SPARKLES
function addSparkles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dashboard = document.getElementById('dashboardWrapper');
    if (!dashboard) return;
    const rect = dashboard.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'celebration-sparkle';
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        sparkle.style.animationDelay = (Math.random() * 0.8) + 's';
        sparkle.style.width = (6 + Math.random() * 10) + 'px';
        sparkle.style.height = sparkle.style.width;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 2000);
    }
}

// BUTTON RIPPLES
function initButtonRipples() {
    document.querySelectorAll('.btn-primary-lg, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// DOT NAVIGATION
function initDotNavigation() {
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const step = parseInt(this.dataset.step);
            if (!isNaN(step)) goToSlide(step);
        });
    });
}

// INPUT ANIMATIONS
function initInputAnimations() {
    document.querySelectorAll('.input-group input, .input-group select').forEach(input => {
        input.addEventListener('focus', () => input.closest('.input-group')?.classList.add('input-focused'));
        input.addEventListener('blur', () => input.closest('.input-group')?.classList.remove('input-focused'));
    });
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    bindInputs();
    calculateAndRender();
    updateUI();
    initKeyboardNavigation();
    initButtonRipples();
    initDotNavigation();
    initInputAnimations();
});
