document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#commentsTable tbody");
  const API_BASE = "https://blog1-f397.onrender.com/api";
  const token = localStorage.getItem("adminToken");

  if (!token) {
    alert("Yetkisiz erişim! Lütfen giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  // Yorumları listele
  async function fetchComments() {
    try {
      const res = await fetch(`${API_BASE}/comments/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const comments = await res.json();

      tableBody.innerHTML = "";

      comments.forEach(comment => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${comment.id}</td>
          <td>${comment.post_id}</td>
          <td><input type="text" value="${comment.name}" class="edit-name" style="width:100px;"></td>
          <td><textarea class="edit-comment" style="width:100%; height:60px;">${comment.comment}</textarea></td>
          <td>${new Date(comment.created_at).toLocaleString("tr-TR")}</td>
          <td>
            <button class="btn-edit-save" data-id="${comment.id}">Kaydet</button>
            <button class="btn-delete" data-id="${comment.id}">Sil</button>
          </td>
        `;

        tableBody.appendChild(row);
      });

      attachEditEvents();
      attachDeleteEvents();
    } catch (err) {
      console.error("Yorumlar çekilemedi:", err);
    }
  }

  // Güncelleme işlemi
  function attachEditEvents() {
    document.querySelectorAll(".btn-edit-save").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const row = button.closest("tr");
        const name = row.querySelector(".edit-name").value.trim();
        const comment = row.querySelector(".edit-comment").value.trim();

        if (!name || !comment) {
          alert("Ad ve yorum boş bırakılamaz.");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/comments/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, comment })
          });

          if (res.ok) {
            alert("✅ Yorum güncellendi.");
            fetchComments();
          } else {
            alert("Güncelleme başarısız.");
          }
        } catch (err) {
          console.error("Güncelleme hatası:", err);
          alert("Sunucu hatası.");
        }
      });
    });
  }

  // Silme işlemi
  function attachDeleteEvents() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Bu yorumu silmek istiyor musunuz?")) return;

        try {
          const res = await fetch(`${API_BASE}/comments/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.ok) {
            alert("Yorum silindi.");
            fetchComments();
          } else {
            alert("Silme işlemi başarısız.");
          }
        } catch (err) {
          console.error("Silme hatası:", err);
          alert("Sunucu hatası.");
        }
      });
    });
  }

  fetchComments();

  // Çıkış işlemi
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
  });
});
