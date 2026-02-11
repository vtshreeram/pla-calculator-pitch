// Data state
let hospitalData = {
    name: 'Apollo Specialty Hospital',
    beds: 200,
    occupancyPct: 75,
    dischargeMode: 'day', // 'day' or 'month'
    dischargeVolumeInput: 5,
    dailyDischarges: 5,
    dischargeTimeHours: 3,
    numMTs: 3,
    staffCostPerMT: 30000,
    // Computed metrics
    monthlyDischarges: 150,
    // Time-based metrics (Screen 1)
    staffEffortPerDischarge: 2.1,
    doctorTimeScreen1: 20,
    patientWaitHours: 3,
    // Screen 2: Cost breakdown
    doctorTimeMinutes: 20,     // from Screen 1 doctorTimeScreen1
    doctorHourlyCost: 2000,    // ₹/hour (fixed assumption)
    monthlyDoctorHours: 50,
    monthlyDoctorCost: 100000,
    monthlyMtHours: 315,
    monthlyMtCost: 59063,
    monthlyPatientWaitHours: 450,
    totalEffortHours: 365,
    totalMonthlyCost: 159063,
    costPerDischarge: 1060,
    // Screen 3: Transformation metrics
    plaEffortHours: 55,
    plaDocCost: 5906,
    plaCostPerDischarge: 100,    // ₹100 per discharge (fixed)
    plaMonthlyCost: 15000,
    monthlySavings: 144063
};

let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    calculateAndRender();
    updateUI();
});

function bindInputs() {
    document.getElementById('dischargeVolumeInput').addEventListener('input', calculateAndRender);
    document.getElementById('dischargeTime').addEventListener('change', calculateAndRender);
    document.getElementById('numMTs').addEventListener('input', calculateAndRender);
    document.getElementById('staffCostInput').addEventListener('input', calculateAndRender);
    document.getElementById('numBeds').addEventListener('input', calculateAndRender);
    document.getElementById('occupancyPct').addEventListener('input', calculateAndRender);
    document.getElementById('hospitalName').addEventListener('input', (e) => {
        hospitalData.name = e.target.value;
    });
}

// Discharge mode toggle (Per Day / Per Month)
window.setDischargeMode = function (mode) {
    hospitalData.dischargeMode = mode;

    const btnDay = document.getElementById('togglePerDay');
    const btnMonth = document.getElementById('togglePerMonth');
    const input = document.getElementById('dischargeVolumeInput');

    if (mode === 'day') {
        btnDay.classList.add('active');
        btnMonth.classList.remove('active');
        const currentVal = parseInt(input.value) || 5;
        if (hospitalData._lastMode === 'month') {
            input.value = Math.round(currentVal / 30) || 1;
        }
    } else {
        btnMonth.classList.add('active');
        btnDay.classList.remove('active');
        const currentVal = parseInt(input.value) || 5;
        if (hospitalData._lastMode === 'day') {
            input.value = currentVal * 30;
        }
    }

    hospitalData._lastMode = mode;
    calculateAndRender();
};

// Global scope for onclick
window.goToSlide = function (n) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => s.classList.remove('active-slide'));

    const target = document.getElementById(`slide-${n}`);
    if (target) target.classList.add('active-slide');

    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.dot[data-step="${n}"]`)?.classList.add('active');

    currentSlide = n;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateUI();
};

function calculateAndRender() {
    const dischargeVolumeInput = parseInt(document.getElementById('dischargeVolumeInput').value) || 5;
    const dischargeTime = parseFloat(document.getElementById('dischargeTime').value) || 3;
    const numMTs = parseInt(document.getElementById('numMTs').value) || 3;
    const staffCostPerMT = parseInt(document.getElementById('staffCostInput').value) || 30000;
    const beds = parseInt(document.getElementById('numBeds').value) || 200;
    const occupancyPct = Math.min(100, Math.max(0, parseInt(document.getElementById('occupancyPct').value) || 75));

    // Determine monthly discharges based on toggle mode
    let monthlyDischarges;
    if (hospitalData.dischargeMode === 'day') {
        monthlyDischarges = dischargeVolumeInput * 30;
    } else {
        monthlyDischarges = dischargeVolumeInput;
    }

    // ─── Screen 1: Time-based metrics ───
    // Staff effort: 70% of discharge time is active staff work
    const staffEffortPerDischarge = parseFloat((dischargeTime * 0.7).toFixed(1));

    // Doctor time mapped from discharge time
    let doctorTimeScreen1;
    if (dischargeTime <= 2) {
        doctorTimeScreen1 = 15;
    } else if (dischargeTime <= 4) {
        doctorTimeScreen1 = 20;
    } else if (dischargeTime <= 6) {
        doctorTimeScreen1 = 25;
    } else {
        doctorTimeScreen1 = 30;
    }

    const patientWaitHours = dischargeTime;

    // ─── Screen 2: Cost breakdown calculations ───

    // Card 1: Doctor Time Cost (uses doctorTimeScreen1 from Screen 1)
    const doctorTimeMinutes = doctorTimeScreen1; // from Screen 1, not hardcoded
    const doctorHoursPerDischarge = doctorTimeMinutes / 60;
    const monthlyDoctorHours = doctorHoursPerDischarge * monthlyDischarges;
    const doctorHourlyCost = 2000; // ₹2,000/hour assumption
    const monthlyDoctorCost = monthlyDoctorHours * doctorHourlyCost;

    // Card 2: Manual Documentation Effort (uses staffEffortPerDischarge from Screen 1)
    const monthlyMtHours = staffEffortPerDischarge * monthlyDischarges;
    const costPerMtHour = staffCostPerMT / 160; // 160 working hours/month
    const monthlyMtCost = monthlyMtHours * costPerMtHour;

    // Card 3: Patient Waiting Effort (display only, not part of financial cost)
    const monthlyPatientWaitHours = monthlyDischarges * dischargeTime;

    // Summary metrics (only doctor cost + staff cost, NO bed blocking)
    const totalEffortHours = monthlyDoctorHours + monthlyMtHours;
    const totalMonthlyCost = monthlyDoctorCost + monthlyMtCost;
    const costPerDischarge = monthlyDischarges > 0 ? totalMonthlyCost / monthlyDischarges : 0;

    // ─── Screen 3: Transformation metrics ───

    // PLA effort: reduce total effort by 85%
    const plaEffortHours = totalEffortHours * 0.15;

    // PLA documentation cost: reduce MT cost by 90%
    const plaDocCost = monthlyMtCost * 0.10;

    // PLA cost per discharge: ₹100 (fixed)
    const plaCostPerDischarge = 100;
    const plaMonthlyCost = monthlyDischarges * plaCostPerDischarge;

    // Monthly savings: current total cost minus PLA monthly cost
    const monthlySavings = totalMonthlyCost - plaMonthlyCost;

    hospitalData = {
        ...hospitalData,
        beds,
        occupancyPct,
        dischargeVolumeInput,
        monthlyDischarges,
        dischargeTimeHours: dischargeTime,
        numMTs,
        staffCostPerMT,
        // Screen 1
        staffEffortPerDischarge,
        doctorTimeScreen1,
        patientWaitHours,
        // Screen 2
        doctorTimeMinutes,
        monthlyDoctorHours,
        monthlyDoctorCost,
        monthlyMtHours,
        monthlyMtCost,
        monthlyPatientWaitHours,
        totalEffortHours,
        totalMonthlyCost,
        costPerDischarge,
        // Screen 3
        plaEffortHours,
        plaDocCost,
        plaCostPerDischarge,
        plaMonthlyCost,
        monthlySavings
    };

    updateUI();
}

function updateUI() {
    const fmt = (val) => {
        if (val >= 10000000) return '\u20B9' + (val / 10000000).toFixed(2) + ' Cr';
        if (val >= 100000) return '\u20B9' + (val / 100000).toFixed(2) + ' L';
        return '\u20B9' + Math.round(val).toLocaleString('en-IN');
    };
    const num = (val) => Math.round(val).toLocaleString('en-IN');
    const hrs1 = (val) => parseFloat(val.toFixed(1));

    // ─── Slide 2 (Cost Breakdown) card values ───
    // Card 1: Doctor Time (uses doctorTimeScreen1 via doctorTimeMinutes from Screen 1)
    setText('dispDoctorTimePerDischarge', hospitalData.doctorTimeMinutes + ' minutes per discharge');
    setText('dispDoctorHoursMonth', hrs1(hospitalData.monthlyDoctorHours));
    setText('dispDoctorCostMonth', fmt(hospitalData.monthlyDoctorCost));

    // Card 2: Manual Documentation Effort (uses staffEffortPerDischarge from Screen 1)
    setText('dispMtHoursMonth', hrs1(hospitalData.monthlyMtHours) + ' hours/month');
    setText('dispMtCostMonth', fmt(hospitalData.monthlyMtCost));

    // Card 3: Patient Waiting Time (display only)
    const waitHours = hospitalData.dischargeTimeHours;
    const waitLabel = waitHours === 1 ? '1 hour per discharge' : waitHours + ' hours per discharge';
    setText('dispPatientWaitPerDischarge', waitLabel);
    setText('dispPatientWaitTotal', num(hospitalData.monthlyPatientWaitHours));

    // ─── Slide 3 (Transformation) comparison table values ───
    const dischargeTime = hospitalData.dischargeTimeHours || 3;
    const dischargeTimeLabel = dischargeTime === 1 ? '1 hour' : dischargeTime + ' hours';

    // Row 1: Discharge Processing Time
    setText('tblCurrentDischargeTime', dischargeTimeLabel);

    // Row 2: Doctor Time per Discharge (from Screen 1)
    setText('tblCurrentDoctorTime', hospitalData.doctorTimeMinutes + ' minutes');

    // Row 3: Monthly Discharge Effort
    setText('tblCurrentEffort', num(hospitalData.totalEffortHours) + ' hours/month');
    setText('tblPlaEffort', num(hospitalData.plaEffortHours) + ' hours/month');

    // Row 4: Documentation Cost
    setText('tblCurrentDocCost', fmt(hospitalData.monthlyMtCost) + '/month');
    setText('tblPlaDocCost', fmt(hospitalData.plaDocCost) + '/month');

    // ─── Dashboard (Right Panel) ───
    const dashWrapper = document.getElementById('dashboardWrapper');
    const panelTitle = document.getElementById('dashPanelTitle');
    const timeCards = document.getElementById('timeImpactCards');
    const costSummary = document.getElementById('costSummaryPanel');
    const financialOutcome = document.getElementById('financialOutcomePanel');
    const footerText = document.getElementById('dashFooterText');

    if (!dashWrapper) return;

    // Reset state classes
    dashWrapper.classList.remove('state-success');

    // Hide all panels first
    if (timeCards) timeCards.style.display = 'none';
    if (costSummary) costSummary.style.display = 'none';
    if (financialOutcome) financialOutcome.style.display = 'none';

    if (currentSlide === 0) {
        // ─── Screen 1: Time-based impact cards ───
        panelTitle.textContent = 'Current Discharge Reality';
        if (timeCards) timeCards.style.display = '';

        // Card 1: Total Staff Effort per Discharge (70% of discharge time)
        const staffEffort = hospitalData.staffEffortPerDischarge;
        const staffHourLabel = staffEffort === 1 ? 'hour' : 'hours';
        setText('dashHospitalEffort', staffEffort + ' ' + staffHourLabel);

        // Card 2: Doctor Time per Discharge (mapped from discharge time)
        setText('dashDoctorTime', hospitalData.doctorTimeScreen1 + ' minutes');

        // Card 3: Patient Waiting After Clearance
        const hourLabel = dischargeTime === 1 ? 'hour' : 'hours';
        setText('dashPatientWait', dischargeTime + ' ' + hourLabel);

        if (footerText) footerText.textContent = "Based on your hospital\u2019s discharge workflow inputs.";

    } else if (currentSlide === 1) {
        // ─── Screen 2: Monthly Impact Summary ───
        panelTitle.textContent = 'Monthly Impact Summary';
        if (costSummary) costSummary.style.display = '';

        // Total Discharge Effort (hours rounded to 1 decimal)
        setText('dashTotalEffortHours', hrs1(hospitalData.totalEffortHours) + ' hours/month');

        // Total Monthly Discharge Cost
        setText('dashTotalMonthlyCost', fmt(hospitalData.totalMonthlyCost));

        // Average Cost per Discharge
        setText('dashCostPerDischarge', fmt(hospitalData.costPerDischarge));

        if (footerText) {
            footerText.textContent = 'Based on ' + hospitalData.monthlyDischarges + ' monthly discharges';
        }

    } else if (currentSlide === 2) {
        // ─── Screen 3: Monthly Financial Outcome ───
        panelTitle.textContent = 'Monthly Financial Outcome';
        if (financialOutcome) financialOutcome.style.display = '';

        // Current Monthly Loss
        setText('dashCurrentLoss', fmt(hospitalData.totalMonthlyCost));

        // Monthly Savings with PLA
        setText('dashMonthlySavings', fmt(hospitalData.monthlySavings));

        // PLA Cost per Discharge
        setText('dashPlaCostPerDischarge', '\u20B9' + hospitalData.plaCostPerDischarge);

        if (footerText) {
            footerText.textContent = 'Based on ' + hospitalData.monthlyDischarges + ' monthly discharges';
        }
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
