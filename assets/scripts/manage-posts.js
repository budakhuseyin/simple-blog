document.addEventListener("DOMContentLoaded", async () => {
  const postsTableBody = document.querySelector("#posts-table tbody");
  const token = localStorage.getItem("adminToken");
  const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://blog1-f397.onrender.com/api";

  if (!token) {
    alert("Yetkisiz erişim! Lütfen giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const posts = await response.json();

    postsTableBody.innerHTML = "";

    posts.forEach(post => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${new Date(post.created_at).toLocaleDateString("tr-TR")}</td>
        <td class="action-buttons">
          <button class="edit-btn" onclick="editPost(${post.id})">Düzenle</button>
          <button class="delete-btn" onclick="deletePost(${post.id})">Sil</button>
        </td>
      `;
      postsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Veri çekme hatası:", error);
  }
});

async function deletePost(postId) {
  const token = localStorage.getItem("adminToken");
  const API_BASE = "https://blog1-f397.onrender.com/api";

  if (!confirm("Bu blogu silmek istediğinizden emin misiniz?")) return;

  try {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      alert("Blog başarıyla silindi!");
      location.reload();
    } else {
      alert("Silme işlemi başarısız!");
    }
  } catch (error) {
    console.error("Silme hatası:", error);
  }
}

function editPost(postId) {
  window.location.href = `edit-post.html?id=${postId}`;
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
});
