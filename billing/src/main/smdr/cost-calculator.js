const log = require('electron-log');
const costRepo = require('../database/repositories/cost-repository');

const store = require('../store');

// Simple implementation for MVP
async function calculateCost(cdr) {
    try {
        const durationMin = Math.ceil((cdr.durationSeconds || 0) / 60);
        if (durationMin === 0) return { cost: 0, pulses: 0 };

        // 1. Get Settings
        const appSettings = store.get('app') || {};
        const defaultRate = parseFloat(appSettings.defaultRate) || 0;

        // 2. Get All Rates (In production, we might want to cache this or find specific)
        const allRatesResult = await costRepo.findAll();
        const rates = allRatesResult.docs || [];

        // 3. Find Match (Longest Prefix Match)
        const dialed = (cdr.dialedNumber || '').replace(/\D/g, ''); // Digits only

        let bestMatch = null;
        let maxLen = -1;

        // "Remake": Standard Longest Prefix Match against "Cost Zones" (tariffs)
        for (const rate of rates) {
            // If rate.code is empty, skip
            if (rate.code && dialed.startsWith(rate.code)) {
                if (rate.code.length > maxLen) {
                    maxLen = rate.code.length;
                    bestMatch = rate;
                }
            }
        }

        let cost = 0;
        let usedRate = defaultRate;
        let source = 'default';

        if (bestMatch) {
            usedRate = parseFloat(bestMatch.rate) || 0;
            cost = usedRate * durationMin;
            source = 'tariff';
        } else {
            // No tariff match found, use default rate
            cost = defaultRate * durationMin;
        }

        return {
            cost: parseFloat(cost.toFixed(4)),
            pulses: durationMin,
            rateApplied: usedRate,
            rateSource: source
        };
    } catch (error) {
        log.error('Error calculating cost:', error);
        return { cost: 0, pulses: 0 };
    }
}

module.exports = {
    calculateCost
};
