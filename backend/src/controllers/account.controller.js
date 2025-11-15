const Account = require("../models/account.model");
const { generatePassword, hashPassword } = require("../services/password.service");

// 📌 Lấy danh sách tài khoản
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.getAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách tài khoản:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// 📌 Thay đổi trạng thái tài khoản (Khóa / Mở khóa)
exports.updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;          // id_taikhoan
    const { status } = req.body;        // ACTIVE / INACTIVE

    if (!id || !status) {
      return res.status(400).json({ message: "Thiếu dữ liệu!" });
    }

    await Account.updateAccountStatus(id, status);

    res.status(200).json({ 
      message: `Cập nhật trạng thái tài khoản #${id} thành công!`,
      status 
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// 📌 Reset mật khẩu tài khoản
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params; // id_taikhoan
    if (!id) return res.status(400).json({ message: "Thiếu ID tài khoản!" });

    // 1️⃣ Sinh mật khẩu mới
    const newPassword = generatePassword();

    // 2️⃣ Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);

    // 3️⃣ Cập nhật vào DB
    await Account.updatePassword(id, hashedPassword);

    // 4️⃣ Trả về cho client
    res.status(200).json({
      message: `Reset mật khẩu thành công cho tài khoản #${id}!`,
      newPassword, // Gửi lại mật khẩu gốc mới cho admin xem
    });
  } catch (error) {
    console.error("❌ Lỗi khi reset mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server khi reset mật khẩu!" });
  }
};
