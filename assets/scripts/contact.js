
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const submitBtn = contactForm.querySelector("button[type='submit']");

        if (!name || !email || !message) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        // Butonu devre dışı bırak
        submitBtn.disabled = true;
        submitBtn.textContent = "Gönderiliyor...";

        try {
            const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000"
                : "https://blog1-f397.onrender.com";

            const res = await fetch(`${API_BASE}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.");
                contactForm.reset();
            } else {
                alert("Hata: " + (data.error || "Mesaj gönderilemedi."));
            }
        } catch (error) {
            console.error("İletişim hatası:", error);
            alert("Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Gönder";
        }
    });
});
