document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
    const response = await fetch("https://blog1-f397.onrender.com/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("adminToken", data.token);
            window.location.href = "dashboard.html"; // Admin paneline yönlendirme
        } else {
            errorMessage.textContent = "Hatalı kullanıcı adı veya şifre!";
        }
    } catch (error) {
        console.error("Giriş hatası:", error);
        errorMessage.textContent = "Sunucu hatası!";
    }
});
