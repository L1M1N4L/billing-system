const net = require('net');
const log = require('electron-log');
const { STX, ETX, ACK, NAK, ENQ, RECORD_TYPES } = require('./pms-constants');
const parser = require('./parser');
const processor = require('./processor');
const EventEmitter = require('events');

const eventEmitter = new EventEmitter();
let server = null;
let isRunning = false;
let activeConnections = 0;
let config = { port: 5008, host: '0.0.0.0' };

// Buffer for incoming data to handle fragmented packets
let receiveBuffer = Buffer.alloc(0);

async function start(newConfig) {
    if (isRunning) return false;

    if (newConfig) {
        config = { ...config, ...newConfig };
        if (config.port) config.port = parseInt(config.port, 10);
    }

    const mode = config.mode || 'server';

    return new Promise((resolve, reject) => {
        if (mode === 'server') {
            // SERVER MODE
            // Listen on 0.0.0.0 to accept connections from PABX
            server = net.createServer((socket) => {
                log.info('PMS Client connected:', socket.remoteAddress);
                activeConnections++;
                eventEmitter.emit('status-change', { connected: true, activeConnections });

                socket.on('close', () => {
                    activeConnections--;
                    eventEmitter.emit('status-change', { connected: activeConnections > 0, activeConnections });
                });

                setupSocketHandlers(socket);
            });

            server.on('error', (err) => {
                log.error('PMS Server error:', err);
                reject(err);
            });

            server.listen(config.port, '0.0.0.0', () => {
                log.info(`PMS Server listening on 0.0.0.0:${config.port}`);
                isRunning = true;
                resolve(true);
            });
        } else {
            // CLIENT MODE
            // Connect to PABX IP
            const clientSocket = new net.Socket();
            server = clientSocket;

            clientSocket.connect(config.port, config.host, () => {
                log.info(`PMS Client connected to ${config.host}:${config.port}`);
                isRunning = true;
                activeConnections = 1;
                eventEmitter.emit('status-change', { connected: true, activeConnections: 1 });
                resolve(true);
            });

            setupSocketHandlers(clientSocket);

            clientSocket.on('error', (err) => {
                log.error('PMS Client Connection error:', err);
                if (!isRunning) reject(err);
            });

            clientSocket.on('close', () => {
                log.info('PMS Connection closed');
                isRunning = false;
                activeConnections = 0;
                eventEmitter.emit('status-change', { connected: false, activeConnections: 0 });
            });
        }
    });
}

function setupSocketHandlers(socket) {
    socket.on('data', async (data) => {
        receiveBuffer = Buffer.concat([receiveBuffer, data]);
        processBuffer(socket);
    });

    socket.on('error', (err) => {
        log.error('PMS Socket error:', err);
    });

    socket.on('close', () => {
        log.info('PMS Socket disconnected');
        receiveBuffer = Buffer.alloc(0);
    });
}

function processBuffer(socket) {
    // Look for frames: <STX> ... <ETX><LRC>
    let stxIndex = receiveBuffer.indexOf(STX);

    while (stxIndex !== -1) {
        let ethIndex = -1;
        // Search for ETX after STX
        for (let i = stxIndex + 1; i < receiveBuffer.length; i++) {
            if (receiveBuffer[i] === ETX) {
                ethIndex = i;
                break;
            }
        }

        if (ethIndex !== -1) {
            // Check if we have the LRC byte after ETX
            if (ethIndex + 1 < receiveBuffer.length) {
                const lrcIndex = ethIndex + 1;

                // Extract full frame
                const frame = receiveBuffer.slice(stxIndex, lrcIndex + 1);

                // Validate Frame
                if (parser.validateFrame(frame)) {
                    // Good frame
                    if (!socket.destroyed) socket.write(Buffer.from([ACK]));

                    // Parse Content (Exclude STX, ETX, LRC)
                    const contentValues = frame.slice(1, ethIndex); // From STX+1 to ETX-1
                    const contentStr = contentValues.toString('ascii');

                    handleMessage(socket, contentStr);

                } else {
                    // Bad checksum
                    log.warn('Invalid LRC received');
                    if (!socket.destroyed) socket.write(Buffer.from([NAK]));
                }

                // Remove processed frame from buffer
                receiveBuffer = receiveBuffer.slice(lrcIndex + 1);

                // Search for next STX
                stxIndex = receiveBuffer.indexOf(STX);
            } else {
                break; // Wait for more data
            }
        } else {
            break; // Wait for more data
        }
    }

    // Cleanup garbage
    if (receiveBuffer.indexOf(STX) === -1 && receiveBuffer.length > 0) {
        if (receiveBuffer.includes(ENQ)) {
            if (!socket.destroyed) socket.write(Buffer.from([ACK]));
            receiveBuffer = Buffer.alloc(0);
        } else {
            if (receiveBuffer.length > 1024) {
                receiveBuffer = Buffer.alloc(0);
            }
        }
    }
}

async function handleMessage(socket, contentStr) {
    log.info('Received PMS Message:', contentStr);

    const parsed = parser.parseData(contentStr);
    if (!parsed) return;

    const { type } = parsed;

    switch (type) {
        case RECORD_TYPES.LINK_START: // LS
            sendLinkDescription(socket);
            break;

        case RECORD_TYPES.LINK_ALIVE: // LA
            break;

        case RECORD_TYPES.POSTING: // PS
            await processor.processCDR(parsed);
            break;
    }
}

function sendLinkDescription(socket) {
    const date = new Date();
    const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
    const hhmmss = date.toTimeString().slice(0, 8).replace(/:/g, '');

    const msg = `LD|DA${yymmdd}|TI${hhmmss}|V#1.0|IFPB|`;
    sendFrame(socket, msg);
}

function sendFrame(socket, msgStr) {
    if (!socket || socket.destroyed) return;

    const msgBuf = Buffer.from(msgStr, 'ascii');
    const etxBuf = Buffer.from([ETX]);
    const dataToHash = Buffer.concat([msgBuf, etxBuf]);
    const lrc = parser.calculateLRC(dataToHash);

    const stxBuf = Buffer.from([STX]);
    const lrcBuf = Buffer.from([lrc]);

    const fullFrame = Buffer.concat([stxBuf, msgBuf, etxBuf, lrcBuf]);

    socket.write(fullFrame);
}

async function stop() {
    if (!isRunning && !server) return true;

    return new Promise((resolve) => {
        if (config.mode === 'client') {
            if (server && !server.destroyed) {
                server.end();
                server.destroy();
            }
            log.info('PMS Client stopped');
            isRunning = false;
            server = null;
            resolve(true);
        } else {
            if (server) {
                server.close(() => {
                    log.info('PMS Server stopped');
                    isRunning = false;
                    server = null;
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        }
    });
}

function getStatus() {
    return {
        running: isRunning,
        connected: activeConnections > 0,
        port: config.port,
        host: config.host
    };
}

module.exports = {
    start,
    stop,
    getStatus,
    sendFrame,
    events: eventEmitter
};
