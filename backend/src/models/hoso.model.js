// src/models/hoso.model.js
const db = require("../../config/db");

const HoSoModel = {
  async create(data) {
    const { id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu } = data;
    const [result] = await db.query(
      `INSERT INTO ho_so_kham (id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, 'CHO_KHAM')`,
      [id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu]
    );
    return result;
  },

  async getAll() {
    const [rows] = await db.query(`
      SELECT h.id_hoso, b.ho_ten AS ten_benhnhan, bs.ho_ten AS ten_bacsi, 
             h.trieu_chung, h.chuan_doan, h.trang_thai, h.ngay_tao
      FROM ho_so_kham h
      JOIN benhnhan b ON h.id_benhnhan = b.id_benhnhan
      JOIN bacsi bs ON h.id_bacsi = bs.id_bacsi
      ORDER BY h.ngay_tao DESC
    `);
    return rows;
  },

  async getById(id_hoso) {
    const [rows] = await db.query(`
      SELECT h.*, b.ho_ten AS ten_benhnhan, bs.ho_ten AS ten_bacsi
      FROM ho_so_kham h
      JOIN benhnhan b ON h.id_benhnhan = b.id_benhnhan
      JOIN bacsi bs ON h.id_bacsi = bs.id_bacsi
      WHERE h.id_hoso = ?
    `, [id_hoso]);
    return rows[0];
  }
};

module.exports = HoSoModel;
