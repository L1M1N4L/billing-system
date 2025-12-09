const dbManager = require('../index');

const COLLECTION = 'lines';

async function create(line) {
    return await dbManager.insert(COLLECTION, line);
}

async function update(line) {
    return await dbManager.update(COLLECTION, line);
}

async function remove(id) {
    return await dbManager.remove(COLLECTION, id);
}

async function findAll() {
    return await dbManager.find(COLLECTION, {
        selector: { lineNumber: { $gt: null } },
        sort: [{ lineNumber: 'asc' }]
    });
}

async function findByLineNumber(number) {
    const result = await dbManager.find(COLLECTION, {
        selector: { lineNumber: number },
        limit: 1
    });
    return result.docs[0];
}

module.exports = {
    create,
    update,
    remove,
    findAll,
    findByLineNumber
};
