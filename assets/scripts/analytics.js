/**
 * Google Analytics 4 Integration
 * Tracks page views and custom events
 */

// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with your GA4 Measurement ID

/**
 * Initialize Google Analytics
 */
function initGA() {
    // Only initialize if measurement ID is configured
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.log('Google Analytics not configured. Add your GA4 Measurement ID.');
        return;
    }

    // Load GA4 script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        'send_page_view': true
    });
}

/**
 * Track custom event
 */
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
}

/**
 * Track blog post view
 */
function trackBlogView(postId, postTitle) {
    trackEvent('blog_post_view', {
        'post_id': postId,
        'post_title': postTitle
    });
}

/**
 * Track social share
 */
function trackSocialShare(platform, postTitle) {
    trackEvent('share', {
        'method': platform,
        'content_type': 'blog_post',
        'item_id': postTitle
    });
}

/**
 * Track search
 */
function trackSearch(searchTerm) {
    trackEvent('search', {
        'search_term': searchTerm
    });
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGA);
} else {
    initGA();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGA,
        trackEvent,
        trackBlogView,
        trackSocialShare,
        trackSearch
    };
}
