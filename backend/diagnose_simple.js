const { Pool } = require("pg");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function diagnose() {
    fs.writeFileSync("diagnose_output.txt", ""); // Clear file
    function log(msg) {
        console.log(msg);
        fs.appendFileSync("diagnose_output.txt", msg + "\n");
    }

    try {
        const res = await pool.query("SELECT content FROM posts ORDER BY id DESC LIMIT 5");

        let foundPost = false;
        for (const row of res.rows) {
            if (row.content && (row.content.includes("<img") || row.content.includes("&lt;img"))) {
                log("--- FOUND POST WITH IMAGES ---");
                log("CONTENT PREVIEW: " + row.content.substring(0, 300));

                // Check for HTML entities
                if (row.content.includes("&lt;img")) {
                    log("!!! WARNING: Content has HTML Entities (&lt;img) !!!");
                    const decoded = row.content.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
                    // log("Decoded Preview: " + decoded.substring(0, 100)); // Optional

                    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
                    let match;
                    while ((match = imgRegex.exec(decoded)) !== null) {
                        log("MATCHED SRC (Decoded): " + match[1]);
                    }
                } else {
                    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
                    let match;
                    while ((match = imgRegex.exec(row.content)) !== null) {
                        log("MATCHED SRC: " + match[1]);

                        // Add public ID extraction simulation
                        if (match[1].includes("cloudinary.com")) {
                            const parts = match[1].split('/');
                            const filename = parts[parts.length - 1];
                            log("  -> Filename: " + filename);
                        }
                    }
                }
                foundPost = true;
                break;
            }
        }

        if (!foundPost) {
            log("No posts with images found in last 5.");
        }

        // Allow time for IO just in case, though sync should be fine
        setTimeout(() => process.exit(0), 500);
    } catch (e) {
        log(e.toString());
        process.exit(1);
    }
}

diagnose();
