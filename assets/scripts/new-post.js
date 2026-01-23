document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("new-post-form");
  const successMessage = document.getElementById("success-message");
  const token = localStorage.getItem("adminToken");
  const categorySelect = document.getElementById("category");
  const API_BASE = "https://blog1-f397.onrender.com/api";

  if (!token) {
    alert("Yetkisiz erişim! Lütfen giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  // Kategorileri yükle
  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const categories = await response.json();

      categorySelect.innerHTML = "";
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Kategori yükleme hatası:", error);
    }
  }

  loadCategories();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("content", CKEDITOR.instances.content.getData());
    formData.append("category_id", categorySelect.value);

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // JWT'den author_id çıkar
      const decoded = JSON.parse(atob(token.split(".")[1]));
      formData.append("author_id", decoded.id); // veya decoded.user_id

      const response = await fetch(`${API_BASE}/posts/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log("API Yanıtı:", data);

      if (data.success) {
        successMessage.textContent = "✅ Blog başarıyla yayınlandı!";
        form.reset();
        setTimeout(() => {
          window.location.href = "manage-posts.html";
        }, 1500);
      } else {
        successMessage.textContent = "❌ Blog eklenirken hata oluştu!";
      }
    } catch (error) {
      console.error("Hata:", error);
      successMessage.textContent = "⚠️ Sunucu hatası!";
    }
  });

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
  });
});
