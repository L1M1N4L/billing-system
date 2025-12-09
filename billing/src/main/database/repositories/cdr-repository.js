const dbManager = require('../index');

const COLLECTION = 'cdrs';

async function create(cdr) {
    return await dbManager.insert(COLLECTION, cdr);
}

async function findByDateRange(startDate, endDate) {
    // ISO date strings expected
    return await dbManager.find(COLLECTION, {
        selector: {
            timestamp: { $gte: startDate, $lte: endDate }
        },
        sort: [{ timestamp: 'desc' }]
    });
}

async function findByExtension(extension, limit = 100) {
    // For PouchDB-find, if we sort by 'date', 'date' must be in the selector.
    // We use a "dummy" selector for date ($gt: null) combined with extension.
    return await dbManager.find(COLLECTION, {
        selector: {
            extension: extension,
            date: { $gt: null }
        },
        limit: limit,
        sort: [{ date: 'desc' }]
    });
}

module.exports = {
    create,
    findByDateRange,
    findByExtension
};
