const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load .env explicitly given script location
const db = require('../config/db');

async function migrateSlugs() {
    try {
        console.log("Starting migration...");

        console.log("Current working directory:", process.cwd());
        console.log("Database URL is defined:", !!process.env.DATABASE_URL);
        if (process.env.DATABASE_URL) console.log("Database details:", process.env.DATABASE_URL.split('@')[1]); // Hide credentials

        // 1. Add slug column if it doesn't exist
        await db.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    `);
        console.log("Checked/Added 'slug' column.");

        // 2. Fetch all posts without slugs
        const res = await db.query("SELECT id, title FROM posts WHERE slug IS NULL");
        const posts = res.rows;
        console.log(`Found ${posts.length} posts to update.`);

        for (const post of posts) {
            let baseSlug = post.title
                .toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
                .trim()
                .replace(/\s+/g, '-'); // Replace spaces with dashes

            let slug = baseSlug;
            let counter = 1;

            // Ensure uniqueness
            while (true) {
                const check = await db.query("SELECT id FROM posts WHERE slug = $1 AND id != $2", [slug, post.id]);
                if (check.rows.length === 0) break;
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            await db.query("UPDATE posts SET slug = $1 WHERE id = $2", [slug, post.id]);
            console.log(`Updated post ${post.id}: ${slug}`);
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateSlugs();
