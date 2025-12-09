const log = require('electron-log');
const { STX, ETX } = require('./pms-constants');

/**
 * Calculates LRC (Longitudinal Redundancy Check)
 * XOR all bytes from Record ID (after STX) up to ETX (inclusive)
 */
function calculateLRC(buffer) {
    let lrc = 0;
    for (let i = 0; i < buffer.length; i++) {
        lrc ^= buffer[i];
    }
    return lrc;
}

/**
 * Validates a message frame
 * Frame: <STX> [Data] <ETX> <LRC>
 */
function validateFrame(buffer) {
    if (buffer.length < 3) return false;
    if (buffer[0] !== STX) return false;

    // Find ETX
    // Note: ETX might not be the second to last byte if we have trailing garbage, 
    // but strictly speaking protocol is <STX>...<ETX><LRC>
    // So we expect the buffer passed here to be exactly one frame candidate

    const etxIndex = buffer.length - 2;
    if (buffer[etxIndex] !== ETX) return false;

    const receivedLrc = buffer[buffer.length - 1];

    // Calculate LRC: From Record ID (index 1) to ETX (index length-2)
    const dataToHash = buffer.slice(1, buffer.length - 1);
    const calculatedLrc = calculateLRC(dataToHash);

    return receivedLrc === calculatedLrc;
}

/**
 * Parses the Data portion of the frame
 * Format: [Record ID] | [Field 1] | [Field 2] | ... |
 */
function parseData(dataString) {
    try {
        // Data starts with Record ID immediately
        // e.g. "PS|RN12|..."
        // Split by pipe
        const parts = dataString.split('|');
        const recordType = parts[0];
        const fields = {};

        // Parse fields (skipping record type)
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            // Field Tag is usually 2 chars, but implementation might vary (RN, TI, DA)
            // Protocol says: [Field Type] [Data]
            // Examples: RN3100, DA251127
            if (part.length > 2) {
                const tag = part.substring(0, 2);
                const val = part.substring(2);
                fields[tag] = val;
            }
        }

        return {
            type: recordType,
            fields: fields,
            raw: dataString
        };
    } catch (error) {
        log.error('Error parsing data string:', error);
        return null;
    }
}

module.exports = {
    calculateLRC,
    validateFrame,
    parseData
};
