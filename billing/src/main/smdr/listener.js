const net = require('net');
const log = require('electron-log');
const { STX, ETX, ACK, NAK, ENQ, RECORD_TYPES } = require('./pms-constants');
const parser = require('./parser');
const processor = require('./processor');

let server = null;
let isRunning = false;
let config = { port: 5008, host: '0.0.0.0' };

// Buffer for incoming data to handle fragmented packets
let receiveBuffer = Buffer.alloc(0);

async function start(newConfig) {
    if (isRunning) return false;

    if (newConfig) config = { ...config, ...newConfig };

    return new Promise((resolve, reject) => {
        server = net.createServer((socket) => {
            log.info('PMS Client connected:', socket.remoteAddress);

            socket.on('data', async (data) => {
                // Append new data to buffer
                receiveBuffer = Buffer.concat([receiveBuffer, data]);

                processBuffer(socket);
            });

            socket.on('error', (err) => {
                log.error('PMS Socket error:', err);
            });

            socket.on('close', () => {
                log.info('PMS Client disconnected');
                receiveBuffer = Buffer.alloc(0);
            });
        });

        server.on('error', (err) => {
            log.error('PMS Server error:', err);
            reject(err);
        });

        server.listen(config.port, config.host, () => {
            log.info(`PMS Server listening on ${config.host}:${config.port}`);
            isRunning = true;
            resolve(true);
        });
    });
}

function processBuffer(socket) {
    // Look for frames: <STX> ... <ETX><LRC>
    let stxIndex = receiveBuffer.indexOf(STX);

    while (stxIndex !== -1) {
        // We found an STX. Look for ETX after it.
        // Needs to have at least <STX> X <ETX> <LRC> (4 bytes)
        // But minimal empty record <STX><ETX><LRC> is 3 bytes

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
                    socket.write(Buffer.from([ACK]));

                    // Parse Content (Exclude STX, ETX, LRC)
                    const contentValues = frame.slice(1, ethIndex); // From STX+1 to ETX-1
                    // Convert to string. Protocol implies ASCII text inside
                    const contentStr = contentValues.toString('ascii');

                    handleMessage(socket, contentStr);

                } else {
                    // Bad checksum
                    log.warn('Invalid LRC received');
                    socket.write(Buffer.from([NAK]));
                }

                // Remove processed frame from buffer
                receiveBuffer = receiveBuffer.slice(lrcIndex + 1);

                // Search for next STX
                stxIndex = receiveBuffer.indexOf(STX);
            } else {
                // We have ETX but waiting for LRC byte
                break; // Wait for more data
            }
        } else {
            // valid STX but no ETX yet
            break; // Wait for more data
        }
    }

    // Cleanup: If buffer gets too large without valid STX, might want to discard garbage
    // For now, if no STX found, discard all
    if (receiveBuffer.indexOf(STX) === -1 && receiveBuffer.length > 0) {
        // Check if we have ENQ (0x05) - Inquiry
        if (receiveBuffer.includes(ENQ)) {
            socket.write(Buffer.from([ACK])); // Or resend last message
            receiveBuffer = Buffer.alloc(0);
        } else {
            // Trash garbage data to prevent memory leak
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

    const { type, fields } = parsed;

    switch (type) {
        case RECORD_TYPES.LINK_START: // LS
            // Reply with our own Link Start or Link Description
            // PMS Protocol: <2> Link Description – System to PMS (When receive LinkStart)
            // Respond with LD
            sendLinkDescription(socket);
            break;

        case RECORD_TYPES.LINK_ALIVE: // LA
            // Just ACK was already sent. 
            // Maybe update "last seen" timestamp
            break;

        case RECORD_TYPES.POSTING: // PS
            await processor.processCDR(parsed);
            break;

        case RECORD_TYPES.GUEST_IN: // GI
            // TODO: Update Extension/Room status
            break;

        case RECORD_TYPES.GUEST_OUT: // GO
            // TODO: Clear Extension/Room
            break;
    }
}

function sendLinkDescription(socket) {
    const date = new Date();
    // Format: LD|DAyymmdd|TIhhmmss|V#xxxxxx|IFPB

    // Simple helper functions for date format
    const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
    const hhmmss = date.toTimeString().slice(0, 8).replace(/:/g, '');

    const msg = `LD|DA${yymmdd}|TI${hhmmss}|V#1.0|IFPB|`;
    sendFrame(socket, msg);
}

function sendFrame(socket, msgStr) {
    if (!socket || socket.destroyed) return;

    const msgBuf = Buffer.from(msgStr, 'ascii');
    // Calculate LRC: XOR of msgBuf (which is [Record ID]...[End of Data])
    // Frame: <STX> [Msg] <ETX> <LRC>
    // LRC covers [Msg] + <ETX>

    // Wait, let's re-read protocol for LRC coverage.
    // " <LRC> == XOR all data from [Record ID type] to <ETX> "
    // So Data + ETX.

    const etxBuf = Buffer.from([ETX]);
    const dataToHash = Buffer.concat([msgBuf, etxBuf]);
    const lrc = parser.calculateLRC(dataToHash);

    const stxBuf = Buffer.from([STX]);
    const lrcBuf = Buffer.from([lrc]);

    const fullFrame = Buffer.concat([stxBuf, msgBuf, etxBuf, lrcBuf]);

    socket.write(fullFrame);
}

async function stop() {
    if (!isRunning || !server) return true;

    return new Promise((resolve) => {
        server.close(() => {
            log.info('PMS Server stopped');
            isRunning = false;
            server = null;
            resolve(true);
        });
    });
}

function getStatus() {
    return {
        running: isRunning,
        port: config.port,
        host: config.host
    };
}

module.exports = {
    start,
    stop,
    getStatus,
    sendFrame // Export for testing/manual push
};
