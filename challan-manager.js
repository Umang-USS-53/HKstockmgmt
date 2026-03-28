// challan-manager.js

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
const challansTable = document.getElementById('challansTable').getElementsByTagName('tbody')[0];

function displayChallans() {
    challansTable.innerHTML = ''; // Clear existing rows
    db.collection('challans').orderBy('createdAt', 'desc').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const challan = doc.data();

            const date = new Date(challan.challanDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            const row = challansTable.insertRow();
            row.insertCell(0).textContent = challan.challanNumber;
            row.insertCell(1).textContent = formattedDate;
            row.insertCell(2).textContent = challan.buyerName;
            row.insertCell(3).textContent = challan.totalQuantity;
            row.insertCell(4).innerHTML = `
                <button onclick="viewChallanDetails('${doc.id}')">View Details</button>
                <button onclick="deleteChallan('${doc.id}', '${challan.challanNumber}')">Delete</button>
            `;
        });
    });
}

function deleteChallan(challanId, challanNumber) {
    const confirmation = confirm(`Are you sure you want to delete challan ${challanNumber}?`);
    if (confirmation) {
        const password = prompt('Enter password to delete challan:');
        if (password === 'hkdelete') {
            db.collection('challans').doc(challanId).delete().then(() => {
                alert('Challan deleted successfully.');
                displayChallans(); // Refresh the list
            }).catch((error) => {
                console.error('Error deleting challan:', error);
                alert('Failed to delete challan.');
            });
        } else {
            alert('Incorrect password.');
        }
    }
}

function viewChallanDetails(challanId) {
    db.collection('challans').doc(challanId).get().then((doc) => {
        if (doc.exists) {
            const challan = doc.data();
            displayDetailedChallan(challan);
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.error('Error getting document:', error);
    });
}

function displayDetailedChallan(challan) {
    const modal = document.getElementById('challanDetailsModal');
    const modalContent = document.getElementById('challanDetailsContent');
    const closeBtn = document.querySelector('.close');

    const date = new Date(challan.challanDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    let itemsHTML = '<ul>';
    challan.items.forEach(item => {
        itemsHTML += `
            <li>
                <strong>Lot No.:</strong> ${item.lotNo},
                <strong>Description:</strong> ${item.description},
                <strong>HSN/SAC:</strong> ${item.hsnCode},
                <strong>Unit:</strong> ${item.unit},
                <strong>Quantity:</strong> ${item.quantity},
                <strong>Rate:</strong> ${item.rate},
                <strong>Amount:</strong> ${item.amount},
                <strong>CGST Rate:</strong> ${item.cgstRate},
                <strong>SGST Rate:</strong> ${item.sgstRate},
                <strong>IGST Rate:</strong> ${item.igstRate}
            </li>
        `;
    });
    itemsHTML += '</ul>';

    modalContent.innerHTML = `
        <h2>Challan Details</h2>
        <p><strong>Challan Number:</strong> ${challan.challanNumber}</p>
        <p><strong>Challan Date:</strong> ${formattedDate}</p>
        <p><strong>Consignee Name:</strong> ${challan.buyerName}</p>
        <p><strong>Consignee GST:</strong> ${challan.buyerGST}</p>
        <p><strong>Place of Destination:</strong> ${challan.placeOfDestination}</p>
        <p><strong>Mode of Delivery:</strong> ${challan.modeOfDelivery}</p>
        <p><strong>Details of Transporter:</strong> ${challan.detailsOfTransporter}</p>
        <p><strong>Purpose of Movement:</strong> ${challan.purposeOfMovement}</p>
        <h3>Items:</h3>
        ${itemsHTML}
        <p><strong>Total Quantity:</strong> ${challan.totalQuantity}</p>
        <p><strong>Taxable Value:</strong> ${challan.taxableValue}</p>
        <p><strong>CGST Value:</strong> ${challan.cgstValue}</p>
        <p><strong>SGST Value:</strong> ${challan.sgstValue}</p>
        <p><strong>IGST Value:</strong> ${challan.igstValue}</p>
        <p><strong>Invoice Value:</strong> ${challan.invoiceValue}</p>
        <p><strong>Amount in Words:</strong> ${challan.amountInWords}</p>
        <h3>Terms and Conditions:</h3>
        <div>
            <p>1 The goods delivered to you to the person signing undermeath is authorized by to sell goods for and on behalf of the Firm.</p>
            <p>2 The goods have been entrusted for the purpose of approval</p>
            <p>3 No E-way Bill is required to be generated as the Goods covered under this Invoice are exempted as per Serial No 4/5, refer to the annexure to Rule 138(14) of the CGST Rules, 2017.</p>
            <p>4 Goods are for approval basis and Tax invoice would be prepared in accordance with the GST act and rules.</p>
            <p>5 All disputes are subject to Mumbai Jurisdiction only.</p>
            <p>6 E&OE</p>
        </div>
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

function exportToCSV() {
    db.collection('challans').get().then((querySnapshot) => {
        let csvContent = "Challan Number,Challan Date,Consignee Name,Consignee GST,Place of Destination,Mode of Delivery,Transporter Details,Purpose of Movement,Total Quantity,Taxable Value,CGST Value,SGST Value,IGST Value,Invoice Value,Amount in Words,Lot No,Description,HSN Code,Unit,Quantity,Rate,Amount,CGST Rate (%),SGST Rate (%),IGST Rate (%)\n"; // Corrected Header Row

        querySnapshot.forEach((doc) => {
            const challan = doc.data();
            const formattedDate = new Date(challan.challanDate).toLocaleDateString('en-IN');

            challan.items.forEach(item => {
                csvContent += `${challan.challanNumber},"${formattedDate}",${challan.buyerName},${challan.buyerGST},${challan.placeOfDestination},${challan.modeOfDelivery},${challan.detailsOfTransporter},${challan.purposeOfMovement},${challan.totalQuantity},${challan.taxableValue},${challan.cgstValue},${challan.sgstValue},${challan.igstValue},${challan.invoiceValue},"${challan.amountInWords}",${item.lotNo},"${item.description}",${item.hsnCode},${item.unit},${item.quantity},${item.rate},${item.amount},${item.cgstRate},${item.sgstRate},${item.igstRate}\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `challans_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

displayChallans();
