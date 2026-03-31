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
                        <button onclick="viewDetails('${doc.id}')">View</button>
                        <button onclick="deletePurchase('${doc.id}')">Delete</button>
                    </td>
                `;

                tbody.appendChild(row);

            });

        });
}


// ✅ VIEW DETAILS
window.viewDetails = function(id) {

    db.collection('purchase_entries_2627').doc(id).get().then(doc => {

        const data = doc.data();

        let itemsHTML = "";

        data.items.forEach(item => {
            itemsHTML += `
                <li>
                    Qty: ${item.quantity}, 
                    Rate: ${item.rate}, 
                    Amount: ${item.amount}
                </li>
            `;
        });

        // MAIN DETAILS
        document.getElementById('purchaseDetails').innerHTML = `
            <h3>Purchase Details</h3>

            <p><b>Invoice Number:</b> ${data.invoiceNumber}</p>
            <p><b>Invoice Date:</b> ${data.invoiceDate}</p>
            <p><b>Vendor Name:</b> ${data.vendorName}</p>
            <p><b>Vendor GST:</b> ${data.vendorGST}</p>
            <p><b>Type:</b> ${data.type}</p>

            <h4>Items:</h4>
            <ul>${itemsHTML}</ul>

            <p><b>Total Quantity:</b> ${data.totalQuantity}</p>
            <p><b>Taxable Value:</b> ${data.taxableValue}</p>
            <p><b>CGST:</b> ${data.cgstValue}</p>
            <p><b>SGST:</b> ${data.sgstValue}</p>
            <p><b>IGST:</b> ${data.igstValue}</p>
            <p><b>Invoice Value:</b> ${data.invoiceValue}</p>
        `;

        // FILE PREVIEW + DOWNLOAD
        const fileURL = data.invoiceFileURL;
        const container = document.getElementById('filePreviewContainer');
        const downloadBtn = document.getElementById('downloadBtn');

        container.innerHTML = "";

        if (!fileURL) {

            container.innerHTML = "<p>No file uploaded</p>";
            downloadBtn.style.display = "none";

        } else {

            // PDF
            if (fileURL.toLowerCase().includes(".pdf")) {

                container.innerHTML = `
                    <iframe src="${fileURL}" width="100%" height="500px"></iframe>
                `;

            } 
            // IMAGE
            else {

                container.innerHTML = `
                    <img src="${fileURL}" style="max-width:100%; height:auto; border:1px solid #ccc;">
                `;
            }

            // DOWNLOAD BUTTON
            downloadBtn.style.display = "inline-block";

            downloadBtn.onclick = function () {
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = '';
                link.click();
            };
        }

        // OPEN MODAL
        document.getElementById('purchaseModal').style.display = 'block';

    });

}


// CLOSE MODAL
window.closeModal = function() {
    document.getElementById('purchaseModal').style.display = 'none';
}


// ✅ DELETE
window.deletePurchase = function(id) {

    const password = prompt("Enter password to delete:");

    if (password !== "1234") {
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