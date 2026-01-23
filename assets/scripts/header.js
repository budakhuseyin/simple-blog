document.addEventListener("DOMContentLoaded", () => {
  waitForMenuElements(setupMenu);
});

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
