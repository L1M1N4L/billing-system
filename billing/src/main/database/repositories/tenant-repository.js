const dbManager = require('../index');

const COLLECTION = 'tenants';

async function create(tenant) {
    return await dbManager.insert(COLLECTION, tenant);
}

async function update(tenant) {
    return await dbManager.update(COLLECTION, tenant);
}

async function remove(id) {
    return await dbManager.remove(COLLECTION, id);
}

async function findAll() {
    return await dbManager.find(COLLECTION, {
        selector: { name: { $gt: null } },
        sort: [{ name: 'asc' }]
    });
}

module.exports = {
    create,
    update,
    remove,
    findAll
};
