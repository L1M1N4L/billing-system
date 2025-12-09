const cdrRepo = require('../database/repositories/cdr-repository');

async function generate(criteria) {
    const { startDate, endDate, groupBy = 'extension' } = criteria;

    // 1. Normalize Date format
    const dbStartDate = startDate.replace(/-/g, '');
    const dbEndDate = endDate.replace(/-/g, '');

    // 2. Fetch All Data for range
    const cdrs = await cdrRepo.findByDateRange(dbStartDate, dbEndDate);
    let rows = cdrs.docs || [];

    // 3. Apply Filters
    const {
        grouping, groupFrom, groupTo, // grouping is also used for aggregation
        minDuration, minCost, callType, numberPattern, tenant
    } = criteria;

    if (grouping && groupFrom && groupTo) {
        const fieldMap = {
            'extension': 'extension',
            'account': 'accountCode',
            'division': 'department',
            'line': 'trunk',
            'dial': 'dialedNumber'
        };
        const dbField = fieldMap[grouping] || 'extension';
        rows = rows.filter(r => {
            const val = r[dbField] || '';
            return val >= groupFrom && val <= groupTo;
        });
    }

    if (tenant) rows = rows.filter(r => r.tenant === tenant);

    if (criteria.timeFrom && criteria.timeTo) {
        const tStart = criteria.timeFrom.replace(':', '');
        const tEnd = criteria.timeTo.replace(':', '');
        rows = rows.filter(r => {
            const rTime = r.time?.substring(0, 4) || '0000';
            return rTime >= tStart && rTime <= tEnd;
        });
    }

    if (minDuration) rows = rows.filter(r => (r.durationSeconds || 0) >= parseInt(minDuration));
    if (minCost) rows = rows.filter(r => (r.cost || 0) >= parseFloat(minCost));
    if (callType && callType !== 'all') rows = rows.filter(r => (r.type || '').toLowerCase() === callType.toLowerCase());
    if (numberPattern) {
        const pattern = numberPattern.replace(/\*/g, '');
        rows = rows.filter(r => (r.dialedNumber || '').includes(pattern));
    }

    // 2. Aggregate
    const groups = {};

    const fieldMap = {
        'extension': 'extension',
        'account': 'accountCode',
        'division': 'department',
        'line': 'trunk',
        'dial': 'dialedNumber'
    };
    const dbField = fieldMap[groupBy] || 'extension';

    rows.forEach(cdr => {
        const key = cdr[dbField] || 'Unknown';
        if (!groups[key]) {
            groups[key] = {
                key,
                calls: 0,
                duration: 0,
                cost: 0
            };
        }

        groups[key].calls++;
        groups[key].duration += (cdr.durationSeconds || 0);
        groups[key].cost += (cdr.cost || 0);
    });

    const resultRows = Object.values(groups).sort((a, b) => b.cost - a.cost);

    const totalCalls = resultRows.reduce((sum, r) => sum + r.calls, 0);
    const totalDuration = resultRows.reduce((sum, r) => sum + r.duration, 0);
    const totalCost = resultRows.reduce((sum, r) => sum + r.cost, 0);

    return {
        rows: resultRows,
        groupBy,
        summary: {
            totalCalls,
            totalDuration,
            totalCost
        },
        generatedAt: new Date().toISOString()
    };
}

module.exports = { generate };
