const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');
const { setupIpcHandlers } = require('./ipc-handlers');
const { createMainWindow } = require('./window-manager');

// Initialize Logging
log.initialize();
log.info('Application starting...');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const dbManager = require('./database');

// Force Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        const { getMainWindow } = require('./window-manager');
        const mainWindow = getMainWindow();
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        // init logic moved inside lock check
        await dbManager.init();
        setupIpcHandlers();
        createMainWindow();

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
        });
    });
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
