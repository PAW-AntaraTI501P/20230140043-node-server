// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db"); // Pastikan path ini benar
const router = express.Router();

// -- Endpoint Registrasi --
// (Dengan perbaikan untuk menyimpan 'name')
router.post("/register", async (req, res) => {
    // Terima kolom name, email, dan password dari body request
    const { name, email, password } = req.body;

    // Validasi input dasar
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Harap isi semua kolom (nama, email, dan password)." });
    }

    try {
        // Cek apakah email sudah terdaftar
        db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Terjadi kesalahan pada server." });
            }

            if (results.length > 0) {
                return res.status(409).json({ msg: "Email sudah digunakan." });
            }

            // Hash password sebelum disimpan
            const hashedPassword = await bcrypt.hash(password, 10);

            // Simpan user baru ke database
            db.query(
                "INSERT INTO users SET ?",
                { name, email, password: hashedPassword }, // PERBAIKAN: 'name' ditambahkan di sini
                (err) => {
                    if (err) {
                        console.error("Database insert error:", err);
                        return res.status(500).json({ error: "Gagal mendaftarkan pengguna." });
                    }
                    res.status(201).json({ msg: "Pengguna berhasil didaftarkan." });
                }
            );
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
});

// -- Endpoint Login --
// (Kode ini sudah benar)
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ msg: "Harap isi email dan password." });
    }

    // Cari user berdasarkan email
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Terjadi kesalahan pada server." });
            }

            // Cek jika user tidak ditemukan
            const user = results[0];
            if (!user) {
                // Gunakan pesan yang sama untuk email salah atau password salah demi keamanan
                return res.status(400).json({ msg: "Email atau password salah." });
            }

            // Bandingkan password yang diinput dengan hash di database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Email atau password salah." });
            }

            // Jika cocok, buat JSON Web Token (JWT)
            const token = jwt.sign(
                { id: user.id, name: user.name }, // Payload token
                "JWT_SECRET=my_super_secret_key", // Ganti dengan secret key dari .env
                { expiresIn: '1h' } // Token berlaku selama 1 jam
            );

            // Kirim token dan data user sebagai respons
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
    );
});

module.exports = router;