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

  // Quill Editor Kurulumu
  // Quill Editor Kurulumu
  var quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link', 'image'],
          ['clean']
        ],
        handlers: {
          image: selectLocalImage
        }
      }
    }
  });

  // 1. Toolbar butonuna tıklanınca çalışır
  function selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (/^image\//.test(file.type)) {
        saveToServer(file);
      } else {
        console.warn('Sadece resim dosyası yükleyebilirsiniz.');
      }
    };
  }

  // 2. Sunucuya Yükleme Fonksiyonu
  async function saveToServer(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE}/posts/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        insertToEditor(data.url);
      } else {
        alert('Resim yüklenemedi: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Resim yüklenirken hata oluştu.');
    }
  }

  // 3. Editöre Ekleme Yardımcısı
  function insertToEditor(url) {
    const range = quill.getSelection();
    quill.insertEmbed(range ? range.index : 0, 'image', url);
  }

  // 4. Sürükle-Bırak (Drag & Drop) Desteği
  quill.root.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        saveToServer(file);
      }
    }
  });

  // 5. Yapıştırma (Paste) Desteği
  quill.root.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault(); // Base64 yapıştırmayı engelle
          const file = items[i].getAsFile();
          saveToServer(file);
          return; // İlk resmi al ve çık
        }
      }
    }
  });

  const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://blog1-f397.onrender.com/api";

  // Blog verisini çek
  try {
    const response = await fetch(`${API_BASE}/posts/${postId}`);
    if (!response.ok) throw new Error("Veri çekilemedi!");
    const post = await response.json();

    titleInput.value = post.title || "";
    // Quill içeriğini doldur
    if (post.content) {
      quill.root.innerHTML = post.content;
    }
  } catch (error) {
    console.error("Veri çekme hatası:", error);
  }

  // Form gönderme
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", titleInput.value);

    // Quill içeriğini al
    const content = quill.root.innerHTML;
    formData.append("content", content);

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}` // FormData ile Content-Type header'ı ekleme!
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        successMessage.textContent = "✅ Blog başarıyla güncellendi!";
        setTimeout(() => {
          window.location.href = "manage-posts.html";
        }, 1500);
      } else {
        successMessage.textContent = "❌ Güncelleme başarısız!";
      }
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
