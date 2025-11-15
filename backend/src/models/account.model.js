const db = require("../../config/db");

// 📋 Lấy danh sách tài khoản
async function getAllAccounts() {
  const [rows] = await db.query(`
    SELECT 
      t.id_taikhoan, 
      t.username, 
      t.role, 
      t.status,
      COALESCE(b.ho_ten, l.ho_ten) AS ho_ten,   -- nếu bác sĩ thì lấy từ bảng BACSI, nếu lễ tân thì lấy từ LETAN
      k.ten_khoa
    FROM TAIKHOAN t
    LEFT JOIN BACSI b ON t.id_taikhoan = b.id_taikhoan
    LEFT JOIN KHOA k ON b.id_khoa = k.id_khoa
    LEFT JOIN LETAN l ON t.id_taikhoan = l.id_taikhoan
  `);
  return rows;
}

// 🔥 Thay đổi trạng thái tài khoản (ACTIVE / INACTIVE)
async function updateAccountStatus(id_taikhoan, status) {
  await db.query(
    "UPDATE TAIKHOAN SET status = ? WHERE id_taikhoan = ?",
    [status, id_taikhoan]
  );
}

// 🔁 Reset mật khẩu (cập nhật password mới đã hash)
async function updatePassword(id_taikhoan, hashedPassword) {
  await db.query(
    "UPDATE TAIKHOAN SET password = ? WHERE id_taikhoan = ?",
    [hashedPassword, id_taikhoan]
  );
}

module.exports = { 
  getAllAccounts, 
  updateAccountStatus, 
  updatePassword // ✅ thêm export cho reset password
};
