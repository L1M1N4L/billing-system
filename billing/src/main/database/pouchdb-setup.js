const PouchDB = require('pouchdb');
const PouchDBFind = require('pouchdb-find');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');

PouchDB.plugin(PouchDBFind);

// Database path in user data directory
const dbPath = path.join(app.getPath('userData'), 'databases_v2');
log.info('Database path:', dbPath);

const databases = {};
const collections = [
    'cdrs',
    'extensions',
    'lines',
    'tenants',
    'costs',
    'phonebook',
    'settings',
    'reports_cache',
    'system_stats'
];

async function initDatabases() {
    for (const name of collections) {
        databases[name] = new PouchDB(path.join(dbPath, name), {
            auto_compaction: true,
            revs_limit: 10
        });
        log.info(`Initialized database: ${name}`);
    }

    await setupIndexes();
}

async function setupIndexes() {
    try {
        // CDR Indexes
        const cdrDb = databases.cdrs;
        if (cdrDb) {
            await cdrDb.createIndex({ index: { fields: ['date'] } });
            await cdrDb.createIndex({ index: { fields: ['extension'] } });
            await cdrDb.createIndex({ index: { fields: ['tenant'] } });
            await cdrDb.createIndex({ index: { fields: ['timestamp'] } });
        }

        // Extension Indexes
        const extDb = databases.extensions;
        if (extDb) {
            await extDb.createIndex({ index: { fields: ['extension'] } });
        }

        // Tenant Indexes
        const tenantDb = databases.tenants;
        if (tenantDb) {
            await tenantDb.createIndex({
                index: {
                    fields: ['name'],
                    ddoc: 'idx-tenant-name'
                }
            });
        }

        // Line Indexes
        const lineDb = databases.lines;
        if (lineDb) {
            await lineDb.createIndex({
                index: { fields: ['name'] }
            });
            await lineDb.createIndex({
                index: {
                    fields: ['lineNumber'],
                    ddoc: 'idx-line-number'
                }
            });
        }

        // Phonebook Indexes
        const pbDb = databases.phonebook;
        if (pbDb) {
            await pbDb.createIndex({
                index: {
                    fields: ['name'],
                    ddoc: 'idx-phonebook-name'
                }
            });
        }

        // Cost Indexes
        const costDb = databases.costs;
        if (costDb) {
            await costDb.createIndex({
                index: {
                    fields: ['code'],
                    ddoc: 'idx-cost-code'
                }
            });
        }

        log.info('Database indexes created successfully');

        // Wait for indexes to be fully built before continuing
        await new Promise(resolve => setTimeout(resolve, 500));
        log.info('Database indexes ready');
    } catch (error) {
        log.error('Error creating indexes:', error);
    }
}

function getDatabase(name) {
    if (!databases[name]) {
        throw new Error(`Database ${name} not found`);
    }
    return databases[name];
}

module.exports = {
    initDatabases,
    getDatabase
};
