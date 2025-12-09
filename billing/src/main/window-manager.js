const { BrowserWindow, app, screen } = require('electron');
const path = require('path');
const store = require('./store');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

function getMainWindow() {
    return mainWindow;
}

function createMainWindow() {
    // Restore window state
    const windowState = store.get('windowState', {
        width: 1200,
        height: 800,
        x: undefined,
        y: undefined
    });

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 1024,
        minHeight: 768,
        show: false, // Don't show until ready-to-show
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        icon: path.join(__dirname, '../../resources/icons/icon.ico') // Adjust path if needed
    });

    // Save window state on close
    mainWindow.on('close', () => {
        if (!mainWindow.isMaximized()) {
            const bounds = mainWindow.getBounds();
            store.set('windowState', bounds);
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (mainWindow.isMaximized()) {
            mainWindow.maximize();
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5200');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:') || url.startsWith('http:')) {
            require('electron').shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    return mainWindow;
}

module.exports = {
    createMainWindow,
    getMainWindow
};
