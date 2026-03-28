// csv-export.js

function exportToCSV() {
    console.log("exportToCSV() called");
    db.collection('invoices').get().then((querySnapshot) => {
        const csvData = []; // Declare csvData here
        const header = [
            'Invoice Number', 'Invoice Date', 'Buyer Name', 'Buyer GST', 'Terms of Payment',
            'Lot No.', 'Description', 'HSN Code', 'Unit', 'Quantity', 'Rate', 'Amount',
            'CGST Rate', 'SGST Rate', 'IGST Rate', 'Total Quantity', 'Taxable Value',
            'CGST Value', 'SGST Value', 'IGST Value', 'Invoice Value', 'Amount in Words'
        ];
        csvData.push(header.join(','));

        const invoices = {};

        querySnapshot.forEach((doc) => {
            const invoice = doc.data();
            if (!invoices[invoice.invoiceNumber]) {
                invoices[invoice.invoiceNumber] = {
                    items: [],
                    invoiceNumber: invoice.invoiceNumber,
                    invoiceDate: invoice.invoiceDate,
                    buyerName: invoice.buyerName,
                    buyerGST: invoice.buyerGST,
                    termsOfPayment: invoice.termsOfPayment,
                    totalQuantity: invoice.totalQuantity,
                    taxableValue: invoice.taxableValue,
                    cgstValue: invoice.cgstValue,
                    sgstValue: invoice.sgstValue,
                    igstValue: invoice.igstValue,
                    invoiceValue: invoice.invoiceValue,
                    amountInWords: invoice.amountInWords
                };
            }
            invoice.items.forEach((item) => {
                invoices[invoice.invoiceNumber].items.push(item);
            });
        });

        for (const invoiceNumber in invoices) {
            const invoice = invoices[invoiceNumber];
            const items = invoice.items;

            items.forEach((item, index) => {
                const row = [
                    index === items.length - 1 ? invoice.invoiceNumber : '',
                    index === items.length - 1 ? invoice.invoiceDate : '',
                    index === items.length - 1 ? invoice.buyerName : '',
                    index === items.length - 1 ? invoice.buyerGST : '',
                    index === items.length - 1 ? invoice.termsOfPayment : '',
                    item.lotNo, item.description, item.hsnCode, item.unit, item.quantity, item.rate, item.amount,
                    item.cgstRate, item.sgstRate, item.igstRate,
                    index === items.length - 1 ? invoice.totalQuantity : '',
                    index === items.length - 1 ? invoice.taxableValue : '',
                    index === items.length - 1 ? invoice.cgstValue : '',
                    index === items.length - 1 ? invoice.sgstValue : '',
                    index === items.length - 1 ? invoice.igstValue : '',
                    index === items.length - 1 ? invoice.invoiceValue : '',
                    index === items.length - 1 ? invoice.amountInWords : ''
                ];
                csvData.push(row.join(','));
            });
        }

        const csvString = csvData.join('\n');
        downloadCSV(csvString);
    });
}

function downloadCSV(csvString) {
    console.log("downloadCSV() called");
    const filename = 'invoices.csv';
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
