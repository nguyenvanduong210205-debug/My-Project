const db = require("../../config/db");

// 🔹 Hàm sinh mã tự động theo role
async function generateIdByRole(role) {
  const prefix = role === "BACSI" ? "BS" : role === "LETAN" ? "LT" : "TK";
  const table = "TAIKHOAN";
  const column = "id_taikhoan";

  // Lấy ID mới nhất chỉ theo role
  const [rows] = await db.query(
    `SELECT ${column} FROM ${table} WHERE role = ? ORDER BY LENGTH(${column}) DESC, ${column} DESC LIMIT 1`,
    [role]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastId = String(rows[0][column]);
    const num = parseInt(lastId.replace(prefix, ""), 10);
    nextNumber = (isNaN(num) ? 0 : num) + 1;
  }

  return prefix + String(nextNumber).padStart(3, "0");
}

// 🔹 Kiểm tra trùng username
async function checkUsernameExists(username) {
  const [rows] = await db.query("SELECT username FROM TAIKHOAN WHERE username = ?", [username]);
  return rows.length > 0;
}

// 🔹 Kiểm tra trùng email (ở bảng bác sĩ hoặc lễ tân)
async function checkEmailExists(email) {
  const [rows1] = await db.query("SELECT email FROM BACSI WHERE email = ?", [email]);
  const [rows2] = await db.query("SELECT email FROM LETAN WHERE email = ?", [email]);
  return rows1.length > 0 || rows2.length > 0;
}

// 🔹 Tạo tài khoản mới trong TAIKHOAN
async function createUser(username, passwordHash, role, status = "ACTIVE") {
  const newId = await generateIdByRole(role);
  await db.query(
    "INSERT INTO TAIKHOAN (id_taikhoan, username, password, role, status) VALUES (?, ?, ?, ?, ?)",
    [newId, username, passwordHash, role, status]
  );
  return newId;
}

// 🔹 Thêm bác sĩ
async function createDoctor(id_taikhoan, ho_ten, id_khoa, phone = null, email = null) {
  await db.query(
    "INSERT INTO BACSI (id_bacsi, id_taikhoan, ho_ten, id_khoa, phone, email) VALUES (?, ?, ?, ?, ?, ?)",
    [id_taikhoan, id_taikhoan, ho_ten, id_khoa || null, phone, email]
  );
}

// 🔹 Thêm lễ tân
async function createReceptionist(id_taikhoan, ho_ten, phone = null, email = null) {
  await db.query(
    "INSERT INTO LETAN (id_letan, id_taikhoan, ho_ten, phone, email) VALUES (?, ?, ?, ?, ?)",
    [id_taikhoan, id_taikhoan, ho_ten, phone, email]
  );
}

module.exports = {
  createUser,
  createDoctor,
  createReceptionist,
  checkUsernameExists,
  checkEmailExists,
};
