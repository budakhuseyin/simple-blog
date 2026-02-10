document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("new-post-form");
  const successMessage = document.getElementById("success-message");
  const token = localStorage.getItem("adminToken");
  const categorySelect = document.getElementById("category");
  const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://blog1-f397.onrender.com/api";

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

    // Quill içeriğini al
    const content = quill.root.innerHTML;
    formData.append("content", content);

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
