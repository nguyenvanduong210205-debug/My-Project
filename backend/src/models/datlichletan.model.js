// src/models/datlichletan.model.js
const db = require("../../config/db");

const DatLichLeTanModel = {

  // 🧠 Lấy tất cả lịch khám (Ưu tiên người đặt lịch trước)
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        d.id_datlich,
        d.ten_benhnhan,
        d.sdt,
        d.email,
        d.ngay,
        d.khung_gio,
        d.ly_do,
        d.trang_thai,
        k.ten_khoa,
        b.ho_ten AS ten_bacsi
      FROM dat_lich d
      LEFT JOIN khoa k ON d.id_khoa = k.id_khoa
      LEFT JOIN bacsi b ON d.id_bacsi = b.id_bacsi
      ORDER BY 
        CASE 
          WHEN d.ngay IS NOT NULL THEN 0   -- Ưu tiên người đã đặt lịch
          ELSE 1                           -- Người đến trực tiếp (chưa đặt lịch)
        END,
        d.ngay ASC,                        -- Ngày khám sớm hơn lên trước
        d.khung_gio ASC,                   -- Giờ khám sớm hơn lên trước
        d.createdAt ASC                    -- Nếu cùng giờ thì ai đặt trước hiển thị trước
    `);
    return rows;
  },

  // 🔍 Lấy lịch khám theo trạng thái (giữ nguyên)
  async getByStatus(status) {
    const [rows] = await db.query(`
      SELECT 
        d.id_datlich,
        d.ten_benhnhan,
        d.sdt,
        d.email,
        d.ngay,
        d.khung_gio,
        d.ly_do,
        d.trang_thai,
        k.ten_khoa,
        b.ho_ten AS ten_bacsi
      FROM dat_lich d
      LEFT JOIN khoa k ON d.id_khoa = k.id_khoa
      LEFT JOIN bacsi b ON d.id_bacsi = b.id_bacsi
      WHERE d.trang_thai = ?
      ORDER BY 
        CASE 
          WHEN d.ngay IS NOT NULL THEN 0
          ELSE 1
        END,
        d.ngay ASC,
        d.khung_gio ASC,
        d.createdAt ASC
    `, [status]);
    return rows;
  },

  // 🔍 Lấy chi tiết lịch theo id (giữ nguyên)
  async findById(id_datlich) {
    const [rows] = await db.query(`
      SELECT 
        d.*, k.ten_khoa, b.ho_ten AS ten_bacsi
      FROM dat_lich d
      LEFT JOIN khoa k ON d.id_khoa = k.id_khoa
      LEFT JOIN bacsi b ON d.id_bacsi = b.id_bacsi
      WHERE d.id_datlich = ?
    `, [id_datlich]);
    return rows[0];
  },

  // 🔄 Cập nhật trạng thái (giữ nguyên)
  async updateTrangThai(id_datlich, trang_thai) {
    const [result] = await db.query(
      "UPDATE dat_lich SET trang_thai = ? WHERE id_datlich = ?",
      [trang_thai, id_datlich]
    );
    return result;
  },

  // ✳️ MỚI: Lấy thông tin lễ tân theo id_taikhoan (JOIN taikhoan)
  async getLeTanByTaiKhoan(id_taikhoan) {
    const [rows] = await db.query(`
      SELECT l.id_letan, l.ho_ten, l.phone, l.email, l.diachi, t.username, t.id_taikhoan
      FROM letan l
      LEFT JOIN taikhoan t ON l.id_taikhoan = t.id_taikhoan
      WHERE l.id_taikhoan = ?
      LIMIT 1
    `, [id_taikhoan]);
    return rows[0] || null;
  },

  // ✳️ Lọc bác sĩ theo khoa, ngày, ca (dựa trên lichlamviec + lichlamviec_bacsi)
  async getDoctorsBySchedule(id_khoa, ngay, ca) {
    const [rows] = await db.query(`
      SELECT DISTINCT b.id_bacsi, b.ho_ten, b.hoc_vi, b.chuc_vu, b.phone, b.email, b.id_khoa
      FROM bacsi b
      INNER JOIN lichlamviec_bacsi lb ON b.id_bacsi = lb.id_bacsi
      INNER JOIN lichlamviec ll ON ll.id_lichlamviec = lb.id_lichlamviec
      WHERE ll.id_khoa = ? AND ll.ngay = ? AND ll.ca = ?
      ORDER BY b.ho_ten
    `, [id_khoa, ngay, ca]);
    return rows;
  }

};

module.exports = DatLichLeTanModel;
