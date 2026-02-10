document.addEventListener("DOMContentLoaded", () => {
  waitForMenuElements(() => {
    setupMenu();
    initTheme(); // Menü (ve header) yüklendikten sonra temayı başlat
  });
});

function initTheme() {
  const toggleBtns = document.querySelectorAll("#theme-toggle, #desktop-theme-toggle");
  const currentTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Kayıtlı tema varsa onu kullan, yoksa sistem tercihine bak
  if (currentTheme === "dark" || (!currentTheme && prefersDark)) {
    document.body.classList.add("dark-mode");
    toggleBtns.forEach(btn => btn.textContent = "☀️");
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      let theme = "light";

      if (document.body.classList.contains("dark-mode")) {
        theme = "dark";
        toggleBtns.forEach(b => b.textContent = "☀️");
      } else {
        toggleBtns.forEach(b => b.textContent = "🌙");
      }
      localStorage.setItem("theme", theme);
    });
  });
}

function waitForMenuElements(callback) {
  const observer = new MutationObserver(() => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function setupMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
      if (!menuToggle.contains(event.target) && !navLinks.contains(event.target)) {
        navLinks.classList.remove("active");
      }
    });

    // Mobil Dropdown Toggle Logic
    const dropdowns = document.querySelectorAll(".dropdown > a");
    dropdowns.forEach(dropdownToggle => {
      dropdownToggle.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) { // Only on mobile
          e.preventDefault(); // Prevent navigation
          const parent = dropdownToggle.parentElement;
          parent.classList.toggle("active"); // Toggle visibility via CSS
        }
      });
    });
  }

  fetchCategoriesForDropdown();
}

async function fetchCategoriesForDropdown() {
  try {
    const response = await fetch("https://blog1-f397.onrender.com/api/categories"); // ✅ GÜNCELLENDİ
    const categories = await response.json();

    const dropdownList = document.getElementById("blogCategories");
    if (!dropdownList) return;

    dropdownList.innerHTML = "";

    const allBlogsLi = document.createElement("li");
    const allBlogsA = document.createElement("a");
    allBlogsA.textContent = "Tüm Bloglar";
    allBlogsA.href = "/user/blog.html";
    allBlogsLi.appendChild(allBlogsA);
    dropdownList.appendChild(allBlogsLi);

    categories.forEach(cat => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = cat.name;
      a.href = `/user/blog.html?category=${cat.id}`;
      li.appendChild(a);
      dropdownList.appendChild(li);
    });
  } catch (error) {
    console.error("Kategorileri çekerken hata oluştu:", error);
  }
}
