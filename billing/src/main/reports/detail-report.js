const cdrRepo = require('../database/repositories/cdr-repository');

async function generate(criteria) {
    const { startDate, endDate, extension, tenant } = criteria;

    // 1. Normalize Date format (UI sends YYYY-MM-DD, DB uses YYYYMMDD)
    // 1. Normalize Date format (UI sends YYYY-MM-DD, DB uses ISO string)
    const dbStartDate = `${startDate}T00:00:00.000Z`;
    const dbEndDate = `${endDate}T23:59:59.999Z`;

    // 2. Fetch Data
    let cdrs = await cdrRepo.findByDateRange(dbStartDate, dbEndDate);
    let rows = cdrs.docs || [];

    // 3. Apply Grouping/Range Filters
    const {
        grouping, groupFrom, groupTo,
        // tenant was already destructured above
        minDuration, minCost, callType, numberPattern
    } = criteria;

    if (grouping && groupFrom && groupTo) {
        // Map grouping selection to DB field
        const fieldMap = {
            'extension': 'extension',
            'account': 'accountCode',
            'division': 'department', // DB uses department, UI logic needs mapping
            'line': 'trunk',
            'dial': 'dialedNumber'
        };
        const dbField = fieldMap[grouping] || 'extension';

        rows = rows.filter(r => {
            const val = r[dbField] || '';
            // Simple lexicographical comparison for strings (works for numbers too usually)
            return val >= groupFrom && val <= groupTo;
        });
    }

    if (tenant) {
        rows = rows.filter(r => r.tenant === tenant);
    }

    if (extension) {
        rows = rows.filter(r => r.extension === extension);
    }

    // Advanced Filters
    if (criteria.timeFrom && criteria.timeTo) {
        // Time format HH:mm
        const tStart = criteria.timeFrom.replace(':', '');
        const tEnd = criteria.timeTo.replace(':', '');
        rows = rows.filter(r => {
            // r.time is HHMMSS, compare HHMM
            const rTime = r.time ? r.time.substring(0, 4) : '0000';
            return rTime >= tStart && rTime <= tEnd;
        });
    }

    if (minDuration) {
        rows = rows.filter(r => (r.durationSeconds || 0) >= parseInt(minDuration));
    }

    if (minCost) {
        rows = rows.filter(r => (r.cost || 0) >= parseFloat(minCost));
    }

    if (callType && callType !== 'all') {
        const type = callType.toLowerCase();
        rows = rows.filter(r =>
            (r.type || '').toLowerCase() === type
        );
    }

    if (numberPattern) {
        // Simple wildcard support: 021* -> startsWith, *123 -> endsWith, *456* -> includes
        const pattern = numberPattern.replace(/\*/g, '');
        rows = rows.filter(r => (r.dialedNumber || '').includes(pattern));
    }

    // 3. Calculate Totals
    const totalCalls = rows.length;
    const totalDuration = rows.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    const totalCost = rows.reduce((sum, r) => sum + (r.cost || 0), 0);

    return {
        rows,
        summary: {
            totalCalls,
            totalDuration,
            totalCost
        },
        generatedAt: new Date().toISOString()
    };
}

module.exports = { generate };
