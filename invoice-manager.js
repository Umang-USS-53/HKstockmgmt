// invoice-manager.js

// Initialize Firebase (if not already initialized)
const firebaseConfig = {
    apiKey: "AIzaSyDCk3zgMLzuXZM79F5QhbG9spZ5p_Tq7Gg",
    authDomain: "hk-invoice-new.firebaseapp.com",
    projectId: "hk-invoice-new",
    storageBucket: "hk-invoice-new.firebasestorage.app",
    messagingSenderId: "433334964621",
    appId: "1:433334964621:web:d4c679cf4a3193457a6dc4"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const invoicesTable = document.getElementById('invoicesTable').getElementsByTagName('tbody')[0];

function displayInvoices() {
    db.collection('invoices').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const invoice = doc.data();

            // Format invoiceDate to dd/mm/yyyy
            const date = new Date(invoice.invoiceDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            const row = invoicesTable.insertRow();
            row.insertCell(0).textContent = invoice.invoiceNumber;
            row.insertCell(1).textContent = formattedDate; // Use formatted date
            row.insertCell(2).textContent = invoice.buyerName;
            row.insertCell(3).textContent = invoice.invoiceValue;
            row.insertCell(4).innerHTML = '<button onclick="viewInvoiceDetails(\'' + doc.id + '\')">View Details</button>';
        });
    });
}

function viewInvoiceDetails(invoiceId) {
    db.collection('invoices').doc(invoiceId).get().then((doc) => {
        if (doc.exists) {
            const invoice = doc.data();
            displayDetailedInvoice(invoice);
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.error('Error getting document:', error);
    });
}

function displayInvoices() {
    db.collection('invoices').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const invoice = doc.data();

            // Format invoiceDate to dd/mm/yyyy
            const date = new Date(invoice.invoiceDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            const row = invoicesTable.insertRow();
            row.insertCell(0).textContent = invoice.invoiceNumber;
            row.insertCell(1).textContent = formattedDate; // Use formatted date
            row.insertCell(2).textContent = invoice.buyerName;
            row.insertCell(3).textContent = invoice.invoiceValue;
            row.insertCell(4).innerHTML = `
                <button onclick="viewInvoiceDetails('${doc.id}')">View Details</button>
                <button onclick="deleteInvoice('${doc.id}')">Delete Invoice</button>
            `;
        });
    });
}

function deleteInvoice(invoiceId) {
    db.collection('invoices').doc(invoiceId).get().then((doc) => {
        if (doc.exists) {
            const invoice = doc.data();
            const invoiceNumber = invoice.invoiceNumber;
            const confirmation = confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`);

            if (confirmation) {
                const password = prompt('Enter password to delete invoice:');
                if (password === 'hkdelete') {
                    db.collection('invoices').doc(invoiceId).delete().then(() => {
                        alert('Invoice deleted successfully.');
                        displayInvoices();
                    }).catch((error) => {
                        console.error('Error deleting invoice:', error);
                        alert('Failed to delete invoice.');
                    });
                } else {
                    alert('Incorrect password.');
                }
            }
        } else {
            alert('Invoice not found.');
        }
    }).catch((error) => {
        console.error("Error getting invoice data:", error);
    });
}

function viewInvoiceDetails(invoiceId) {
    db.collection('invoices').doc(invoiceId).get().then((doc) => {
        if (doc.exists) {
            const invoice = doc.data();
            displayDetailedInvoice(invoice);
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.error('Error getting document:', error);
    });
}

function displayDetailedInvoice(invoice) {
    const modal = document.getElementById('invoiceDetailsModal');
    const modalContent = document.getElementById('invoiceDetailsContent');
    const closeBtn = document.querySelector('.close');

    // Format invoiceDate to dd/mm/yyyy
    const date = new Date(invoice.invoiceDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    modalContent.innerHTML = `
        <h2>Invoice Details</h2>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Invoice Date:</strong> ${formattedDate}</p>
        <p><strong>Buyer Name:</strong> ${invoice.buyerName}</p>
        <p><strong>Buyer GST:</strong> ${invoice.buyerGST}</p>
        <p><strong>Terms of Payment:</strong> ${invoice.termsOfPayment}</p>
        <h3>Items:</h3>
        <ul>
            ${invoice.items.map(item => `
                <li>
                    <strong>Description:</strong> ${item.description},
                    <strong>Quantity:</strong> ${item.quantity},
                    <strong>Dia Quality:</strong> ${item.diaQuality || ''},
                    <strong>Sieve:</strong> ${item.sieve || ''},
                    <strong>Rate:</strong> ${item.rate},
                    <strong>Amount:</strong> ${item.amount}
                </li>
            `).join('')}
        </ul>
        <p><strong>Total Quantity:</strong> ${invoice.totalQuantity}</p>
        <p><strong>Taxable Value:</strong> ${invoice.taxableValue}</p>
        <p><strong>Invoice Value:</strong> ${invoice.invoiceValue}</p>
        <p><strong>Amount in Words:</strong> ${invoice.amountInWords}</p>
    `;

    modal.style.display = 'block';

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

displayInvoices();
