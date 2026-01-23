// admin-dashboard.js

// Token kontrolü
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "login.html";
}

// Çıkış butonu
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
});
