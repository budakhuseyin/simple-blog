document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const form = document.getElementById("edit-post-form");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const successMessage = document.getElementById("success-message");
  const token = localStorage.getItem("adminToken");

  if (!postId) {
    alert("Geçersiz blog ID!");
    window.location.href = "manage-posts.html";
    return;
  }

  if (!token) {
    alert("Yetkisiz erişim! Lütfen giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  const API_BASE = "https://blog1-f397.onrender.com/api";

  // Blog verisini çek
  try {
    const response = await fetch(`${API_BASE}/posts/${postId}`);
    if (!response.ok) throw new Error("Veri çekilemedi!");
    const post = await response.json();

    titleInput.value = post.title || "";
    CKEDITOR.instances.content.setData(post.content || ""); // CKEditor içeriği set
  } catch (error) {
    console.error("Veri çekme hatası:", error);
  }

  // Form gönderme
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", titleInput.value);
    formData.append("content", CKEDITOR.instances.content.getData());

    if (imageInput && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      successMessage.textContent = data.success
        ? "✅ Blog başarıyla güncellendi!"
        : "❌ Güncelleme başarısız!";
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      successMessage.textContent = "⚠️ Sunucu hatası!";
    }
  });
});

// Çıkış
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
});
