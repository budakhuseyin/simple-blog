document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  const isBlogPage = window.location.pathname.includes("blog.html");
  const API_BASE = "https://blog1-f397.onrender.com";

  async function fetchPosts() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get("category");
      let endpoint = `${API_BASE}/api/posts`;

      if (categoryParam) {
        endpoint += `?category=${categoryParam}`;
      }

      const response = await fetch(endpoint);
      let posts = await response.json();

      posts = posts.sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at) || b.id - a.id
      );

      if (!isBlogPage) {
        posts = posts.slice(0, 4);
      }

      postsContainer.innerHTML = "";

      posts.forEach((post) => {
        const imageUrl = post.image_url?.startsWith("http")
        ? post.image_url
        : `${API_BASE}${post.image_url || "/uploads/default.jpg"}`;


        const categoryInfo = post.category_id
          ? `<br><small>Kategori: ${post.category_id}</small>`
          : "";

        const postElement = document.createElement("div");
        postElement.classList.add("blog-card");
        postElement.setAttribute("data-id", post.id);

        postElement.innerHTML = `
          <div class="blog-card-image">
              <img src="${imageUrl}" alt="${post.title}">
          </div>
          <div class="blog-card-content">
              <h3>${post.title}</h3>
              <p>${post.content.substring(0, 100)}...</p>
              <div class="devamini-oku-wrapper">
                  <a href="/user/blog-detail.html?id=${post.id}" class="devamini-oku">Devamını Oku</a>
              </div>
              <small>Yazar ID: ${post.author_id} | Yayınlanma: ${new Date(post.created_at).toLocaleDateString()}</small>
              ${categoryInfo}
          </div>
        `;
        postsContainer.appendChild(postElement);
      });
    } catch (error) {
      console.error("Blogları alırken hata oluştu:", error);
      postsContainer.innerHTML = `<p style="color:red;">Bloglar yüklenemedi.</p>`;
    }
  }

  fetchPosts();
});

// ------------------------------------------
// SLIDER KISMI
// ------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelector(".slides");
  const slideWidth = document.querySelector(".slide")?.clientWidth || 0;
  let index = 0;

  document.querySelector(".next")?.addEventListener("click", () => {
    index++;
    if (index >= slides.children.length) index = 0;
    slides.style.transform = `translateX(-${index * slideWidth}px)`;
  });

  document.querySelector(".prev")?.addEventListener("click", () => {
    index--;
    if (index < 0) index = slides.children.length - 1;
    slides.style.transform = `translateX(-${index * slideWidth}px)`;
  });

  setInterval(() => {
    index++;
    if (index >= slides.children.length) index = 0;
    slides.style.transform = `translateX(-${index * slideWidth}px)`;
  }, 5000);
});

// ------------------------------------------
// SCROLL ANİMASYONU
// ------------------------------------------
function revealOnScroll() {
  const elements = document.querySelectorAll(".hidden");
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if (elementTop < windowHeight * 0.85) {
      element.classList.add("show");
    }
  });
}
window.addEventListener("scroll", revealOnScroll);
document.addEventListener("DOMContentLoaded", revealOnScroll);
