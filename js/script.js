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

document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    calculateAndRender();
});

function bindInputs() {
    // List of input IDs to listen to
    const numericInputs = ['monthlyDischargesInput', 'numMTs', 'staffCostInput']; // Note: Changed daily -> monthly input directly for simplicity in split panel, or calculate?
    // In HTML I put 'monthlyDischargesInput' and 'dailyDischarges' desc. Let's sync.
    // HTML has: id="monthlyDischargesInput" value="150"

    document.getElementById('monthlyDischargesInput').addEventListener('input', calculateAndRender);
    document.getElementById('dischargeTime').addEventListener('change', calculateAndRender);
    document.getElementById('numMTs').addEventListener('input', calculateAndRender);
    document.getElementById('staffCostInput').addEventListener('input', calculateAndRender);
    document.getElementById('hospitalName').addEventListener('input', (e) => {
        hospitalData.name = e.target.value;
    });
}

function calculateAndRender() {
    // 1. Gather Inputs
    const monthlyDischarges = parseInt(document.getElementById('monthlyDischargesInput').value) || 150;
    const dischargeTime = parseFloat(document.getElementById('dischargeTime').value) || 3;
    const numMTs = parseInt(document.getElementById('numMTs').value) || 3;
    const staffCostPerMT = parseInt(document.getElementById('staffCostInput').value) || 30000;

    // 2. Logic (Audit against KT)

    // Revenue Loss: (Discharges * Hours) / 24 * 15k
    const bedHoursBlocked = monthlyDischarges * dischargeTime;
    const bedDaysLost = bedHoursBlocked / 24;
    const bedRevenueLoss = bedDaysLost * 15000;

    // Staff Waste: (Fixed Payroll)
    const staffCost = numMTs * staffCostPerMT;
    const mtHoursWaste = monthlyDischarges * dischargeTime; // Total man-hours consumed

    // Billing Delay: (2 days * Discharges * 50k * 0.01%)
    const avgBill = 50000;
    const billingDelay = (2 * monthlyDischarges * avgBill * 0.0001);

    const totalBefore = bedRevenueLoss + staffCost + billingDelay;

    // Transformation (With AI)
    const aiCost = monthlyDischarges * 100;
    const staffCostAfter = staffCost * 0.1; // 10% needed for review

    const netSavings = (totalBefore) - (staffCostAfter + aiCost);
    const roi = Math.round(netSavings / aiCost);
    const fiveYear = netSavings * 60;

    // 3. Update State
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

    // 4. Render
    updateUI();
}

function updateUI() {
    // Formatters
    const fmt = (val) => {
        if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
        return '₹' + Math.round(val).toLocaleString('en-IN');
    };
    const num = (val) => Math.round(val).toLocaleString('en-IN');

    // === LEFT PANEL ===
    // Hidden Costs
    setText('dispBedLoss', fmt(hospitalData.bedRevenueLoss));
    setText('dispBedDays', hospitalData.bedDaysLost.toFixed(1));

    setText('dispStaffLoss', fmt(hospitalData.staffCost));
    setText('dispMtHours', num(hospitalData.mtHoursWaste)); // approx hours

    setText('dispBillingLoss', fmt(hospitalData.billingDelay));

    // Transformation
    setText('oldRevLoss', fmt(hospitalData.bedRevenueLoss));
    setText('txtMonthlyDrain', fmt(hospitalData.totalCost));

    // === RIGHT PANEL (Dashboard) ===
    setText('dashNetSavings', fmt(hospitalData.netSavings));
    setText('dashRoi', hospitalData.roi + 'X');

    setText('dashTotalCost', fmt(hospitalData.totalCost));
    setText('dashAiCost', '₹' + (hospitalData.aiCost / 1000).toFixed(1) + ' k');

    setText('dashFiveYear', '₹' + (hospitalData.fiveYearSavings / 10000000).toFixed(2) + ' Cr');
    setText('dashDischarges', hospitalData.monthlyDischarges);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
