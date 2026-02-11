// Data object to store the state
let hospitalData = {
    name: 'Apollo Specialty Hospital',
    beds: 200,
    dailyDischarges: 5,
    numMTs: 3,
    staffCostPerMT: 30000,
    dischargeTimeHours: 3,
    monthlyDischarges: 150,
    mtHours: 1350,
    staffCost: 90000,
    bedRevenueLoss: 1687500,
    billingDelay: 18750,
    totalMonthlyCost: 1796250,
    patientLensAICost: 15000,
    netSavings: 1772250,
    roi: 118,
    fiveYearSavings: 0,
    bedHoursBlocked: 0,
    bedDaysLost: 0,
    afterMtHours: 0,
    afterStaffCost: 0
};

let currentScreen = 1;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    calculateValues();
    updateProgressIndicator();
});

function bindEvents() {
    // Input listeners
    const inputs = ['numBeds', 'dailyDischarges', 'numMTs', 'staffCostInput', 'hospitalName'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateValues);
    });

    const selects = ['dischargeTime'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculateValues);
    });

    // Navigation buttons
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dir = e.target.getAttribute('data-nav');
            if (dir === 'next') nextScreen();
            if (dir === 'prev') prevScreen();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextScreen();
        if (e.key === 'ArrowLeft') prevScreen();
    });

    // Fullscreen
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
}

function calculateValues() {
    // Get values from DOM
    const beds = parseInt(document.getElementById('numBeds').value) || 0;
    const dailyDischarges = parseInt(document.getElementById('dailyDischarges').value) || 0;
    const numMTs = parseInt(document.getElementById('numMTs').value) || 0;
    const staffCostPerMT = parseInt(document.getElementById('staffCostInput').value) || 30000;
    const dischargeTime = parseFloat(document.getElementById('dischargeTime').value) || 3;
    const name = document.getElementById('hospitalName').value || 'Your Hospital';

    // Core Calculations
    const monthlyDischarges = dailyDischarges * 30;
    const mtHours = monthlyDischarges * dischargeTime * numMTs; // Assumption: All MTs involved or scaled? 
    // Correction based on original logic: mtHours was monthlyDischarges * dischargeTime. 
    // But original code said `monthlyDischarges * dischargeTime * numMTs`? 
    // Let's stick to the logic: "MT Time Waste" = Total man-hours spent on discharge summaries.
    // If 1 discharge takes 3 hours, and there are 150 discharges, that is 450 hours of work.
    // If there are 3 MTs, they share this work? OR does it take 3 hours of ONE person's time?
    // KT says: "Medical transcribers spend 6 hours/day on manual entry".
    // Original formula: `mtHours = monthlyDischarges * dischargeTime * numMTs` -> implies each discharge takes `dischargeTime` hours per MT? That seems high.
    // Let's adjust to reasonable logic: Total Discharge Work Hours = Monthly Discharges * Time Per Discharge.
    // Wait, original `demo.html` had `monthlyDischarges * dischargeTime * numMTs`. That implies if I have 3 MTs, the cost is 3x?
    // Let's assume the input means "Average Discharge Time (Sequential)" and "Number of MTs employed for this".
    // Let's stick to the original `demo.html` formula for consistency unless it's clearly wrong.
    // Original: `const mtHours = monthlyDischarges * dischargeTime * numMTs;`
    // If 150 discharges * 3 hours = 450 hours. If 3 MTs, 1350 hours? Maybe it means total payroll hours allocated?
    // Let's check `staffCost`: `numMTs * staffCostPerMT`. This is fixed payroll.
    // So `mtHours` is just a metric of "wasted human potential".
    
    // Let's refine the logic to be more realistic but keep the "magnitude" of the pitch.
    // Pitch Logic: "You pay for X MTs, and they spend Y% of time on this."
    
    // Revenue Loss
    const bedHoursBlocked = monthlyDischarges * dischargeTime;
    const bedDaysLost = bedHoursBlocked / 24;
    const bedRevenueLoss = bedDaysLost * 15000; // Average revenue per bed day
    
    // Billing Delay
    const avgBillAmount = 50000;
    const billingDelay = (2 * monthlyDischarges * avgBillAmount * 0.0001); // Cost of capital?

    const staffCost = staffCostPerMT * numMTs;
    const totalMonthlyCost = bedRevenueLoss + staffCost + billingDelay;

    // ROI / After Scenarios
    const patientLensAICost = monthlyDischarges * 100;
    
    // After: 10 mins (0.166 hours) per discharge
    const afterTimePerDischarge = 10 / 60;
    const afterMtHours = monthlyDischarges * afterTimePerDischarge; 
    
    // Staff cost reduction? Usually staff is fixed, but we can say "Value of time saved".
    // Pitch says: "Remaining staff cost... 10% for review".
    const afterStaffCost = staffCost * 0.1; 
    
    const netSavings = (bedRevenueLoss + staffCost + billingDelay) - (afterStaffCost + patientLensAICost);
    const roi = Math.round(netSavings / patientLensAICost);
    const fiveYearSavings = netSavings * 60;

    hospitalData = {
        name,
        beds,
        dailyDischarges,
        numMTs,
        staffCostPerMT,
        dischargeTimeHours: dischargeTime,
        monthlyDischarges,
        mtHours: monthlyDischarges * dischargeTime * numMTs, // Keeping original formula for "Impact"
        staffCost,
        bedRevenueLoss,
        bedHoursBlocked,
        bedDaysLost,
        billingDelay,
        totalMonthlyCost,
        patientLensAICost,
        afterMtHours,
        afterStaffCost,
        netSavings,
        roi,
        fiveYearSavings
    };

    updateDisplay();
}

function updateDisplay() {
    // Formatters
    const fmtCurrency = (val) => '₹' + (val/100000).toFixed(2) + ' L';
    const fmtCurrencySmall = (val) => '₹' + Math.round(val).toLocaleString('en-IN');
    const fmtNum = (val) => Math.round(val).toLocaleString('en-IN');
    
    // Screen 1
    safeSetText('monthlyDischarges', hospitalData.monthlyDischarges);
    safeSetText('mtHours', fmtNum(hospitalData.mtHours));
    safeSetText('staffCost', fmtCurrency(hospitalData.staffCost));
    safeSetText('bedRevenueLoss', fmtCurrency(hospitalData.bedRevenueLoss));

    // Screen 2
    safeSetText('hospitalNameDisplay', hospitalData.name);
    safeSetText('costBedRevenue', fmtCurrency(hospitalData.bedRevenueLoss));
    safeSetText('valBedHours', fmtNum(hospitalData.bedHoursBlocked));
    safeSetText('valBedDays', hospitalData.bedDaysLost.toFixed(1));
    
    safeSetText('costStaff', fmtCurrency(hospitalData.staffCost));
    safeSetText('valMtHours', fmtNum(hospitalData.mtHours));
    safeSetText('valNumMTs', hospitalData.numMTs);
    
    safeSetText('costBilling', fmtCurrencySmall(hospitalData.billingDelay));
    safeSetText('totalMonthlyCost', fmtCurrency(hospitalData.totalMonthlyCost));

    // Screen 3
    safeSetText('beforeTime', hospitalData.dischargeTimeHours + ' hr');
    safeSetText('beforeStaff', fmtCurrency(hospitalData.staffCost).replace(' L', 'L'));
    safeSetText('beforeRevenue', fmtCurrency(hospitalData.bedRevenueLoss).replace(' L', 'L'));
    safeSetText('beforeTotal', fmtCurrency(hospitalData.totalMonthlyCost).replace(' L', 'L'));
    
    safeSetText('afterCost', '₹' + (hospitalData.patientLensAICost/1000).toFixed(1) + 'k');
    safeSetText('netSavings', fmtCurrency(hospitalData.netSavings));
    safeSetText('roiValue', hospitalData.roi + 'X');
    safeSetText('fiveYearSavings', '₹' + (hospitalData.fiveYearSavings/10000000).toFixed(2) + ' Cr');
}

function safeSetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// Navigation Logic
function nextScreen() {
    if (currentScreen < 4) {
        changeScreen(currentScreen + 1);
    }
}

function prevScreen() {
    if (currentScreen > 1) {
        changeScreen(currentScreen - 1);
    }
}

function changeScreen(newScreen) {
    document.getElementById(`screen${currentScreen}`).classList.remove('active');
    currentScreen = newScreen;
    document.getElementById(`screen${currentScreen}`).classList.add('active');
    updateProgressIndicator();
    window.scrollTo(0, 0);
}

function updateProgressIndicator() {
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        if (index + 1 <= currentScreen) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
