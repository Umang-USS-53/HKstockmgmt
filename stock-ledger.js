/ Initialize Firebase

const firebaseConfig = {

    apiKey: "AIzaSyDCk3zgMLzuXZM79F5QhbG9spZ5p_Tq7Gg",

    authDomain: "hk-invoice-new.firebaseapp.com",

    projectId: "hk-invoice-new",

    storageBucket: "hk-invoice-new.firebasestorage.app",

    messagingSenderId: "433334964621",

    appId: "1:433334964621:web:d4c679cf4a3193457a6dc4"

};


let firebaseInitialized = false; // Add this line


firebase.initializeApp(firebaseConfig);

if (!firebaseInitialized) { // Add this check

    console.log("Firebase initialized");

    firebaseInitialized = true;

}

const db = firebase.firestore();


// MAIN FUNCTION
async function generateLedger() {

    let regularQty = 0;
    let regularValue = 0;
    let lotQueue = [];

    let regularLedger = [];
    let lotLedger = [];

    // ===== OPENING =====

    const openingDoc = await db.collection('opening_stock_2627').doc('main').get();

    if (openingDoc.exists) {

        const opening = openingDoc.data();

        regularQty = parseFloat(opening.regularQty || 0);
        regularValue = parseFloat(opening.regularValue || 0);

        if (opening.lotItems) {
            opening.lotItems.forEach(lot => {
                lotQueue.push({
                    qty: parseFloat(lot.qty),
                    rate: parseFloat(lot.rate)
                });
            });
        }
    }

    // ===== FETCH DATA =====

    let transactions = [];

    const purchaseSnap = await db.collection('purchase_entries_2627').get();

    purchaseSnap.forEach(doc => {
        const data = doc.data();

        transactions.push({
            type: "purchase",
            mode: data.type,
            date: data.invoiceDate,
            invoice: data.invoiceNumber,
            items: data.items
        });
    });

    const salesSnap = await db.collection('invoices_2627').get();

    salesSnap.forEach(doc => {
        const data = doc.data();

        transactions.push({
            type: "sale",
            mode: data.type,
            date: data.invoiceDate,
            invoice: data.invoiceNumber,
            items: data.items
        });
    });

    // ===== SORT =====

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ===== PROCESS =====

    transactions.forEach(tx => {

        tx.items.forEach(item => {

            if (item.description !== "Cut and Polished Diamonds") return;

            const qty = parseFloat(item.quantity);
            const rate = parseFloat(item.rate);

            // ===== REGULAR =====

            if (tx.mode === "regular") {

                if (tx.type === "purchase") {

                    regularQty += qty;
                    regularValue += qty * rate;

                    regularLedger.push({
                        date: tx.date,
                        type: "Purchase",
                        invoice: tx.invoice,
                        qtyIn: qty,
                        qtyOut: 0,
                        rate: rate,
                        value: qty * rate,
                        balanceQty: regularQty,
                        balanceValue: regularValue
                    });
                }

                if (tx.type === "sale") {

                    const avg = regularQty ? (regularValue / regularQty) : 0;

                    regularQty -= qty;
                    regularValue -= qty * avg;

                    regularLedger.push({
                        date: tx.date,
                        type: "Sale",
                        invoice: tx.invoice,
                        qtyIn: 0,
                        qtyOut: qty,
                        rate: avg,
                        value: qty * avg,
                        balanceQty: regularQty,
                        balanceValue: regularValue
                    });
                }
            }

            // ===== LOT =====

            if (tx.mode === "lot") {

                if (tx.type === "purchase") {

                    lotQueue.push({ qty, rate });

                    lotLedger.push({
                        date: tx.date,
                        type: "Purchase",
                        invoice: tx.invoice,
                        qtyIn: qty,
                        qtyOut: 0,
                        rate: rate,
                        lots: JSON.parse(JSON.stringify(lotQueue))
                    });
                }

                if (tx.type === "sale") {

                    let remaining = qty;
                    let issuedLots = [];

                    for (let i = 0; i < lotQueue.length; i++) {

                        if (remaining <= 0) break;

                        if (lotQueue[i].qty >= remaining) {

                            issuedLots.push({
                                qty: remaining,
                                rate: lotQueue[i].rate
                            });

                            lotQueue[i].qty -= remaining;
                            remaining = 0;

                        } else {

                            issuedLots.push({
                                qty: lotQueue[i].qty,
                                rate: lotQueue[i].rate
                            });

                            remaining -= lotQueue[i].qty;
                            lotQueue[i].qty = 0;
                        }
                    }

                    lotQueue = lotQueue.filter(l => l.qty > 0);

                    lotLedger.push({
                        date: tx.date,
                        type: "Sale",
                        invoice: tx.invoice,
                        qtyOut: qty,
                        issuedLots: issuedLots,
                        remainingLots: JSON.parse(JSON.stringify(lotQueue))
                    });
                }
            }

        });

    });

    // ===== DISPLAY REGULAR =====

    const regularBody = document.querySelector("#regularTable tbody");
    regularBody.innerHTML = "";

    regularLedger.forEach(r => {

        const row = regularBody.insertRow();

        row.insertCell(0).textContent = r.date;
        row.insertCell(1).textContent = r.type;
        row.insertCell(2).textContent = r.invoice;
        row.insertCell(3).textContent = r.qtyIn || "";
        row.insertCell(4).textContent = r.qtyOut || "";
        row.insertCell(5).textContent = r.rate?.toFixed(2) || "";
        row.insertCell(6).textContent = r.value?.toFixed(2) || "";
        row.insertCell(7).textContent = r.balanceQty?.toFixed(2) || "";
        row.insertCell(8).textContent = r.balanceValue?.toFixed(2) || "";
    });


    // ===== DISPLAY LOT =====

    const lotBody = document.querySelector("#lotTable tbody");
    lotBody.innerHTML = "";

    lotLedger.forEach(l => {

        const row = lotBody.insertRow();

        row.insertCell(0).textContent = l.date;
        row.insertCell(1).textContent = l.type;
        row.insertCell(2).textContent = l.invoice;
        row.insertCell(3).textContent = l.qtyIn || "";
        row.insertCell(4).textContent = l.qtyOut || "";

        let details = "";

        if (l.issuedLots) {
            details = l.issuedLots.map(x => `(${x.qty} @ ${x.rate})`).join(", ");
        }

        if (l.lots) {
            details = l.lots.map(x => `(${x.qty} @ ${x.rate})`).join(", ");
        }

        row.insertCell(5).textContent = details;
    });

}