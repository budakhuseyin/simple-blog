const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /sitemap.xml
 * Generate dynamic XML sitemap
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Fetch all published posts
        const result = await db.query(
            'SELECT id, slug, updated_at, created_at FROM posts ORDER BY created_at DESC'
        );
        const posts = result.rows;

        // Static pages
        const staticPages = [
            { url: '/user/index.html', changefreq: 'daily', priority: '1.0' },
            { url: '/user/blog.html', changefreq: 'daily', priority: '0.9' },
            { url: '/user/about.html', changefreq: 'monthly', priority: '0.7' },
            { url: '/user/contact.html', changefreq: 'monthly', priority: '0.6' }
        ];

        // Build XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        staticPages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        // Add blog posts
        posts.forEach(post => {
            const postUrl = post.slug
                ? `${baseUrl}/user/blog-detail.html?slug=${post.slug}`
                : `${baseUrl}/user/blog-detail.html?id=${post.id}`;

            const lastmod = post.updated_at || post.created_at;
            const formattedDate = new Date(lastmod).toISOString().split('T')[0];

            xml += '  <url>\n';
            xml += `    <loc>${postUrl}</loc>\n`;
            xml += `    <lastmod>${formattedDate}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
