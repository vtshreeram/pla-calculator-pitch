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

let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    calculateAndRender();
    updateUI(); // Initial render
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

// Global scope for onclick
window.goToSlide = function (n) {
    // Hide current
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => s.classList.remove('active-slide'));

    // Show next
    const target = document.getElementById(`slide-${n}`);
    if (target) target.classList.add('active-slide');

    // Update Dots
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.dot[data-step="${n}"]`)?.classList.add('active');

    currentSlide = n;

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateUI();
};

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

    // Slide 2 values
    setText('dispBedLoss', fmt(hospitalData.bedRevenueLoss));
    setText('dispBedDays', hospitalData.bedDaysLost.toFixed(1));
    setText('dispStaffLoss', fmt(hospitalData.staffCost));
    setText('dispMtHours', num(hospitalData.mtHoursWaste));
    setText('dispBillingLoss', fmt(hospitalData.billingDelay));

    // Slide 3 values
    setText('oldRevLoss', fmt(hospitalData.bedRevenueLoss));
    setText('txtMonthlyDrain', fmt(hospitalData.totalCost));

    // Dashboard Logic
    const dashWrapper = document.querySelector('.sticky-wrapper');
    const mainLabel = document.getElementById('labelMainMetric');
    const mainVal = document.getElementById('dashMainValue');
    const roiContainer = document.getElementById('dashSubMetric');
    const fiveYearBox = document.getElementById('boxFiveYear');

    // Reset Classes
    dashWrapper.classList.remove('state-danger', 'state-success');

    if (currentSlide === 0) {
        // Slide 1: Inputs -> Show Potential Drain (Neutral/Teal)
        mainLabel.textContent = "Potential Drain";
        mainVal.textContent = fmt(hospitalData.totalCost);
        mainVal.className = "metric-value bad";
        roiContainer.style.opacity = '0';
        fiveYearBox.style.opacity = '0';

    } else if (currentSlide === 1) {
        // Slide 2: Problem -> Show Red Alert (Drain Confirmed)
        dashWrapper.classList.add('state-danger');
        mainLabel.textContent = "Monthly Loss";
        mainVal.textContent = fmt(hospitalData.totalCost);
        mainVal.className = "metric-value good"; // White text on Red BG
        roiContainer.style.opacity = '0';
        fiveYearBox.style.opacity = '0';

    } else if (currentSlide === 2) {
        // Slide 3: Solution -> Show Green Success (Savings)
        dashWrapper.classList.add('state-success');
        mainLabel.textContent = "Monthly Savings";
        mainVal.textContent = fmt(hospitalData.netSavings);
        mainVal.className = "metric-value good"; // White text on Green BG

        roiContainer.style.opacity = '1';
        setText('dashRoi', hospitalData.roi + 'X');

        fiveYearBox.style.opacity = '1';
        setText('dashFiveYear', '₹' + (hospitalData.fiveYearSavings / 10000000).toFixed(2) + ' Cr');
    }

    setText('dashTotalCost', fmt(hospitalData.totalCost));
    setText('dashAiCost', '₹' + (hospitalData.aiCost / 1000).toFixed(1) + ' k');
    setText('dashDischarges', hospitalData.monthlyDischarges);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
