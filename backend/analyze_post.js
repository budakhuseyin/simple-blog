const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function analyzePost() {
    try {
        console.log("Fetching post with slug 'gsxdfg'...\n");

        const res = await pool.query("SELECT id, title, content, image_public_id FROM posts WHERE slug = $1", ['gsxdfg']);

        if (res.rows.length === 0) {
            console.log("Post not found!");
            process.exit(1);
        }

        const post = res.rows[0];
        console.log("=".repeat(80));
        console.log(`POST ID: ${post.id}`);
        console.log(`TITLE: ${post.title}`);
        console.log(`COVER IMAGE ID: ${post.image_public_id || 'None'}`);
        console.log("=".repeat(80));
        console.log("\n--- RAW CONTENT (first 500 chars) ---");
        console.log(post.content.substring(0, 500));
        console.log("\n--- FULL CONTENT ---");
        console.log(post.content);
        console.log("\n" + "=".repeat(80));

        // Test current deletion logic
        const content = post.content;

        console.log("\n--- TESTING DELETION LOGIC ---\n");

        // HTML Entity Decode
        const decodedContent = content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');

        console.log("Content decoded for HTML entities.");

        // Regex
        const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
        let match;
        const publicIdsToDelete = [];
        let matchCount = 0;

        while ((match = imgRegex.exec(decodedContent)) !== null) {
            matchCount++;
            const src = match[1];
            console.log(`\n[Match ${matchCount}] Found image SRC:`);
            console.log(`  ${src}`);

            if (src.includes("cloudinary.com") && src.includes("blog_images/")) {
                try {
                    const urlParts = src.split('/');
                    const fileNameWithExt = urlParts[urlParts.length - 1];
                    console.log(`  Filename with ext: ${fileNameWithExt}`);

                    const lastDotIndex = fileNameWithExt.lastIndexOf(".");

                    if (lastDotIndex !== -1) {
                        const fileName = fileNameWithExt.substring(0, lastDotIndex);
                        const publicId = `blog_images/${fileName}`;
                        publicIdsToDelete.push(publicId);
                        console.log(`  ✅ Extracted Public ID: ${publicId}`);

                        // Check if it exists in Cloudinary
                        try {
                            const result = await cloudinary.api.resource(publicId);
                            console.log(`  ✅ EXISTS in Cloudinary (format: ${result.format})`);
                        } catch (err) {
                            console.log(`  ❌ NOT FOUND in Cloudinary: ${err.error?.message || err.message}`);
                        }
                    } else {
                        console.log(`  ⚠️ No extension found`);
                    }
                } catch (parseErr) {
                    console.log(`  ❌ Parse error: ${parseErr.message}`);
                }
            } else {
                console.log(`  ⏭️ Skipped (not Cloudinary blog_images)`);
            }
        }

        console.log("\n" + "=".repeat(80));
        console.log(`SUMMARY: Found ${matchCount} image(s) total`);
        console.log(`Public IDs to delete: ${publicIdsToDelete.length}`);
        if (publicIdsToDelete.length > 0) {
            console.log("List:");
            publicIdsToDelete.forEach(id => console.log(`  - ${id}`));
        }
        console.log("=".repeat(80));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

analyzePost();
