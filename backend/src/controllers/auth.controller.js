// controllers/auth.controller.js
const bcrypt = require("bcrypt");
const { findUserByUsername } = require("../models/auth.model");

// 🧠 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Vui lòng nhập đủ thông tin!" });

    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu!" });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ error: "Tài khoản đang bị khóa!" });

    if (!user.password)
      return res.status(401).json({ error: "Tài khoản không có mật khẩu hợp lệ!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu!" });

    // ✅ Trả trực tiếp thông tin user, không token
    res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id_taikhoan,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ error: "Lỗi máy chủ, vui lòng thử lại!" });
  }
};
