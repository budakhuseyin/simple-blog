const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function diagnose() {
    console.log("--- DIAGNOSTIC STARTED ---");

    try {
        // 1. Get Latest Post
        console.log("Connecting to DB...");
        const res = await pool.query("SELECT id, title, content FROM posts ORDER BY id DESC LIMIT 1");
        if (res.rows.length === 0) {
            console.log("No posts found in DB.");
            return;
        }

        const post = res.rows[0];
        console.log(`Analyzing Post ID: ${post.id}, Title: ${post.title}`);
        console.log("Content Preview:", post.content.substring(0, 100) + "...");

        const content = post.content;
        const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
        let match;

        console.log("\n--- REGEX MATCHING & CLOUDINARY CHECK ---");
        while ((match = imgRegex.exec(content)) !== null) {
            const src = match[1];
            console.log(`\nFound Image URL: ${src}`);

            if (src.includes("cloudinary.com")) {
                try {
                    // Attempt parsing
                    const urlParts = src.split('/');
                    const fileNameWithExt = urlParts[urlParts.length - 1]; // e.g. "image_123.jpg"
                    const lastDotIndex = fileNameWithExt.lastIndexOf(".");
                    let publicId = "";

                    if (lastDotIndex !== -1) {
                        const fileName = fileNameWithExt.substring(0, lastDotIndex);
                        // We assume it's in blog_images based on current logic, but let's see
                        if (src.includes("blog_images/")) {
                            publicId = `blog_images/${fileName}`;
                        } else {
                            publicId = fileName; // Fallback
                        }
                        console.log(`Generated Public ID: "${publicId}"`);
                    } else {
                        console.log("Could not parse extension.");
                        continue;
                    }

                    // 2. Check existence in Cloudinary
                    console.log(`[Cloudinary API] Checking resource: ${publicId}...`);
                    try {
                        // We use 'upload' resource type usually
                        const result = await cloudinary.api.resource(publicId);
                        console.log("✅ FOUND in Cloudinary:", result.public_id);
                        console.log("   Format:", result.format);
                        console.log("   Type:", result.type);
                    } catch (err) {
                        console.log("❌ NOT FOUND. API Error:", err.error?.message || err.message);
                    }

                } catch (parseErr) {
                    console.error("Parse Error:", parseErr);
                }
            } else {
                console.log("Ignored (not Cloudinary).");
            }
        }

        // 3. List actual files in folder to compare
        console.log("\n--- LISTING ACTUAL FILES IN 'blog_images' ---");
        try {
            const resources = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'blog_images',
                max_results: 10,
                direction: 'desc'
            });
            console.log("Most recent 10 files in Cloudinary:");
            resources.resources.forEach(r => console.log(` - ${r.public_id} (${r.secure_url})`));
        } catch (err) {
            console.log("Could not list resources:", err.message);
        }

        console.log("\n--- DIAGNOSTIC FINISHED ---");
        process.exit(0);

    } catch (error) {
        console.error("Diagnostic Failed:", error);
        process.exit(1);
    }
}

diagnose();
