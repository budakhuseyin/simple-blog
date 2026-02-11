/**
 * SEO Helper Utilities
 * Centralized functions for managing SEO meta tags, Open Graph, Twitter Cards, and Structured Data
 */

// Site configuration - Production domain
const SITE_CONFIG = {
    domain: 'https://blog1-f397.onrender.com',
    siteName: 'Hüseyin Budak Blog',
    defaultImage: '/assets/images/logo.png',
    author: 'Hüseyin Budak',
    twitterHandle: '@yourtwitterhandle', // Update if you have Twitter
    locale: 'tr_TR',
    type: 'website'
};

/**
 * Update page title
 */
function updateTitle(title, includeSiteName = true) {
    const fullTitle = includeSiteName ? `${title} | ${SITE_CONFIG.siteName}` : title;
    document.title = fullTitle;

    // Also update OG title
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('name', 'twitter:title', title);
}

/**
 * Update meta description
 */
function updateMetaDescription(description) {
    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('name', 'twitter:description', description);
}

/**
 * Update canonical URL
 */
function updateCanonicalURL(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Also update OG URL
    updateMetaTag('property', 'og:url', url);
}

/**
 * Update Open Graph image
 */
function updateOGImage(imageUrl, alt = '') {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.domain}${imageUrl}`;
    updateMetaTag('property', 'og:image', fullImageUrl);
    updateMetaTag('property', 'og:image:alt', alt);
    updateMetaTag('name', 'twitter:image', fullImageUrl);
    updateMetaTag('name', 'twitter:image:alt', alt);
}

/**
 * Generic meta tag updater
 */
function updateMetaTag(attribute, attributeValue, content) {
    let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attributeValue);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

/**
 * Add JSON-LD structured data to page
 */
function addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
}

/**
 * Generate BlogPosting structured data
 */
function generateBlogPostingSchema(post) {
    const imageUrl = post.image_url?.startsWith('http')
        ? post.image_url
        : `${SITE_CONFIG.domain}${post.image_url}`;

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt || generateExcerpt(post.content),
        "image": imageUrl,
        "datePublished": post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": {
            "@type": "Person",
            "name": post.author_name || SITE_CONFIG.author,
            "url": SITE_CONFIG.domain
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_CONFIG.siteName,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_CONFIG.domain}${SITE_CONFIG.defaultImage}`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };
}

/**
 * Generate Organization structured data
 */
function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_CONFIG.siteName,
        "url": SITE_CONFIG.domain,
        "logo": `${SITE_CONFIG.domain}${SITE_CONFIG.defaultImage}`,
        "description": "Yazılım, siber güvenlik, teknoloji ve kişisel deneyimler hakkında blog yazıları",
        "founder": {
            "@type": "Person",
            "name": SITE_CONFIG.author
        },
        "sameAs": [
            // TODO: Add your social media profiles
            // "https://twitter.com/yourhandle",
            // "https://linkedin.com/in/yourprofile"
        ]
    };
}

/**
 * Generate WebSite structured data with search action
 */
function generateWebSiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_CONFIG.siteName,
        "url": SITE_CONFIG.domain,
        "description": "Yazılım, siber güvenlik ve teknoloji blogu",
        "publisher": {
            "@type": "Organization",
            "name": SITE_CONFIG.siteName
        }
    };
}

/**
 * Generate BreadcrumbList structured data
 */
function generateBreadcrumbSchema(items) {
    const listItems = items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
    }));

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": listItems
    };
}

/**
 * Generate Person structured data (for About page)
 */
function generatePersonSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": SITE_CONFIG.author,
        "url": SITE_CONFIG.domain,
        "description": "Yazılım mühendisliği öğrencisi, siber güvenlik meraklısı",
        "jobTitle": "Yazılım Mühendisliği Öğrencisi",
        "alumniOf": "Aksaray Üniversitesi",
        "sameAs": [
            // TODO: Add your social profiles
        ]
    };
}

/**
 * Generate excerpt from HTML content
 */
function generateExcerpt(htmlContent, maxLength = 160) {
    const text = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Initialize SEO for blog post detail page
 */
function initBlogPostSEO(post) {
    // Update title
    updateTitle(post.title);

    // Generate and update meta description
    const description = post.excerpt || generateExcerpt(post.content);
    updateMetaDescription(description);

    // Update canonical URL
    const canonicalUrl = post.slug
        ? `${SITE_CONFIG.domain}/user/blog-detail.html?slug=${post.slug}`
        : `${SITE_CONFIG.domain}/user/blog-detail.html?id=${post.id}`;
    updateCanonicalURL(canonicalUrl);

    // Update OG image
    if (post.image_url) {
        updateOGImage(post.image_url, post.image_alt || post.title);
    }

    // Add BlogPosting structured data
    addStructuredData(generateBlogPostingSchema(post));

    // Add breadcrumb
    const breadcrumbs = [
        { name: 'Ana Sayfa', url: `${SITE_CONFIG.domain}/user/index.html` },
        { name: 'Blog', url: `${SITE_CONFIG.domain}/user/blog.html` },
        { name: post.title, url: canonicalUrl }
    ];
    addStructuredData(generateBreadcrumbSchema(breadcrumbs));

    // Update Open Graph type
    updateMetaTag('property', 'og:type', 'article');
    updateMetaTag('property', 'article:published_time', post.created_at);
    if (post.updated_at) {
        updateMetaTag('property', 'article:modified_time', post.updated_at);
    }
    updateMetaTag('property', 'article:author', post.author_name || SITE_CONFIG.author);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateTitle,
        updateMetaDescription,
        updateCanonicalURL,
        updateOGImage,
        updateMetaTag,
        addStructuredData,
        generateBlogPostingSchema,
        generateOrganizationSchema,
        generateWebSiteSchema,
        generateBreadcrumbSchema,
        generatePersonSchema,
        generateExcerpt,
        initBlogPostSEO,
        SITE_CONFIG
    };
}
