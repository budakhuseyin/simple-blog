document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const commentForm = document.getElementById("commentForm");
  const commentsList = document.getElementById("comments-list");
  const messageBox = document.getElementById("comment-message");

  const API_BASE = "https://blog1-f397.onrender.com/api";

  if (!postId) {
    // ID yoksa slug var mı bak?
    const slug = urlParams.get("slug");
    if (slug) {
      // Slug varsa ID'yi sunucudan öğrenmemiz gerek
      fetch(`${API_BASE}/posts/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            // ID'yi bulduk, global değişkene ata ve yorumları çek
            window.currentPostId = data.id;
            fetchComments(data.id);
          } else {
            console.error("Slug ile post bulunamadı");
          }
        })
        .catch(err => console.error("Post ID çözülemedi:", err));

      // Return etme, fetchComments içinde ID kontrolü yapacağız veya parametre olarak geçeceğiz
    } else {
      console.warn("Post ID veya Slug eksik.");
    }
  } else {
    // ID varsa direkt kullan
    window.currentPostId = postId;
    fetchComments(postId);
  }

  // XSS koruması
  function sanitize(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  // Yorumları listele
  async function fetchComments(id) {
    // Eğer ID parametre olarak gelmediyse globalden al
    const targetId = id || window.currentPostId;
    if (!targetId) return;

    try {
      const res = await fetch(`${API_BASE}/comments?post_id=${targetId}`);
      const comments = await res.json();

      if (!Array.isArray(comments)) throw new Error("Yorumlar listelenemedi");

      commentsList.innerHTML = comments.length > 0
        ? comments.map(c => `
            <div class="comment">
              <div class="comment-header">
                <span class="comment-name">👤 ${sanitize(c.name)}</span>
                <span class="comment-date">${formatDate(c.created_at)}</span>
              </div>
              <p class="comment-text">${sanitize(c.comment)}</p>
            </div>
        `).join("")
        : "<p>Henüz yorum yapılmamış.</p>";
    } catch (err) {
      console.error("Yorumlar çekilemedi:", err);
      commentsList.innerHTML = "<p style='color:red;'>Yorumlar yüklenemedi.</p>";
    }
  }

  // Yorum gönder
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageBox.innerHTML = "";

    const name = document.getElementById("commenterName").value.trim();
    const comment = document.getElementById("commentText").value.trim();

    if (!name || !comment) {
      messageBox.innerHTML = `<p style="color: red;">Ad ve yorum boş olamaz.</p>`;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: window.currentPostId, name, comment })
      });

      if (!res.ok) throw new Error("Gönderim başarısız");

      commentForm.reset();
      messageBox.innerHTML = `<p style="color: green;">✅ Yorum gönderildi.</p>`;
      fetchComments(window.currentPostId);
    } catch (err) {
      console.error("Yorum gönderme hatası:", err);
      messageBox.innerHTML = `<p style="color:red;">❌ Gönderim başarısız.</p>`;
    }
  });

  fetchComments();
});
