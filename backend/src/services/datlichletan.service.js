// ================================
// 📁 src/services/datlichletan.service.js
// ================================

const DatLichLeTanModel = require("../models/datlichletan.model");
const db = require("../../config/db");

const DatLichLeTanService = {
  // 🟩 1️⃣ Lấy tất cả lịch khám
  async getAll() {
    return await DatLichLeTanModel.getAll();
  },

  // 🟨 2️⃣ Lọc lịch theo trạng thái
  async getByStatus(status) {
    return await DatLichLeTanModel.getByStatus(status);
  },

  // 🟦 3️⃣ Lấy chi tiết lịch khám theo ID
  async getById(id_datlich) {
    return await DatLichLeTanModel.findById(id_datlich);
  },

  // 🟥 4️⃣ Tạo hồ sơ & đặt lịch mới
  async create(data) {
    const {
      ho_ten,
      phone,
      email,
      gioi_tinh,
      ngay_sinh,
      dia_chi,
      id_khoa,
      id_bacsi,
      ngay,
      ca_kham,
      ly_do,
      trang_thai
    } = data;

    if (!ho_ten || !phone || !id_khoa || !id_bacsi || !ngay) {
      throw new Error("Thiếu thông tin bắt buộc: họ tên, điện thoại, khoa, bác sĩ, ngày.");
    }

    // 🧩 Bước 1: Kiểm tra bệnh nhân đã tồn tại chưa
    let id_benhnhan = null;
    const [benhnhanRows] = await db.query(
      "SELECT id_benhnhan FROM benhnhan WHERE phone = ? LIMIT 1",
      [phone]
    );

    if (benhnhanRows.length > 0) {
      id_benhnhan = benhnhanRows[0].id_benhnhan;
    } else {
      // Nếu chưa có, tạo mới bệnh nhân với ID ngắn gọn hơn (<= 10 ký tự)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 chữ số ngẫu nhiên
      id_benhnhan = `BN${randomSuffix}`; // Ví dụ: BN4821

      await db.query(
        `INSERT INTO benhnhan (id_benhnhan, ho_ten, phone, email, gioi_tinh, ngay_sinh, dia_chi)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_benhnhan, ho_ten, phone, email, gioi_tinh || "Khác", ngay_sinh || null, dia_chi || ""]
      );
    }

    // 🧩 Bước 2: Tạo mới lịch khám trong bảng dat_lich
    const [datlichResult] = await db.query(
      `INSERT INTO dat_lich (ten_benhnhan, sdt, email, ngay, khung_gio, id_khoa, ly_do, id_bacsi, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ho_ten, phone, email, ngay, ca_kham, id_khoa, ly_do, id_bacsi, trang_thai || "CHO_XAC_NHAN"]
    );

    const id_datlich = datlichResult.insertId;

    // 🧩 Bước 3: (Tùy chọn) tạo hồ sơ khám ban đầu
    await db.query(
      `INSERT INTO ho_so_kham (id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, 'CHO_KHAM')`,
      [id_datlich, id_benhnhan, id_bacsi, "", "", ""]
    );

    // 🟢 Trả về kết quả cuối cùng
    return {
      message: "Tạo hồ sơ & đặt lịch thành công!",
      id_datlich,
      id_benhnhan,
    };
  }
};

module.exports = DatLichLeTanService;
