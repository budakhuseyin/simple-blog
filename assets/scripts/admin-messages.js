
let currentTab = 'inbox'; // Varsayılan sekme

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadMessages();
});

function checkAuth() {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        window.location.href = "login.html";
    }
}

function switchTab(tab) {
    currentTab = tab;

    // Update active tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) btn.classList.add('active');
    });

    loadMessages();
}

async function loadMessages() {
    const messagesList = document.getElementById("messages-list");
    messagesList.innerHTML = '<p class="loading">Yükleniyor...</p>';

    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://blog1-f397.onrender.com";

    const token = localStorage.getItem("adminToken");

    try {
        const res = await fetch(`${API_BASE}/api/contact?type=${currentTab}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Mesajlar alınamadı");

        const messages = await res.json();

        if (messages.length === 0) {
            messagesList.innerHTML = `<p class="empty-state">📭 ${currentTab === 'inbox' ? 'Gelen kutusu boş.' : 'Arşivlenmiş mesaj yok.'}</p>`;
            return;
        }

        messagesList.innerHTML = messages.map(msg => createMessageCard(msg)).join("");

    } catch (error) {
        console.error("Hata:", error);
        messagesList.innerHTML = `<p class="empty-state" style="color:red">Hata oluştu.</p>`;
    }
}

function createMessageCard(msg) {
    const isInbox = currentTab === 'inbox';

    // Action Buttons
    const archiveBtn = isInbox
        ? `<button onclick="toggleArchive(${msg.id}, true)" class="icon-btn archive" title="Arşivle"><i class="fas fa-archive"></i></button>`
        : `<button onclick="toggleArchive(${msg.id}, false)" class="icon-btn restore" title="Geri Al"><i class="fas fa-undo"></i></button>`;

    const deleteBtn = `<button onclick="deleteMessage(${msg.id})" class="icon-btn delete" title="Sil"><i class="fas fa-trash"></i></button>`;

    return `
        <div class="message-card">
            <div class="message-header">
                <div class="message-info">
                    <span class="message-sender">${escapeHtml(msg.name)}</span>
                    <span class="message-email">${escapeHtml(msg.email)}</span>
                </div>
                <div class="message-actions">
                    <span class="message-date">${new Date(msg.created_at).toLocaleString('tr-TR')}</span>
                    <div class="btn-group">
                        ${archiveBtn}
                        ${deleteBtn}
                    </div>
                </div>
            </div>
            <div class="message-body">${escapeHtml(msg.message)}</div>
        </div>
    `;
}

async function toggleArchive(id, archiveStatus) {
    if (!confirm(archiveStatus ? "Bu mesajı arşivlemek istiyor musunuz?" : "Bu mesajı gelen kutusuna geri almak istiyor musunuz?")) return;

    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://blog1-f397.onrender.com";

    try {
        const res = await fetch(`${API_BASE}/api/contact/${id}/archive`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ archived: archiveStatus })
        });

        if (res.ok) {
            loadMessages(); // Refresh list
        } else {
            alert("İşlem başarısız.");
        }
    } catch (error) {
        console.error("Hata:", error);
    }
}

async function deleteMessage(id) {
    if (!confirm("Bu mesajı KALICI OLARAK silmek istediğinize emin misiniz?")) return;

    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://blog1-f397.onrender.com";

    try {
        const res = await fetch(`${API_BASE}/api/contact/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            loadMessages(); // Refresh list
        } else {
            alert("Silme işlemi başarısız.");
        }
    } catch (error) {
        console.error("Hata:", error);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
