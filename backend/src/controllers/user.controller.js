const {
  createUser,
  createDoctor,
  createReceptionist,
  checkUsernameExists,
  checkEmailExists,
} = require("../models/user.model");

const { generatePassword, hashPassword } = require("../services/password.service");
const { sendAccountCreationEmail } = require("../services/email.service");

// Regex kiểm tra định dạng email & số điện thoại
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+84)(\d{9})$/;

// 🔹 Controller: Tạo tài khoản mới
async function createAccount(req, res) {
  try {
    const { username, role, status = "ACTIVE", hoten, id_khoa, phone, email } = req.body;
    console.log("📥 Dữ liệu nhận được:", req.body);

    // 1️⃣ Kiểm tra dữ liệu bắt buộc
    if (!username || !role || !hoten) {
      return res.status(400).json({
        error: "Thiếu dữ liệu bắt buộc (họ tên, username, vai trò)!",
      });
    }

    // 2️⃣ Kiểm tra trùng username
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ error: "Tên đăng nhập đã tồn tại trong hệ thống!" });
    }

    // 3️⃣ Kiểm tra định dạng email (nếu có)
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Định dạng email không hợp lệ!" });
    }

    // 4️⃣ Kiểm tra trùng email (nếu có)
    if (email) {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return res.status(400).json({ error: "Email này đã được sử dụng cho tài khoản khác!" });
      }
    }

    // 5️⃣ Kiểm tra định dạng số điện thoại (nếu có)
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Số điện thoại không hợp lệ! (VD: 0987654321 hoặc +84987654321)",
      });
    }

    // 6️⃣ Sinh mật khẩu ngẫu nhiên
    const plainPassword = generatePassword();

    // 7️⃣ Hash mật khẩu
    const hashedPassword = await hashPassword(plainPassword);

    // 8️⃣ Tạo tài khoản trong bảng TAIKHOAN
    const id_taikhoan = await createUser(username, hashedPassword, role, status);

    // 9️⃣ Thêm vào bảng tương ứng (BACSI / LETAN)
    if (role === "BACSI") {
      await createDoctor(id_taikhoan, hoten, id_khoa, phone, email);
    } else if (role === "LETAN") {
      await createReceptionist(id_taikhoan, hoten, phone, email);
    } else {
      return res.status(400).json({ error: "Vai trò không hợp lệ!" });
    }

    // 🔟 Gửi email thông báo tài khoản
    if (email) {
      await sendAccountCreationEmail({
        email,
        hoten,
        username,
        password: plainPassword,
        role,
      });
    }

    // ✅ Trả về phản hồi
    res.status(201).json({
      message: "✅ Tạo tài khoản thành công và đã gửi email thông tin đăng nhập!",
      account: {
        id_taikhoan,
        username,
        password: plainPassword,
        role,
        status,
        hoten,
        email,
      },
    });

  } catch (err) {
    console.error("❌ Lỗi khi tạo tài khoản:", err);
    res.status(500).json({ error: "Lỗi server khi tạo tài khoản!" });
  }
}

module.exports = { createAccount };
