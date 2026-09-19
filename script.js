function processPayment() {
    const upiId = document.getElementById('upiId').value;
    const payeeName = document.getElementById('payeeName').value;
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const note = document.getElementById('note').value;
    const btnText = document.getElementById('btnText');
    const generateBtn = document.getElementById('generateBtn');
    
    if (!upiId || !payeeName || isNaN(totalAmount) || totalAmount <= 0) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    // Button Animation
    btnText.innerText = "Processing...";
    generateBtn.style.opacity = "0.7";
    generateBtn.style.pointerEvents = "none";

    // 0.5 second delay for smooth effect
    setTimeout(() => {
        const maxLimit = 1999;
        let chunks = [];
        let remaining = totalAmount;

        // Splitting Mathematics
        while (remaining > 0) {
            if (remaining > maxLimit) {
                chunks.push(maxLimit);
                remaining -= maxLimit;
            } else {
                chunks.push(remaining);
                remaining = 0;
            }
        }

        renderResults(chunks, upiId, payeeName, note, totalAmount);

        // Reset Button
        btnText.innerHTML = "Generate Magic QRs &rarr;";
        generateBtn.style.opacity = "1";
        generateBtn.style.pointerEvents = "auto";
    }, 500);
}

function renderResults(chunks, upiId, payeeName, note, totalAmount) {
    const resultsArea = document.getElementById('resultsArea');
    
    // Inject the Right Side UI block
    let htmlContent = `
        <div class="glass-card rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">₹${totalAmount.toLocaleString('en-IN')}</h2>
                    <p class="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                        ✅ Successfully split into ${chunks.length} parts
                    </p>
                </div>
                <button onclick="window.print()" class="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                    🖨️ Print QRs
                </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="qr-grid">
                <!-- QRs will generate here automatically -->
            </div>
        </div>
    `;
    
    resultsArea.innerHTML = htmlContent;
    const qrGrid = document.getElementById('qr-grid');

    // Create cards for each chunk
    chunks.forEach((chunkAmount, index) => {
        let noteParam = note ? `&tn=${encodeURIComponent(note)}` : '';
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${chunkAmount}&cu=INR${noteParam}`;
        
        const qrCard = document.createElement('div');
        qrCard.className = "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 group relative overflow-hidden";
        
        qrCard.innerHTML = `
            <div class="flex justify-between items-center w-full mb-4">
                <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md">Part ${index + 1}/${chunks.length}</span>
                <span class="text-lg font-extrabold text-slate-800">₹${chunkAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-center mb-5">
                <div class="p-3 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:scale-105 transition-transform duration-500" id="qr-canvas-${index}">
                </div>
            </div>
            <div class="text-center mb-1">
                <p class="text-sm font-semibold text-slate-800 truncate px-2">${payeeName}</p>
                <p class="text-xs text-slate-400 truncate px-2">${upiId}</p>
            </div>
        `;
        
        qrGrid.appendChild(qrCard);

        // Draw QR logic
        new QRCode(document.getElementById(`qr-canvas-${index}`), {
            text: upiString,
            width: 150,
            height: 150,
            colorDark : "#0f172a",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    });
}
