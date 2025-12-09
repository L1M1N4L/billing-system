const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electron', {
    app: {
        getVersion: () => ipcRenderer.invoke('app:version'),
    },
    db: {
        find: (collection, query) => ipcRenderer.invoke('db:find', collection, query),
        insert: (collection, doc) => ipcRenderer.invoke('db:insert', collection, doc),
        update: (collection, doc) => ipcRenderer.invoke('db:update', collection, doc),
        remove: (collection, id) => ipcRenderer.invoke('db:remove', collection, id),
        bulk: (collection, docs) => ipcRenderer.invoke('db:bulk', collection, docs),
        seed: () => ipcRenderer.invoke('db:seed'),
    },
    smdr: {
        start: (config) => ipcRenderer.invoke('smdr:start', config),
        stop: () => ipcRenderer.invoke('smdr:stop'),
        getStatus: () => ipcRenderer.invoke('smdr:status'),
        onNewCDR: (callback) => ipcRenderer.on('cdr:new', (event, cdr) => callback(cdr)),
        removeCDRListener: () => ipcRenderer.removeAllListeners('cdr:new'),
    },
    reports: {
        generate: (type, criteria) => ipcRenderer.invoke('report:generate', type, criteria),
        export: (type, data, format) => ipcRenderer.invoke('report:export', type, data, format),
        getStats: (range) => ipcRenderer.invoke('reports:stats', range),
    },
    sync: {
        start: () => ipcRenderer.invoke('sync:start'),
    },
    settings: {
        get: (key) => ipcRenderer.invoke('settings:get', key),
        set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    }
});
