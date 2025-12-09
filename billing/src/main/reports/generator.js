const log = require('electron-log');
const detailReport = require('./detail-report');
const summaryReport = require('./summary-report');
const excelExporter = require('./export/excel-exporter');
const pdfExporter = require('./export/pdf-exporter');

async function generate(type, criteria) {
    log.info(`Generating ${type} report with criteria:`, criteria);

    try {
        switch (type) {
            case 'detail':
                return await detailReport.generate(criteria);
            case 'summary':
                return await summaryReport.generate(criteria);
            default:
                throw new Error(`Unknown report type: ${type}`);
        }
    } catch (error) {
        log.error('Report generation failed:', error);
        throw error;
    }
}

async function exportReport(type, reportData, format) {
    log.info(`Exporting ${type} report to ${format}`);

    try {
        if (format === 'excel') {
            return await excelExporter.export(type, reportData);
        } else if (format === 'pdf') {
            return await pdfExporter.export(type, reportData);
        } else {
            throw new Error(`Unknown export format: ${format}`);
        }
    } catch (error) {
        log.error('Report export failed:', error);
        throw error;
    }
}

module.exports = {
    generate,
    exportReport
};
