
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Explicit path to ensure it loads
const db = require('./config/db');

async function migrate() {
    try {
        console.log("Migrating database...");
        await db.query(`
            ALTER TABLE messages 
            ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
        `);
        console.log("✅ 'is_archived' column added to 'messages' table.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
