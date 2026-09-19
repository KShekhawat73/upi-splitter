function generateSplitQRs() {
    const upiId = document.getElementById('upiId').value;
    const payeeName = document.getElementById('payeeName').value;
    let totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const qrContainer = document.getElementById('qr-container');
    
    // Clear previous results
    qrContainer.innerHTML = '';

    if (!upiId || !payeeName || isNaN(totalAmount) || totalAmount <= 0) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const maxLimit = 1999;
    let chunks = [];

    // Splitting logic
    while (totalAmount > 0) {
        if (totalAmount > maxLimit) {
            chunks.push(maxLimit);
            totalAmount -= maxLimit;
        } else {
            chunks.push(totalAmount);
            totalAmount = 0;
        }
    }

    // Generate a QR code for each chunk
    chunks.forEach((amount, index) => {
        // Construct the standard UPI Deep Link
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

        // Create UI elements for the QR card
        const card = document.createElement('div');
        card.className = 'qr-card';
        
        const label = document.createElement('h3');
        label.innerText = `₹${amount}`;
        
        const note = document.createElement('p');
        note.innerText = `Payment ${index + 1} of ${chunks.length}`;
        note.style.fontSize = '12px';

        const qrDiv = document.createElement('div');
        
        // Append to card
        card.appendChild(note);
        card.appendChild(qrDiv);
        card.appendChild(label);
        qrContainer.appendChild(card);

        // Render the QR code inside the div
        new QRCode(qrDiv, {
            text: upiString,
            width: 150,
            height: 150,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    });
}
