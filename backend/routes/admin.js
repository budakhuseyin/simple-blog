const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Admin Giriş API'si (Şifreleme Yok)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı!" });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Şifre yanlış!" });
        }

        const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Sunucu hatası!" });
    }
});


module.exports = router;
