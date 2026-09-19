let currentUserEmail = "";

const loginScreen = document.getElementById('loginScreen');
const paywallScreen = document.getElementById('paywallScreen');
const mainApp = document.getElementById('mainApp');

function handleLogin() {
    const emailInput = document.getElementById('userEmail').value.trim().toLowerCase();
    
    // NEW: Standard Regex to validate ANY proper email format (e.g., name@domain.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if(!emailInput || !emailRegex.test(emailInput)) {
        alert("Please enter a valid email address.");
        return;
    }
    
    currentUserEmail = emailInput;
    checkAccess();
}

function checkAccess() {
    loginScreen.classList.add('hidden');
    const hasPaid = localStorage.getItem(`premium_${currentUserEmail}`);
    
    if (hasPaid === 'true') {
        mainApp.classList.remove('hidden');
        mainApp.classList.add('animate-slide-up');
    } else {
        paywallScreen.classList.remove('hidden');
        paywallScreen.classList.add('animate-slide-up');
        generateAdminQR();
    }
}

function generateAdminQR() {
    const adminUpi = "7357231104@ptsbi";
    const adminName = "Admin";
    const amount = 10;
    const upiString = `upi://pay?pa=${adminUpi}&pn=${adminName}&am=${amount}&cu=INR`;
    
    const qrContainer = document.getElementById('adminQrCode');
    qrContainer.innerHTML = ""; 
    
    new QRCode(qrContainer, {
        text: upiString, width: 160, height: 160,
        colorDark : "#0f172a", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
    });
}

function verifyPayment() {
    const codeInput = document.getElementById('activationCode').value.trim().toUpperCase();
    const MASTER_SECRET_CODE = "PRO2026"; 

    if (codeInput === MASTER_SECRET_CODE) {
        localStorage.setItem(`premium_${currentUserEmail}`, 'true');
        paywallScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        mainApp.classList.add('animate-slide-up');
    } else {
        alert("❌ Invalid Activation Code! Please pay ₹10 and send the screenshot on WhatsApp to get your code.");
    }
}

function logout() {
    currentUserEmail = "";
    document.getElementById('userEmail').value = "";
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

// ==========================================
// MAIN APP LOGIC (QR SPLITTER)
// ==========================================
function processPayment() {
    const upiId = document.getElementById('upiId').value;
    const payeeName = document.getElementById('payeeName').value;
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const btnText = document.getElementById('btnText');
    const generateBtn = document.getElementById('generateBtn');
    
    if (!upiId || !payeeName || isNaN(totalAmount) || totalAmount <= 0) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    btnText.innerText = "Processing...";
    generateBtn.style.opacity = "0.7";
    generateBtn.style.pointerEvents = "none";

    setTimeout(() => {
        const maxLimit = 1999;
        let chunks = [];
        let remaining = totalAmount;

        while (remaining > 0) {
            if (remaining > maxLimit) {
                chunks.push(maxLimit); remaining -= maxLimit;
            } else {
                chunks.push(remaining); remaining = 0;
            }
        }
        renderResults(chunks, upiId, payeeName, totalAmount);

        btnText.innerHTML = "Generate Magic QRs &rarr;";
        generateBtn.style.opacity = "1";
        generateBtn.style.pointerEvents = "auto";
    }, 500);
}

function renderResults(chunks, upiId, payeeName, totalAmount) {
    const resultsArea = document.getElementById('resultsArea');
    let htmlContent = `
        <div class="glass-card rounded-3xl p-8 shadow-xl animate-slide-up">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
                <div class="no-select">
                    <h2 class="text-3xl font-bold text-slate-800">₹${totalAmount.toLocaleString('en-IN')}</h2>
                    <p class="text-slate-500 text-sm flex items-center gap-1.5 mt-1">✅ Successfully split into ${chunks.length} parts</p>
                </div>
                <button onclick="window.print()" class="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    🖨️ Print All QRs
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="qr-grid"></div>
        </div>`;
    
    resultsArea.innerHTML = htmlContent;
    const qrGrid = document.getElementById('qr-grid');

    chunks.forEach((chunkAmount, index) => {
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${chunkAmount}&cu=INR`;
        const qrCard = document.createElement('div');
        qrCard.className = "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm";
        qrCard.innerHTML = `
            <div class="flex justify-between items-center w-full mb-4 no-select">
                <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md">Part ${index + 1}/${chunks.length}</span>
                <span class="text-lg font-extrabold text-slate-800">₹${chunkAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-center mb-5">
                <div class="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm" id="qr-canvas-${index}"></div>
            </div>
            <div class="text-center mb-1 no-select">
                <p class="text-sm font-semibold text-slate-800 truncate px-2">${payeeName}</p>
                <p class="text-xs text-slate-400 truncate px-2">${upiId}</p>
            </div>`;
        qrGrid.appendChild(qrCard);
        new QRCode(document.getElementById(`qr-canvas-${index}`), { text: upiString, width: 160, height: 160, colorDark : "#0f172a", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H });
    });
}
