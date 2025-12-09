const dbManager = require('../index');

const COLLECTION = 'phonebook';

async function create(entry) {
    return await dbManager.insert(COLLECTION, entry);
}

async function update(entry) {
    return await dbManager.update(COLLECTION, entry);
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

async function findByNumber(number) {
    const result = await dbManager.find(COLLECTION, {
        selector: { number: number },
        limit: 1
    });
    return result.docs[0];
}

module.exports = {
    create,
    update,
    remove,
    findAll,
    findByNumber
};
