const cdrRepo = require('../database/repositories/cdr-repository');
const extRepo = require('../database/repositories/extension-repository');
const costCalculator = require('./cost-calculator');
const log = require('electron-log');
const { getMainWindow } = require('../window-manager');

async function processCDR(parsedData) {
    try {
        const { fields, type } = parsedData;

        // Only process PS (Posting) records for now, maybe others later
        if (type !== 'PS') return null;

        // Map PMS fields to CDR structure
        // PS|RN...|PT...|DU...|DA...|TI...|DD...

        const cdrData = {
            extension: fields['RN'] || '', // Room Number / Extension
            dialedNumber: fields['DD'] || '', // Dialed Digits
            date: fields['DA'] || '', // DAyymmdd
            time: fields['TI'] || '', // TIhhmmss
            duration: fields['DU'] || '', // DUhhmmss
            rawType: fields['PT'] || '',
            callType: 'Outgoing', // Default assumption for PS
            meteringPulses: fields['MP'] || '0',
        };

        // Normalize Date/Time
        // DA: 980525 -> 1998-05-25 (Assuming 20xx for now? User example has 98... let's assume 20xx for now unless clearly 90s context)
        // Actually, let's assume standard 'yymmdd' maps to '20yy-mm-dd' for current century apps
        if (cdrData.date && cdrData.date.length === 6) {
            const yy = cdrData.date.substring(0, 2);
            const mm = cdrData.date.substring(2, 4);
            const dd = cdrData.date.substring(4, 6);
            cdrData.date = `20${yy}-${mm}-${dd}`;
        }

        if (cdrData.time && cdrData.time.length === 6) {
            const hh = cdrData.time.substring(0, 2);
            const mm = cdrData.time.substring(2, 4);
            const ss = cdrData.time.substring(4, 6);
            cdrData.time = `${hh}:${mm}:${ss}`;
        }

        cdrData.timestamp = new Date(`${cdrData.date}T${cdrData.time}`).toISOString();

        // Parse duration to seconds
        if (cdrData.duration && cdrData.duration.length === 6) {
            const h = parseInt(cdrData.duration.substring(0, 2)) || 0;
            const m = parseInt(cdrData.duration.substring(2, 4)) || 0;
            const s = parseInt(cdrData.duration.substring(4, 6)) || 0;
            cdrData.durationSeconds = (h * 3600) + (m * 60) + s;
        } else {
            cdrData.durationSeconds = 0;
        }

        // 1. Enrich with Extension/Tenant info
        // In Hotel context, 'RN' is Room Number = Extension usually
        const extension = await extRepo.findByNumber(cdrData.extension);

        if (extension) {
            cdrData.division = extension.division;
            cdrData.tenant = extension.tenant;
            cdrData.account = extension.account;
            cdrData.guestName = extension.guestName; // Future: Populated by GI records
        }

        // 2. Calculate Cost
        const costInfo = await costCalculator.calculateCost(cdrData);
        cdrData.cost = costInfo.cost;

        // 3. Save to Database
        const savedCDR = await cdrRepo.create(cdrData);

        // 4. Notify UI (Real-time update)
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('cdr:new', savedCDR);
        }

        log.info('Processed CDR:', savedCDR._id);
        return savedCDR;
    } catch (error) {
        log.error('Error processing CDR:', error);
        // Don't throw, just log, so we don't crash listener loop
        return null;
    }
}

module.exports = {
    processCDR
};
