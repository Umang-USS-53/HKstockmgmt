// Initialize Firebase

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


// ✅ MAIN FUNCTION
async function calculateStock() {

    let regularQty = 0;
    let regularValue = 0;
    let lotQueue = [];

    // ---------------- OPENING STOCK ----------------

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

    // ---------------- PURCHASES ----------------

    let transactions = [];

    const purchaseSnap = await db.collection('purchase_entries_2627').get();

    purchaseSnap.forEach(doc => {

        const data = doc.data();

        transactions.push({
            type: "purchase",
            mode: data.type,
            date: data.invoiceDate,
            items: data.items
        });
    });

    // ---------------- SALES ----------------

    const salesSnap = await db.collection('invoices_2627').get();

    salesSnap.forEach(doc => {

        const data = doc.data();

        transactions.push({
            type: "sale",
            mode: data.type,
            date: data.invoiceDate,
            items: data.items
        });
    });

    // ---------------- SORT ----------------

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ---------------- PROCESS ----------------

    transactions.forEach(tx => {

        tx.items.forEach(item => {

            if (item.description !== "Cut and Polished Diamonds") return;

            const qty = parseFloat(item.quantity);
            const rate = parseFloat(item.rate);

            // PURCHASE
            if (tx.type === "purchase") {

                if (tx.mode === "regular") {
                    regularQty += qty;
                    regularValue += (qty * rate);
                }

                if (tx.mode === "lot") {
                    lotQueue.push({ qty: qty, rate: rate });
                }
            }

            // SALE
            if (tx.type === "sale") {

                if (tx.mode === "regular") {

                    const avg = regularQty ? (regularValue / regularQty) : 0;

                    regularQty -= qty;
                    regularValue -= (qty * avg);
                }

                if (tx.mode === "lot") {

                    let remaining = qty;

                    for (let i = 0; i < lotQueue.length; i++) {

                        if (remaining <= 0) break;

                        if (lotQueue[i].qty >= remaining) {

                            lotQueue[i].qty -= remaining;
                            remaining = 0;

                        } else {

                            remaining -= lotQueue[i].qty;
                            lotQueue[i].qty = 0;
                        }
                    }
                }
            }

        });

    });

    // ---------------- CLEAN ----------------

    lotQueue = lotQueue.filter(lot => lot.qty > 0);

    // ---------------- DISPLAY ----------------

    const avg = regularQty ? (regularValue / regularQty) : 0;

    document.getElementById('regularQty').textContent = regularQty.toFixed(2);
    document.getElementById('regularValue').textContent = regularValue.toFixed(2);
    document.getElementById('regularAvg').textContent = avg.toFixed(2);

    const tbody = document.getElementById('lotTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    let totalQty = 0;
    let totalValue = 0;

    lotQueue.forEach(lot => {

        const value = lot.qty * lot.rate;

        totalQty += lot.qty;
        totalValue += value;

        const row = tbody.insertRow();

        row.insertCell(0).textContent = lot.qty.toFixed(2);
        row.insertCell(1).textContent = lot.rate.toFixed(2);
        row.insertCell(2).textContent = value.toFixed(2);
    });

    document.getElementById('lotTotalQty').textContent = totalQty.toFixed(2);
    document.getElementById('lotTotalValue').textContent = totalValue.toFixed(2);
}