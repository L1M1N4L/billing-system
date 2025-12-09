const dbManager = require('../index');

const COLLECTION = 'costs';

async function create(zone) {
    return await dbManager.insert(COLLECTION, zone);
}

async function update(zone) {
    return await dbManager.update(COLLECTION, zone);
}

async function remove(id) {
    return await dbManager.remove(COLLECTION, id);
}

async function findAll() {
    return await dbManager.find(COLLECTION, {
        selector: { code: { $gt: null } },
        sort: [{ code: 'asc' }]
    });
}

async function findByCode(code) {
    const result = await dbManager.find(COLLECTION, {
        selector: { code: code },
        limit: 1
    });
    return result.docs[0];
}

module.exports = {
    create,
    update,
    remove,
    findAll,
    findByCode
};
