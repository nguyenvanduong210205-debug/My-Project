// backend/src/controllers/listdoctor.controller.js

const ListDoctor = require("../models/listdoctor.model");
const db = require("../../config/db");

// ===============================
// 1️⃣ LẤY DANH SÁCH TẤT CẢ BÁC SĨ
// ===============================
exports.getAllDoctors = async (req, res) => {
  try {
    const data = await ListDoctor.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi server khi lấy danh sách bác sĩ:", err.message);
    res.status(500).json({
      message: "Lỗi server khi truy vấn danh sách bác sĩ.",
      error: err.message || "Lỗi Database",
    });
  }
};

// ===============================
// 2️⃣ LẤY CHI TIẾT 1 BÁC SĨ THEO ID
// ===============================
exports.getDoctorById = async (req, res) => {
  try {
    const id = req.params.id_bacsi;
    const data = await ListDoctor.getById(id);

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi server khi lấy chi tiết bác sĩ:", err.message);
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết bác sĩ.",
      error: err.message || "Lỗi Database",
    });
  }
};

// ===============================
// 3️⃣ CẬP NHẬT THÔNG TIN BÁC SĨ
// (KHÔNG CHO SỬA TÊN)
// ===============================
exports.updateDoctor = async (req, res) => {
  const id = req.params.id_bacsi;
  const updateData = req.body;

  // Không cho phép sửa tên
  if (updateData.ho_ten) {
    return res.status(400).json({ message: "Không được phép sửa tên bác sĩ" });
  }

  try {
    // 🧩 1. Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (updateData.email && !emailRegex.test(updateData.email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // 🧩 2. Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^0\d{9}$/;
    if (updateData.phone && !phoneRegex.test(updateData.phone)) {
      return res
        .status(400)
        .json({ message: "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)" });
    }

    // 🧩 3. Kiểm tra trùng email hoặc số điện thoại
    const [exists] = await db.query(
      `SELECT id_bacsi FROM bacsi WHERE (email = ? OR phone = ?) AND id_bacsi <> ?`,
      [updateData.email, updateData.phone, id]
    );

    if (exists.length > 0) {
      return res
        .status(400)
        .json({ message: "Email hoặc số điện thoại đã tồn tại trong hệ thống" });
    }

    // 🧩 4. Nếu có file ảnh mới → lưu base64 vào DB
    if (req.file) {
      updateData.hinh_anh = req.file.buffer;
    }

    // 🧩 5. Kiểm tra hồ sơ bác sĩ
    const doctor = await ListDoctor.getById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    if (doctor.trangthai === 0) {
      return res
        .status(403)
        .json({ message: "Hồ sơ đã bị khóa, không thể chỉnh sửa" });
    }

    // 🧩 6. Tiến hành cập nhật
    const result = await ListDoctor.update(id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ để cập nhật" });
    }

    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi server khi cập nhật bác sĩ:", err.message);
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin bác sĩ.",
      error: err.message || "Lỗi Database",
    });
  }
};

// ===============================
// 4️⃣ KHÓA / MỞ KHÓA HỒ SƠ BÁC SĨ
// ===============================
exports.lockDoctor = async (req, res) => {
  const id = req.params.id_bacsi;
  const isLocked = req.body.isLocked === true;

  try {
    const result = await ListDoctor.lock(id, isLocked);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bác sĩ để khóa/mở khóa" });
    }

    res.status(200).json({
      message: isLocked
        ? "Đã khóa hồ sơ bác sĩ thành công"
        : "Đã mở khóa hồ sơ bác sĩ thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi server khi khóa/mở khóa hồ sơ:", err.message);
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái hồ sơ.",
      error: err.message || "Lỗi Database",
    });
  }
};
