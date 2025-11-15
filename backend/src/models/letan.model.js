// backend/src/models/letan.model.js
const pool = require("../../config/db");

const Letan = {
  // 1️⃣ Lấy toàn bộ danh sách lễ tân
  async getAll() {
    try {
      const sql = `
        SELECT 
          id_letan,
          id_taikhoan,
          ho_ten,
          phone,
          email,
          diachi
        FROM letan
        ORDER BY id_letan
      `;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (err) {
      console.error("❌ Lỗi khi truy vấn danh sách lễ tân:", err);
      throw err;
    }
  },

  // 2️⃣ Lấy chi tiết 1 lễ tân
  async getById(id_letan) {
    try {
      const sql = `
        SELECT 
          id_letan,
          id_taikhoan,
          ho_ten,
          phone,
          email,
          diachi
        FROM letan
        WHERE id_letan = ?
      `;
      const [rows] = await pool.query(sql, [id_letan]);
      return rows[0] || null;
    } catch (err) {
      console.error("❌ Lỗi khi truy vấn chi tiết lễ tân:", err);
      throw err;
    }
  },

  // 3️⃣ Cập nhật thông tin lễ tân (không sửa tên)
  async update(id_letan, data) {
    try {
      const sql = `
        UPDATE letan SET 
          phone = ?, 
          email = ?, 
          diachi = ?
        WHERE id_letan = ?
      `;
      const params = [data.phone || null, data.email || null, data.diachi || null, id_letan];
      const [result] = await pool.query(sql, params);
      return result;
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật lễ tân:", err);
      throw err;
    }
  }
};

module.exports = Letan;
