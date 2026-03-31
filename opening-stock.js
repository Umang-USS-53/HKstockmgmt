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


// ADD LOT ROW
function addLotRow(qty = "", rate = "") {

    const table = document.getElementById('lotTable').getElementsByTagName('tbody')[0];

    const row = table.insertRow();

    row.innerHTML = `
        <td><input type="number" step="0.01" value="${qty}"></td>
        <td><input type="number" step="0.01" value="${rate}"></td>
        <td><button onclick="this.parentElement.parentElement.remove()">Delete</button></td>
    `;
}


// SAVE
function saveOpeningStock() {

    const regularQty = document.getElementById('regularQty').value || "0";
    const regularValue = document.getElementById('regularValue').value || "0";

    const rows = document.getElementById('lotTable').getElementsByTagName('tbody')[0].rows;

    let lotItems = [];

    for (let i = 0; i < rows.length; i++) {

        const qty = rows[i].cells[0].children[0].value;
        const rate = rows[i].cells[1].children[0].value;

        if (qty && rate) {
            lotItems.push({
                qty: qty,
                rate: rate
            });
        }
    }

    db.collection('opening_stock_2627').doc('main').set({
        type: "opening",
        regularQty: regularQty,
        regularValue: regularValue,
        lotItems: lotItems,
        createdAt: new Date()
    })
    .then(() => {
        alert("Saved successfully");
    })
    .catch((error) => {
        console.error(error);
        alert("Error saving");
    });
}


// LOAD EXISTING
window.onload = function () {

    db.collection('opening_stock_2627').doc('main').get().then(doc => {

        if (doc.exists) {

            const data = doc.data();

            document.getElementById('regularQty').value = data.regularQty || "";
            document.getElementById('regularValue').value = data.regularValue || "";

            if (data.lotItems && data.lotItems.length > 0) {

                data.lotItems.forEach(lot => {
                    addLotRow(lot.qty, lot.rate);
                });

            } else {
                addLotRow();
            }

        } else {
            addLotRow();
        }
    });
}