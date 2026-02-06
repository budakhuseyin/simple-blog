document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  const isBlogPage = window.location.pathname.includes("blog.html");
  const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://blog1-f397.onrender.com";

  async function fetchPosts() {
    try {
      showSkeleton(); // Yükleme başlarken skeleton göster (Kategoriler beklenmeden)
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get("category");
      let endpoint = `${API_BASE}/api/posts`;

      if (categoryParam) {
        endpoint += `?category=${categoryParam}`;
      }

      // 1. Kategorileri çek
      const categoriesResponse = await fetch(`${API_BASE}/api/categories`);
      const categories = await categoriesResponse.json();
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });

      // 2. Blogları çek

      // 2. Blogları çek
      const response = await fetch(endpoint);
      let posts = await response.json();
      let allPosts = posts; // Orijinal listeyi sakla

      // Tarihe göre sırala
      allPosts = allPosts.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id
      );

      // Blog sayfasında değilsek sadece 4 tane göster, ama arama yapınca hepsini filtreleyeceğiz
      const initialPosts = !isBlogPage ? allPosts.slice(0, 4) : allPosts;

      renderPosts(initialPosts, null, categoryMap, isBlogPage);

      // Arama Dinleyicisi (Header içindeki input'u bekle)
      const checkForSearchInput = setInterval(() => {
        const searchInput = document.querySelector('input[name="search"]');
        const searchForm = document.getElementById('searchForm');

        if (searchInput && searchForm) {
          clearInterval(checkForSearchInput);

          // Eğer anasayfadaysak, formun submit olmasını engelle (enter'a basınca sayfayı yenilemesin)
          if (!isBlogPage) {
            searchForm.addEventListener("submit", (e) => {
              e.preventDefault();
            });
          }

          searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filteredPosts = allPosts.filter(post =>
              post.title.toLowerCase().includes(query) ||
              post.content.toLowerCase().includes(query)
            );

            // Eğer arama kutusu doluysa hepsini filtrele
            if (query.length > 0) {
              renderPosts(filteredPosts, null, categoryMap, false); // false = featured post'u iptal et
            } else {
              renderPosts(initialPosts, null, categoryMap, isBlogPage); // Orijinal haline dön
            }
          });
        }
      }, 500); // Yarım saniyede bir kontrol et (Header yüklenene kadar)

    } catch (error) {
      console.error("Blogları alırken hata oluştu:", error);
      postsContainer.innerHTML = `<p style="color:red;">Bloglar yüklenemedi.</p>`;
    }
  }

  function showSkeleton() {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "";

    // 6 tane boş skeleton kart oluştur
    const skeletonHTML = `
      <div class="blog-card skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="blog-card-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div class="skeleton skeleton-meta"></div>
          </div>
      </div>
    `.repeat(6);

    postsContainer.innerHTML = skeletonHTML;
  }

  function renderPosts(postsToRender, _, categoryMap, enableFeatured) {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "";

    if (postsToRender.length === 0) {
      postsContainer.innerHTML = "<p style='text-align:center; width:100%; color:#666;'>Aradığınız kriterlere uygun yazı bulunamadı.</p>";
      return;
    }

    postsToRender.forEach((post, index) => {
      console.log("Post Data:", post); // Debugging slug issue
      const imageUrl = post.image_url?.startsWith("http")
        ? post.image_url
        : `${API_BASE}${post.image_url || "/uploads/default.jpg"}`;

      const categoryName = categoryMap[post.category_id] || 'Genel';

      const postElement = document.createElement("div");

      // Sadece ilk yüklemede ve anasayfada featured olsun, aramada olmasın
      if (enableFeatured && index === 0) {
        postElement.classList.add("featured-post");
      } else {
        postElement.classList.add("blog-card");
      }

      postElement.setAttribute("data-id", post.id);

      postElement.innerHTML = `
          <div class="blog-card-image">
              <span class="category-pill">${categoryName}</span>
              <img src="${imageUrl}" alt="${post.title}">
          </div>
          <div class="blog-card-content">
              <h3>${post.title}</h3>
              <p>${post.content.substring(0, 100)}...</p>
              <small>
                Yazar: ${post.author_name || 'Bilinmiyor'} | 
                📅 ${new Date(post.created_at).toLocaleDateString()} | 
                ⏱️ ${Math.ceil(post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200)} dk
              </small>
          </div>
        `;

      postElement.addEventListener("click", () => {
        const identifier = post.slug ? `slug=${post.slug}` : `id=${post.id}`;
        window.location.href = `/user/blog-detail.html?${identifier}`;
      });

      postsContainer.appendChild(postElement);
    });
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
