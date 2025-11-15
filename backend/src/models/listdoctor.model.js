// backend/src/models/listdoctor.model.js
const pool = require("../../config/db");

const Doctor = {
  // 1️⃣ Lấy toàn bộ danh sách bác sĩ
  async getAll() {
    try {
      const sql = `
        SELECT 
          bs.id_bacsi,
          bs.ho_ten,
          bs.hoc_vi,
          bs.chuc_vu,
          bs.chuyen_mon,
          bs.nam_kinh_nghiem,
          bs.phone,
          bs.email,
          k.ten_khoa
        FROM bacsi bs
        LEFT JOIN khoa k ON bs.id_khoa = k.id_khoa
        ORDER BY bs.id_bacsi
      `;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (err) {
      console.error("❌ Lỗi khi truy vấn danh sách bác sĩ:", err);
      throw err;
    }
  },

  // 2️⃣ Lấy chi tiết 1 bác sĩ
  async getById(id_bacsi) {
    try {
      const sql = `
        SELECT 
          bs.id_bacsi,
          bs.id_taikhoan,
          bs.ho_ten,
          bs.hinh_anh,
          bs.hoc_vi,
          bs.chuc_vu,
          bs.chuyen_mon,
          bs.qua_trinh_dao_tao,
          bs.qua_trinh_cong_tac,
          bs.the_manh_kinh_nghiem,
          bs.id_khoa,
          k.ten_khoa,
          bs.nam_kinh_nghiem,
          bs.phone,
          bs.email,
          bs.diachi
        FROM bacsi bs
        LEFT JOIN khoa k ON bs.id_khoa = k.id_khoa
        WHERE bs.id_bacsi = ?
      `;
      const [rows] = await pool.query(sql, [id_bacsi]);

      if (!rows[0]) return null;

      // ✅ Chuyển ảnh từ buffer sang base64 (nếu có)
      if (rows[0].hinh_anh) {
        rows[0].hinh_anh = `data:image/jpeg;base64,${rows[0].hinh_anh.toString("base64")}`;
      }

      return rows[0];
    } catch (err) {
      console.error("❌ Lỗi khi truy vấn chi tiết bác sĩ:", err);
      throw err;
    }
  },

  // 3️⃣ Cập nhật thông tin bác sĩ (trừ tên)
async update(id_bacsi, data) {
  try {
    const sql = `
      UPDATE bacsi SET 
        hinh_anh = COALESCE(?, hinh_anh),
        hoc_vi = COALESCE(?, hoc_vi),
        chuc_vu = COALESCE(?, chuc_vu),
        chuyen_mon = COALESCE(?, chuyen_mon),
        qua_trinh_dao_tao = COALESCE(?, qua_trinh_dao_tao),
        qua_trinh_cong_tac = COALESCE(?, qua_trinh_cong_tac),
        the_manh_kinh_nghiem = COALESCE(?, the_manh_kinh_nghiem),
        id_khoa = COALESCE(?, id_khoa),
        nam_kinh_nghiem = COALESCE(?, nam_kinh_nghiem),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        diachi = COALESCE(?, diachi)
      WHERE id_bacsi = ?
    `;

    const params = [
      data.hinh_anh || null,
      data.hoc_vi || null,
      data.chuc_vu || null,
      data.chuyen_mon || null,
      data.qua_trinh_dao_tao || null,
      data.qua_trinh_cong_tac || null,
      data.the_manh_kinh_nghiem || null,
      data.id_khoa || null,
      data.nam_kinh_nghiem || null,
      data.phone || null,
      data.email || null,
      data.diachi || null,
      id_bacsi
    ];

    const [result] = await pool.query(sql, params);
    return result;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật bác sĩ:", err);
    throw err;
  }
},

  // 4️⃣ Khóa / Mở khóa bác sĩ
  async lock(id_bacsi, isLocked) {
    try {
      const [result] = await pool.query(
        "UPDATE bacsi SET trangthai = ? WHERE id_bacsi = ?",
        [isLocked ? 0 : 1, id_bacsi]
      );
      return result;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = Doctor;
