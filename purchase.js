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


// ✅ ADD ITEM ROW
function addItem() {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="number" class="qty" step="0.01"></td>
        <td><input type="number" class="rate" step="0.01"></td>
        <td><input type="number" class="value" readonly></td>
        <td><button onclick="removeRow(this)">X</button></td>
    `;

    document.getElementById('itemsBody').appendChild(row);

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
}


// ✅ REMOVE ROW
function removeRow(btn) {
    btn.closest('tr').remove();
    calculateTotal();
}


// ✅ CALCULATE TOTAL
function calculateTotal() {
    let total = 0;

    document.querySelectorAll('#itemsBody tr').forEach(row => {
        let qty = parseFloat(row.querySelector('.qty').value) || 0;
        let rate = parseFloat(row.querySelector('.rate').value) || 0;

        let value = qty * rate;
        row.querySelector('.value').value = value.toFixed(2);

        total += value;
    });

    let cgst = parseFloat(document.getElementById('cgst').value) || 0;
    let sgst = parseFloat(document.getElementById('sgst').value) || 0;
    let igst = parseFloat(document.getElementById('igst').value) || 0;

    total += cgst + sgst + igst;

    document.getElementById('totalValue').innerText = total.toFixed(2);
}


// ✅ GST VALIDATION (STRICT)
function isValidGST(gst) {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
}


// ✅ TAX MUTUAL EXCLUSION
document.getElementById('igst').addEventListener('input', () => {
    if (document.getElementById('igst').value) {
        document.getElementById('cgst').value = '';
        document.getElementById('sgst').value = '';
    }
    calculateTotal();
});

document.getElementById('cgst').addEventListener('input', () => {
    document.getElementById('igst').value = '';
    calculateTotal();
});

document.getElementById('sgst').addEventListener('input', () => {
    document.getElementById('igst').value = '';
    calculateTotal();
});


// ✅ SAVE PURCHASE
function savePurchase() {

    const vendorName = document.getElementById('vendorName').value.trim();
    const vendorGST = document.getElementById('vendorGST').value.trim();
    const invoiceDate = document.getElementById('invoiceDate').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
    const type = document.getElementById('purchaseType').value;

    // 🔒 VALIDATION
    if (!vendorName || !vendorGST || !invoiceDate || !invoiceNumber || !type) {
        alert("All fields compulsory");
        return;
    }

    if (!isValidGST(vendorGST)) {
        alert("Invalid GST Number");
        return;
    }

    let items = [];
    let totalQty = 0;
    let taxableValue = 0;

    let rows = document.querySelectorAll('#itemsBody tr');

    if (rows.length === 0) {
        alert("Add at least one item");
        return;
    }

    try {

        rows.forEach((row, index) => {
            let qty = parseFloat(row.querySelector('.qty').value);
            let rate = parseFloat(row.querySelector('.rate').value);
            let value = parseFloat(row.querySelector('.value').value);

            if (!qty || !rate) {
                throw new Error("Invalid item values");
            }

            items.push({
                quantity: qty.toString(),
                rate: rate.toString(),
                amount: value.toFixed(2),
                lotNo: (index + 1).toString(),
                unit: "CTS",
                description: "Cut and Polished Diamonds",
                hsnCode: "71023910"
            });

            totalQty += qty;
            taxableValue += value;
        });

    } catch (err) {
        alert(err.message);
        return;
    }

    const cgst = document.getElementById('cgst').value || "0.00";
    const sgst = document.getElementById('sgst').value || "0.00";
    const igst = document.getElementById('igst').value || "0.00";

    const totalValue = parseFloat(document.getElementById('totalValue').innerText);

    const file = document.getElementById('invoiceFile').files[0];

    if (!file) {
        alert("Invoice file is compulsory");
        return;
    }

    // 🔥 TEMP (Cloudinary later)
    const fileURL = "";

    // ✅ UNIQUE DOC ID (Vendor + Invoice)
    const docId = vendorGST + "_" + invoiceNumber;

    // 🔒 DUPLICATE CHECK
    db.collection('purchase_entries_2627').doc(docId).get().then(doc => {

        if (doc.exists) {
            alert("This invoice already exists for this vendor");
            return;
        }

        db.collection('purchase_entries_2627').doc(docId).set({
            vendorName,
            vendorGST,
            invoiceDate,
            invoiceNumber,
            type,
            items,
            totalQuantity: totalQty.toString(),
            taxableValue: taxableValue.toFixed(2),
            cgstValue: cgst,
            sgstValue: sgst,
            igstValue: igst,
            invoiceValue: totalValue.toFixed(2),
            invoiceFileURL: fileURL,
            amountInWords: "",
            createdAt: new Date()
        })
        .then(() => {
            alert("Purchase Saved Successfully");
            location.reload();
        });

    });

}