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


// ✅ LOAD PURCHASES
function loadPurchases() {

    const tbody = document.querySelector('#purchaseTable tbody');
    tbody.innerHTML = "";

    db.collection('purchase_entries_2627')
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {

            snapshot.forEach(doc => {

                const data = doc.data();

                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.invoiceNumber}</td>
                    <td>${data.invoiceDate}</td>
                    <td>${data.vendorName}</td>
                    <td>${data.type}</td>
                    <td>${data.invoiceValue}</td>
                    <td>
                        <button onclick="deletePurchase('${doc.id}')">Delete</button>
                    </td>
                `;

                tbody.appendChild(row);

            });

        });
}


// ✅ DELETE (WITH PASSWORD)
function deletePurchase(id) {

    const password = prompt("Enter password to delete:");

    if (password !== "hkdelete") {
        alert("Incorrect password");
        return;
    }

    db.collection('purchase_entries_2627').doc(id).delete()
        .then(() => {
            alert("Deleted");
            loadPurchases();
        });

}


// ✅ LOAD ON START
loadPurchases();