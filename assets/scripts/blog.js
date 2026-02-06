document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://blog1-f397.onrender.com";

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  const searchTerm = urlParams.get("search")?.toLowerCase();

  let endpoint = `${API_BASE}/api/posts`;
  if (categoryParam) {
    endpoint += `?category=${categoryParam}`;
  }

  try {
    const response = await fetch(endpoint);
    let posts = await response.json();

    if (searchTerm) {
      posts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm) ||
        post.content?.toLowerCase().includes(searchTerm)
      );
    }

    postsContainer.innerHTML = "";

    if (posts.length === 0) {
      postsContainer.innerHTML = `<p style="text-align:center; font-weight:bold;">Aradığınız kriterlere uygun blog bulunamadı.</p>`;
      return;
    }

    posts.forEach(post => {
      const imageUrl = post.image_url?.startsWith("http")
        ? post.image_url
        : `${API_BASE}${post.image_url || "/uploads/default.jpg"}`;


      const postElement = document.createElement("div");
      postElement.classList.add("blog-card");

      postElement.innerHTML = `
        <div class="blog-card-image">
            <img src="${imageUrl}" alt="${post.title}">
        </div>
        <div class="blog-card-content">
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 100)}...</p>
            <div class="devamini-oku-wrapper">
                <a href="blog-detail.html?${post.slug ? 'slug=' + post.slug : 'id=' + post.id}" class="devamini-oku">Devamını Oku</a>
            </div>
            <small>
                Yazar: ${post.author_name || 'Bilinmiyor'} | 
                📅 ${new Date(post.created_at).toLocaleDateString()} | 
                ⏱️ ${Math.ceil(post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200)} dk
            </small>
        </div>
      `;

      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error("Hata oluştu:", error);
    postsContainer.innerHTML = `<p style="color:red;">Bloglar yüklenemedi.</p>`;
  }
});
