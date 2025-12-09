const { ipcMain, app } = require('electron');
const log = require('electron-log');
const dbManager = require('./database');
const smdrListener = require('./smdr/listener');
const reportGenerator = require('./reports/generator');
const syncManager = require('./sync/sync-manager');
const updater = require('./updater/auto-updater');

function setupIpcHandlers() {
    // System Info
    ipcMain.handle('app:version', () => app.getVersion());
    ipcMain.handle('app:path', () => app.getAppPath());

    // Database Operations
    ipcMain.handle('db:find', async (event, collection, query) => {
        try {
            return await dbManager.find(collection, query);
        } catch (error) {
            log.error('db:find error', error);
            throw error;
        }
    });

    ipcMain.handle('db:insert', async (event, collection, doc) => {
        try {
            return await dbManager.insert(collection, doc);
        } catch (error) {
            log.error('db:insert error', error);
            throw error;
        }
    });

    ipcMain.handle('db:update', async (event, collection, doc) => {
        try {
            return await dbManager.update(collection, doc);
        } catch (error) {
            log.error('db:update error', error);
            throw error;
        }
    });

    ipcMain.handle('db:remove', async (event, collection, id) => {
        try {
            return await dbManager.remove(collection, id);
        } catch (error) {
            log.error('db:remove error', error);
            throw error;
        }
    });

    // Bulk Operations
    ipcMain.handle('db:bulk', async (event, collection, docs) => {
        try {
            return await dbManager.bulkDocs(collection, docs);
        } catch (error) {
            log.error('db:bulk error', error);
            throw error;
        }
    });

    // SMDR Control
    ipcMain.handle('smdr:start', async (event, providedConfig) => {
        const storedConfig = store.get('smdr') || {};
        const config = { ...storedConfig, ...providedConfig };
        return await smdrListener.start(config);
    });

    ipcMain.handle('smdr:stop', async () => {
        return await smdrListener.stop();
    });

    ipcMain.handle('smdr:status', () => {
        return smdrListener.getStatus();
    });

    // Reports
    ipcMain.handle('report:generate', async (event, type, criteria) => {
        return await reportGenerator.generate(type, criteria);
    });

    ipcMain.handle('report:export', async (event, type, reportData, format) => {
        return await reportGenerator.exportReport(type, reportData, format);
    });

    ipcMain.handle('reports:stats', async (event, range) => {
        const statsGenerator = require('./reports/stats-generator');
        return await statsGenerator.getStats(range);
    });

    // Sync
    ipcMain.handle('sync:start', async () => {
        return await syncManager.startSync();
    });

    // Settings
    // Settings using electron-store
    const Store = require('electron-store');
    const store = new Store();

    ipcMain.handle('settings:get', async (event, key) => {
        return store.get(key);
    });

    ipcMain.handle('settings:set', async (event, key, value) => {
        store.set(key, value);
        // If SMDR settings changed, we might need to restart the listener
        if (key.startsWith('smdr')) {
            // Optional: restart listener if running
        }
        return true;
    });

    // Dev Tools
    ipcMain.handle('db:seed', async () => {
        const seeder = require('./database/seeder');
        return await seeder.seed();
    });

    log.info('IPC handlers initialized');
}

module.exports = { setupIpcHandlers };
