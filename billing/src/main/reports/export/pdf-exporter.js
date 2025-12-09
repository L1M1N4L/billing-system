const PDFDocument = require('pdfkit');
const { app, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

async function exportReport(type, data) {
    // Save dialog
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save Report',
        defaultPath: path.join(app.getPath('documents'), `Report_${Date.now()}.pdf`),
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (!filePath) return null;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // Simple text dump for now, proper table later
        if (type === 'detail') {
            doc.text('Date       Time       Ext   Dialed          Duration   Cost');
            doc.moveDown(0.5);
            data.rows.forEach(row => {
                doc.text(`${row.date} ${row.time}  ${row.extension}  ${row.dialedNumber}  ${row.duration}  $${row.cost}`);
            });
            doc.moveDown();
            doc.font('Helvetica-Bold').text(`Total Cost: $${data.summary.totalCost?.toFixed(2)}`);
        } else {
            doc.text('Group                Calls      Duration    Cost');
            doc.moveDown(0.5);
            data.rows.forEach(row => {
                doc.text(`${row.key.padEnd(20)} ${row.calls}        ${row.duration}s       $${row.cost?.toFixed(2)}`);
            });
            doc.moveDown();
            doc.font('Helvetica-Bold').text(`Total Cost: $${data.summary.totalCost?.toFixed(2)}`);
        }

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

module.exports = {
    export: exportReport
};
