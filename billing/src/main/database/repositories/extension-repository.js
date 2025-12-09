const dbManager = require('../index');

const COLLECTION = 'extensions';

async function create(extension) {
    return await dbManager.insert(COLLECTION, extension);
}

async function update(extension) {
    return await dbManager.update(COLLECTION, extension);
}

async function remove(id) {
    return await dbManager.remove(COLLECTION, id);
}

async function findAll() {
    return await dbManager.find(COLLECTION, {
        selector: { extension: { $gt: null } },
        sort: [{ extension: 'asc' }]
    });
}

async function findByNumber(number) {
    const result = await dbManager.find(COLLECTION, {
        selector: { extension: number },
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
