// Data state
let hospitalData = {
    name: 'Apollo Specialty Hospital',
    beds: 200,
    dailyDischarges: 5,
    dischargeTimeHours: 3,
    numMTs: 3,
    staffCostPerMT: 30000,
    // Metrics
    monthlyDischarges: 150,
    bedRevenueLoss: 1687500,
    staffCost: 90000,
    billingDelay: 18750,
    totalCost: 1796250,
    aiCost: 15000,
    netSavings: 1772250,
    roi: 118,
    fiveYearSavings: 100000000
};

// UI State
let currentStage = 0; // 0: Input, 1: Hidden Costs, 2: Transformation

document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    bindActions();
    calculateAndRender();
});

function bindInputs() {
    document.getElementById('monthlyDischargesInput').addEventListener('input', calculateAndRender);
    document.getElementById('dischargeTime').addEventListener('change', calculateAndRender);
    document.getElementById('numMTs').addEventListener('input', calculateAndRender);
    document.getElementById('staffCostInput').addEventListener('input', calculateAndRender);
    document.getElementById('hospitalName').addEventListener('input', (e) => {
        hospitalData.name = e.target.value;
    });
}

function bindActions() {
    document.getElementById('btnRevealCosts').addEventListener('click', () => {
        currentStage = 1;
        revealSection('sec-hidden-costs');
        // Hide button after click? No, keep it as navigation anchor or hide it.
        document.getElementById('btnRevealCosts').style.display = 'none';
        updateUI();
    });

    document.getElementById('btnRevealTransform').addEventListener('click', () => {
        currentStage = 2;
        revealSection('sec-transformation');
        document.getElementById('btnRevealTransform').style.display = 'none';
        updateUI();
    });
}

function revealSection(id) {
    const el = document.getElementById(id);
    el.classList.remove('hidden-step');
    el.classList.add('visible-step');

    // Smooth scroll to it
    setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function calculateAndRender() {
    const monthlyDischarges = parseInt(document.getElementById('monthlyDischargesInput').value) || 150;
    const dischargeTime = parseFloat(document.getElementById('dischargeTime').value) || 3;
    const numMTs = parseInt(document.getElementById('numMTs').value) || 3;
    const staffCostPerMT = parseInt(document.getElementById('staffCostInput').value) || 30000;

    // Logic
    const bedHoursBlocked = monthlyDischarges * dischargeTime;
    const bedDaysLost = bedHoursBlocked / 24;
    const bedRevenueLoss = bedDaysLost * 15000;

    const staffCost = numMTs * staffCostPerMT;
    const mtHoursWaste = monthlyDischarges * dischargeTime;

    const avgBill = 50000;
    const billingDelay = (2 * monthlyDischarges * avgBill * 0.0001);

    const totalBefore = bedRevenueLoss + staffCost + billingDelay;

    const aiCost = monthlyDischarges * 100;
    const staffCostAfter = staffCost * 0.1;

    const netSavings = (totalBefore) - (staffCostAfter + aiCost);
    const roi = Math.round(netSavings / aiCost);
    const fiveYear = netSavings * 60;

    hospitalData = {
        ...hospitalData,
        monthlyDischarges,
        bedRevenueLoss,
        staffCost,
        billingDelay,
        totalCost: totalBefore,
        aiCost,
        netSavings,
        roi,
        fiveYearSavings: fiveYear,
        bedDaysLost,
        mtHoursWaste
    };

    updateUI();
}

function updateUI() {
    const fmt = (val) => {
        if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
        return '₹' + Math.round(val).toLocaleString('en-IN');
    };
    const num = (val) => Math.round(val).toLocaleString('en-IN');

    // Left Panel Checks
    setText('dispBedLoss', fmt(hospitalData.bedRevenueLoss));
    setText('dispBedDays', hospitalData.bedDaysLost.toFixed(1));
    setText('dispStaffLoss', fmt(hospitalData.staffCost));
    setText('dispMtHours', num(hospitalData.mtHoursWaste));
    setText('dispBillingLoss', fmt(hospitalData.billingDelay));
    setText('oldRevLoss', fmt(hospitalData.bedRevenueLoss));
    setText('txtMonthlyDrain', fmt(hospitalData.totalCost));

    // Right Panel (State Dependent)
    const mainLabel = document.getElementById('labelMainMetric');
    const mainVal = document.getElementById('dashMainValue');
    const roiContainer = document.getElementById('dashSubMetric');
    const fiveYearBox = document.getElementById('boxFiveYear');

    if (currentStage === 0) {
        // Stage 0: Preview Mode
        mainLabel.textContent = "Potential Drain";
        mainVal.textContent = fmt(hospitalData.totalCost);
        mainVal.className = "metric-value bad";
        roiContainer.style.opacity = '0';
        fiveYearBox.classList.add('hidden-step');

    } else if (currentStage === 1) {
        // Stage 1: Problem Realization
        mainLabel.textContent = "Monthly Loss";
        mainVal.textContent = fmt(hospitalData.totalCost);
        mainVal.className = "metric-value bad"; // Emphasize RED
        roiContainer.style.opacity = '0';
        fiveYearBox.classList.add('hidden-step');

    } else if (currentStage === 2) {
        // Stage 2: Solution
        mainLabel.textContent = "Monthly Savings";
        mainVal.textContent = fmt(hospitalData.netSavings);
        mainVal.className = "metric-value good"; // Switch to WHITE/GREEN
        roiContainer.style.opacity = '1';
        setText('dashRoi', hospitalData.roi + 'X');

        fiveYearBox.classList.remove('hidden-step');
        fiveYearBox.classList.add('visible-step');
        setText('dashFiveYear', '₹' + (hospitalData.fiveYearSavings / 10000000).toFixed(2) + ' Cr');
    }

    // Always visible metrics
    setText('dashTotalCost', fmt(hospitalData.totalCost));
    setText('dashAiCost', '₹' + (hospitalData.aiCost / 1000).toFixed(1) + ' k');
    setText('dashDischarges', hospitalData.monthlyDischarges);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
