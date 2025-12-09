const cdrRepo = require('./repositories/cdr-repository');
const extRepo = require('./repositories/extension-repository');
const tenantRepo = require('./repositories/tenant-repository');
const log = require('electron-log');

async function seed() {
    log.info('Starting database seed...');

    // 1. Extensions
    const extensions = [];
    for (let i = 101; i <= 110; i++) {
        extensions.push({
            extension: i.toString(),
            name: `User ${i}`,
            department: ['Sales', 'Support', 'Admin'][Math.floor(Math.random() * 3)],
            tenant: 'Tenant A',
            status: 'active'
        });
    }

    for (const ext of extensions) {
        try {
            // specific check to avoid duplicates if possible, or just insert
            await extRepo.create(ext);
        } catch (e) { /* ignore */ }
    }

    // 2. Tenants
    try {
        await tenantRepo.create({ name: 'Tenant A', code: 'T001', contact: 'John Doe' });
        await tenantRepo.create({ name: 'Tenant B', code: 'T002' });
    } catch (e) { }

    // 3. CDRs (Last 30 days)
    const cdrs = [];
    const now = new Date();

    for (let i = 0; i < 500; i++) {
        const date = new Date(now);
        // 30% chance for today, otherwise restart random 30 days
        if (Math.random() > 0.3) {
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        }
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        const duration = Math.floor(Math.random() * 300) + 10; // 10s to 300s
        const cost = parseFloat((duration * 0.05).toFixed(2)); // $0.05 per sec mock

        cdrs.push({
            extension: (100 + Math.floor(Math.random() * 10) + 1).toString(),
            dialedNumber: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            date: date.toISOString().split('T')[0].replace(/-/g, ''), // YYYYMMDD
            time: date.toTimeString().split(' ')[0].replace(/:/g, ''), // HHMMSS
            durationSeconds: duration,
            cost: cost,
            timestamp: date.toISOString(),
            tenant: Math.random() > 0.5 ? 'Tenant A' : 'Tenant B',
            type: Math.random() > 0.3 ? 'Outgoing' : 'Incoming', // Mix types
            trunk: 'CO' + (Math.floor(Math.random() * 4) + 1).toString(), // CO1 to CO4
            accountCode: Math.random() > 0.7 ? 'ACC' + Math.floor(Math.random() * 5) : '' // Occasional account code
        });
    }

    // Batch insert CDRs? Repo is single insert, let's loop (mock is small)
    // For bulk, we should use dbManager.bulkDocs but repo doesn't expose it directly for CDRs yet.
    // We'll use the ipc 'db:bulk' or just loop for now since it's only 500.
    // Actually, let's use dbManager.bulkDocs via direct require if possible, but seeder is in main.

    // Using loop for simplicity in this demo
    for (const cdr of cdrs) {
        await cdrRepo.create(cdr);
    }

    log.info('Database seed complete');
    return { message: 'Seeding complete', count: cdrs.length };
}

module.exports = { seed };
