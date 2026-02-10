const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function testDeletion() {
    // These are the IDs we extracted from the post
    const testIds = [
        "blog_images/image_1770750492185",
        "blog_images/image_1770750502562"
    ];

    console.log("Testing Cloudinary deletion API...\n");

    for (const publicId of testIds) {
        console.log(`Attempting to delete: ${publicId}`);
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log(`  Result:`, result);

            if (result.result === 'ok') {
                console.log(`  ✅ Successfully deleted!`);
            } else if (result.result === 'not found') {
                console.log(`  ⚠️ Not found (already deleted or wrong ID)`);
            } else {
                console.log(`  ❓ Unexpected result: ${result.result}`);
            }
        } catch (error) {
            console.log(`  ❌ Error:`, error.message);
        }
        console.log();
    }

    console.log("Test complete. Check Cloudinary dashboard to verify.");
    process.exit(0);
}

testDeletion();
