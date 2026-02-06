document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get("id");

    if (!blogId) {
        console.error("Blog ID bulunamadı!");
        return;
    }

    console.log("Blog ID:", blogId); // ✅ Blog ID'yi konsola yaz

    async function fetchBlogDetails() {
        try {
            const response = await fetch(`https://blog1-f397.onrender.com/api/posts/${blogId}`);
            const blog = await response.json();

            console.log("Gelen Blog Verisi:", blog); // ✅ API'den gelen veriyi kontrol et

            if (!blog || !blog.title) {
                console.error("Blog bulunamadı veya hatalı!");
                return;
            }

            document.getElementById("blog-title").textContent = blog.title;
            document.getElementById("blog-content").innerHTML = blog.content;
            document.getElementById("blog-meta").textContent = `Yazar ID: ${blog.author_id} | Yayınlanma: ${new Date(blog.created_at).toLocaleDateString()}`;

            const blogImage = document.getElementById("blog-image");
            if (blog.image_url?.startsWith("http")) {
                blogImage.src = blog.image_url;
            } else {
                blogImage.src = blog.image_url?.startsWith("http")
                    ? blog.image_url
                    : `https://blog1-f397.onrender.com${blog.image_url || "/uploads/default.jpg"}`;

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
