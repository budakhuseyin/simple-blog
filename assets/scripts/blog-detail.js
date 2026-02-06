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
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;

    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
        progressBar.style.width = `${scrolled}%`;
    }
});
