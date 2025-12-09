const log = require('electron-log');
const costRepo = require('../database/repositories/cost-repository');

// Simple implementation for MVP
async function calculateCost(cdr) {
    try {
        // 1. Identify destination based on Dialed Number
        // Simple logic: if length > 4, it's external.
        // Check prefix

        // For MVP, flat rate or mock logic
        // TODO: Implement actual prefix matching against Cost Zones

        let cost = 0;

        // Example logic
        if (cdr.dialedNumber.startsWith('0')) {
            // External call
            const minutes = Math.ceil(cdr.durationSeconds / 60);
            cost = minutes * 1000; // 1000 per minute
        }

        return {
            cost: cost,
            pulses: Math.ceil(cdr.durationSeconds / 60) // Mock pulses
        };
    } catch (error) {
        log.error('Error calculating cost:', error);
        return { cost: 0, pulses: 0 };
    }
}

module.exports = {
    calculateCost
};
