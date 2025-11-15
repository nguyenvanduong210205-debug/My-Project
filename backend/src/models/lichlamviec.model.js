const db = require("../../config/db");

const LichLamViec = {
  // 📅 Lấy lịch làm việc theo tháng
  async getByMonth(id_khoa, thang, nam) {
    const sql = `
      SELECT 
        lv.id_lichlamviec,
        lv.id_khoa,
        DATE_FORMAT(lv.ngay, '%Y-%m-%d') AS ngay,
        lv.ca,
        bs.id_bacsi,
        bs.ho_ten
      FROM lichlamviec lv
      JOIN lichlamviec_bacsi lb ON lv.id_lichlamviec = lb.id_lichlamviec
      JOIN bacsi bs ON lb.id_bacsi = bs.id_bacsi
      WHERE lv.id_khoa = ? 
        AND MONTH(lv.ngay) = ? 
        AND YEAR(lv.ngay) = ?
      ORDER BY lv.ngay ASC, lv.ca ASC, bs.ho_ten ASC
    `;
    const [rows] = await db.query(sql, [id_khoa, thang, nam]);
    return rows;
  },

  // 💾 Lưu (cập nhật) lịch làm việc
  async saveSchedule(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const item of data) {
        // 1️⃣ Kiểm tra xem ca đó có chưa
        const [exist] = await conn.query(
          "SELECT id_lichlamviec FROM lichlamviec WHERE id_khoa=? AND ngay=? AND ca=?",
          [item.id_khoa, item.ngay, item.ca]
        );

        let id_lichlamviec;
        if (exist.length > 0) {
          id_lichlamviec = exist[0].id_lichlamviec;
          // 🧹 Xóa bác sĩ cũ trong ca đó
          await conn.query("DELETE FROM lichlamviec_bacsi WHERE id_lichlamviec=?", [id_lichlamviec]);
        } else {
          // 🆕 Tạo mới nếu chưa có
          const [insert] = await conn.query(
            "INSERT INTO lichlamviec (id_khoa, ngay, ca) VALUES (?, ?, ?)",
            [item.id_khoa, item.ngay, item.ca]
          );
          id_lichlamviec = insert.insertId;
        }

        // 2️⃣ Thêm lại các bác sĩ mới
        if (Array.isArray(item.id_bacsi) && item.id_bacsi.length > 0) {
          for (const id_bacsi of item.id_bacsi) {
            await conn.query(
              "INSERT INTO lichlamviec_bacsi (id_lichlamviec, id_bacsi) VALUES (?, ?)",
              [id_lichlamviec, id_bacsi]
            );
          }
        }
      }

      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      console.error("❌ Lỗi khi lưu lịch làm việc:", err);
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = LichLamViec;
