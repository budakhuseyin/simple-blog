document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://blog1-f397.onrender.com";
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get("id");
    const blogSlug = urlParams.get("slug");
    const identifier = blogSlug || blogId;

    if (!identifier) {
        console.error("Blog ID veya Slug bulunamadı!");
        return;
    }

    console.log("Blog Identifier:", identifier); // ✅ Blog ID/Slug'i konsola yaz

    async function fetchBlogDetails() {
        try {
            const response = await fetch(`${API_BASE}/api/posts/${identifier}`);
            const blog = await response.json();

            console.log("Gelen Blog Verisi:", blog); // ✅ API'den gelen veriyi kontrol et

            if (!blog || !blog.title) {
                console.error("Blog bulunamadı veya hatalı!");
                return;
            }

            document.getElementById("blog-title").textContent = blog.title;
            document.getElementById("blog-content").innerHTML = blog.content;

            // Reading Time Calculation
            const textContent = blog.content.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
            const wordCount = textContent.trim().split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200);

            document.getElementById("blog-meta").textContent = `Yazar: ${blog.author_name || 'Bilinmiyor'} | Yayınlanma: ${new Date(blog.created_at).toLocaleDateString()} | ⏱️ ${readingTime} dk okuma`;

            // Social Share Links
            const currentUrl = window.location.href;
            const shareText = `Harika bir yazı okudum: ${blog.title}`;

            const shareButtons = document.getElementById("share-buttons");
            shareButtons.innerHTML = `
                <span class="share-label">Paylaş:</span>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}" target="_blank" class="share-btn whatsapp">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                </a>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}" target="_blank" class="share-btn twitter">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    Twitter
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}" target="_blank" class="share-btn linkedin">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                </a>
            `;

            const blogImage = document.getElementById("blog-image");
            if (blog.image_url?.startsWith("http")) {
                blogImage.src = blog.image_url;
            } else {
                blogImage.src = blog.image_url?.startsWith("http")
                    ? blog.image_url
                    : `${API_BASE}${blog.image_url || "/uploads/default.jpg"}`;

            }

        } catch (error) {
            console.error("Blog detaylarını alırken hata oluştu:", error);
        }
    }

    fetchBlogDetails();
});

// ------------------------------------------
// READING PROGRESS BAR
// ------------------------------------------
window.addEventListener("scroll", () => {
    const progressBar = document.getElementById("scroll-progress");
    const blogContent = document.getElementById("blog-detail-container");

    if (progressBar && blogContent) {
        const contentBox = blogContent.getBoundingClientRect();
        const contentHeight = contentBox.height;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const elementTop = blogContent.offsetTop;

        // Calculate progress based on how much of the content has been scrolled past
        // We want 0% when the top of content enters view, and 100% when bottom leaves view (or user finishes reading)
        // Adjusted: 0% at start, 100% when bottom of content aligns with bottom of viewport

        const scrolled = scrollTop + windowHeight - elementTop;
        const percentage = (scrolled / contentHeight) * 100;

        // Clamp between 0 and 100
        const width = Math.min(100, Math.max(0, percentage));

        progressBar.style.width = `${width}%`;
    }
});
