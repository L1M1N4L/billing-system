module.exports = {
    STX: 0x02, // Start of Text
    ETX: 0x03, // End of Text
    ENQ: 0x05, // Enquiry
    ACK: 0x06, // Acknowledge
    NAK: 0x15, // Negative Acknowledge
    XON: 0x13, // Transmit On
    XOFF: 0x11, // Transmit Off

    // Record Types
    RECORD_TYPES: {
        LINK_START: 'LS',
        LINK_DESCRIPTION: 'LD',
        LINK_RECORD: 'LR',
        LINK_ALIVE: 'LA',
        LINK_END: 'LE',
        GUEST_IN: 'GI',
        GUEST_OUT: 'GO',
        GUEST_CHANGE: 'GC',
        ROOM_EQUIPMENT: 'RE',
        WAKEUP_REQUEST: 'WR',
        WAKEUP_CLEAR: 'WC',
        WAKEUP_ANSWER: 'WA',
        POSTING: 'PS'
    }
};
