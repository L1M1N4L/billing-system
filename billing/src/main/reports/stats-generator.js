const cdrRepo = require('../database/repositories/cdr-repository');
const log = require('electron-log');

async function getStats(range) {
    // range: 'today', 'week', 'month'
    const now = new Date();
    let startDate, endDate;

    endDate = now.toISOString();

    const d = new Date();
    if (range === 'today') {
        d.setHours(0, 0, 0, 0);
        startDate = d.toISOString();
    } else if (range === 'week') {
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
    } else if (range === 'month') {
        d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString();
    } else {
        // Default last 7 days
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
    }

    const cdrs = await cdrRepo.findByDateRange(startDate, endDate);
    const docs = cdrs.docs || [];

    // Aggregations
    const hourlyUsage = new Array(24).fill(0);
    const dailyVolume = {}; // date -> count
    const dailyCost = {}; // date -> cost
    const topExtensions = {}; // ext -> { count, cost }

    docs.forEach(doc => {
        const date = new Date(doc.timestamp || doc.createdAt);
        const hour = date.getHours();
        const dayStr = date.toISOString().split('T')[0];

        // Hourly (0-23)
        hourlyUsage[hour]++;

        // Daily Volume
        dailyVolume[dayStr] = (dailyVolume[dayStr] || 0) + 1;

        // Daily Cost
        dailyCost[dayStr] = (dailyCost[dayStr] || 0) + (doc.cost || 0);

        // Top Extensions
        const ext = doc.extension || 'Unknown';
        if (!topExtensions[ext]) {
            topExtensions[ext] = { extension: ext, count: 0, cost: 0 };
        }
        topExtensions[ext].count++;
        topExtensions[ext].cost += (doc.cost || 0);
    });

    // Format for Charts
    const hourlyData = hourlyUsage.map((count, hour) => ({
        hour: `${hour}:00`,
        calls: count
    }));

    const dailyData = Object.keys(dailyVolume).sort().map(date => ({
        date: date,
        calls: dailyVolume[date],
        cost: dailyCost[date] || 0
    }));

    const extensionData = Object.values(topExtensions)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5); // Top 5

    return {
        hourlyData,
        dailyData,
        extensionData,
        totals: {
            calls: docs.length,
            cost: docs.reduce((acc, curr) => acc + (curr.cost || 0), 0),
            duration: docs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0)
        }
    };
}

module.exports = {
    getStats
};
