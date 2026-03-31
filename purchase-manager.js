// 🔥 FIREBASE INIT
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
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