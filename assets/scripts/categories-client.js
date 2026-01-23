document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  const API_BASE = "https://blog1-f397.onrender.com/api";

  if (!token) {
    alert("Yetkisiz erişim! Lütfen giriş yapın.");
    window.location.href = "login.html";
    return;
  }

  fetchCategories();

  document.getElementById("add-category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById("category-name").value.trim();
    if (categoryName === "") return;

    try {
      const response = await fetch(`${API_BASE}/categories/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      });
      const result = await response.json();
      if (result.success) {
        document.getElementById("category-name").value = "";
        fetchCategories();
      } else {
        alert("Kategori eklenirken hata oluştu!");
      }
    } catch (error) {
      console.error("Kategori ekleme hatası:", error);
    }
  });

  // Çıkış
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
  });

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const categories = await response.json();
      const categoriesList = document.getElementById("categories-list");
      categoriesList.innerHTML = "";

      categories.forEach(category => {
        const li = document.createElement("li");
        li.textContent = category.name;

        const editButton = document.createElement("button");
        editButton.textContent = "Düzenle";
        editButton.addEventListener("click", () => editCategory(category));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Sil";
        deleteButton.addEventListener("click", () => deleteCategory(category.id));

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        categoriesList.appendChild(li);
      });
    } catch (error) {
      console.error("Kategori listeleme hatası:", error);
    }
  }

  async function deleteCategory(categoryId) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      } else {
        alert("Kategori silinirken hata oluştu!");
      }
    } catch (error) {
      console.error("Kategori silme hatası:", error);
    }
  }

  function editCategory(category) {
    const newName = prompt("Yeni kategori adını girin:", category.name);
    if (!newName || newName.trim() === "") return;
    updateCategory(category.id, newName.trim());
  }

  async function updateCategory(categoryId, newName) {
    try {
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      } else {
        alert("Kategori güncellenirken hata oluştu!");
      }
    } catch (error) {
      console.error("Kategori güncelleme hatası:", error);
    }
  }
});
