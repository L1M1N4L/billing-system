const { initDatabases, getDatabase } = require('./pouchdb-setup');
const log = require('electron-log');

// Initialize databases on module load (or call explicit init)
// Better to export an init function to be called by main
let initialized = false;

async function init() {
    if (initialized) return;
    await initDatabases();
    initialized = true;
}

// Generic CRUD operations
async function find(collection, query) {
    const db = getDatabase(collection);
    // Support both PouchDB-find selector syntax and allDocs
    if (query.selector) {
        return await db.find(query);
    } else if (query.id) {
        return await db.get(query.id);
    } else {
        // Return all docs if no specific query
        return await db.allDocs({ include_docs: true, ...query });
    }
}

async function insert(collection, doc) {
    const db = getDatabase(collection);
    if (!doc._id && collection === 'cdrs') {
        // Auto-generate ID for CDRs if needed, or rely on PouchDB UUIDs
    }
    doc.createdAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    return await db.post(doc);
}

async function update(collection, doc) {
    const db = getDatabase(collection);
    doc.updatedAt = new Date().toISOString();
    return await db.put(doc);
}

async function remove(collection, id) {
    const db = getDatabase(collection);
    const doc = await db.get(id);
    return await db.remove(doc);
}

async function bulkDocs(collection, docs) {
    const db = getDatabase(collection);
    return await db.bulkDocs(docs);
}

module.exports = {
    init,
    find,
    insert,
    update,
    remove,
    bulkDocs
};
