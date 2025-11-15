// src/models/benhnhan.model.js
const db = require("../../config/db");

const BenhNhanModel = {
  async findByPhone(phone) {
    const [rows] = await db.query("SELECT * FROM benhnhan WHERE phone = ?", [phone]);
    return rows[0];
  },

  async getById(id_benhnhan) {
    const [rows] = await db.query("SELECT * FROM benhnhan WHERE id_benhnhan = ?", [id_benhnhan]);
    return rows[0] || null;
  },

  async create(data) {
    const { id_benhnhan, ho_ten, phone, email, gioi_tinh, ngay_sinh, dia_chi, so_bhyt } = data;
    const [result] = await db.query(
      `INSERT INTO benhnhan (id_benhnhan, ho_ten, phone, email, gioi_tinh, ngay_sinh, dia_chi, so_bhyt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_benhnhan, ho_ten, phone, email, gioi_tinh, ngay_sinh, dia_chi, so_bhyt]
    );
    return result;
  }
};

module.exports = BenhNhanModel;
