const ExcelJS = require('exceljs');
const { app, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

async function exportReport(type, data) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    if (type === 'detail') {
        sheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Time', key: 'time', width: 15 },
            { header: 'Extension', key: 'extension', width: 10 },
            { header: 'Dialed Number', key: 'dialedNumber', width: 20 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Cost', key: 'cost', width: 10 },
        ];

        data.rows.forEach(row => {
            sheet.addRow(row);
        });

        // Add total
        sheet.addRow({});
        const totalRow = sheet.addRow({
            duration: 'Total:',
            cost: data.summary.totalCost
        });
        totalRow.font = { bold: true };

    } else {
        // Summary
        sheet.columns = [
            { header: 'Group', key: 'key', width: 20 },
            { header: 'Calls', key: 'calls', width: 10 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Cost', key: 'cost', width: 15 },
        ];

        data.rows.forEach(row => {
            sheet.addRow(row);
        });

        sheet.addRow({});
        const totalRow = sheet.addRow({
            key: 'Total',
            calls: data.summary.totalCalls,
            duration: data.summary.totalDuration,
            cost: data.summary.totalCost
        });
        totalRow.font = { bold: true };
    }

    // Save dialog
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save Report',
        defaultPath: path.join(app.getPath('documents'), `Report_${Date.now()}.xlsx`),
        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
    });

    if (filePath) {
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
    return null;
}

module.exports = {
    export: exportReport
};
