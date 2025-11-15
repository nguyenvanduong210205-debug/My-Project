// src/controllers/datlichletan.controller.js
const DatLichLeTanService = require("../services/datlichletan.service");
const DatLichLeTanModel = require("../models/datlichletan.model"); // dùng trực tiếp cho vài truy vấn nhẹ

// 1️⃣ Lấy tất cả lịch khám
exports.getAll = async (req, res) => {
  try {
    const data = await DatLichLeTanService.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách lịch:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lịch khám." });
  }
};

// 2️⃣ Lấy danh sách theo trạng thái
exports.getByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const data = await DatLichLeTanService.getByStatus(status);
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lọc danh sách lịch:", err);
    res.status(500).json({ message: "Lỗi server khi lọc lịch khám." });
  }
};

// 3️⃣ Lấy chi tiết lịch khám theo ID
exports.getById = async (req, res) => {
  try {
    const id_datlich = req.params.id_datlich;
    const data = await DatLichLeTanService.getById(id_datlich);
    if (!data) return res.status(404).json({ message: "Không tìm thấy lịch khám." });
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết lịch:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết lịch khám." });
  }
};

// ================= MỚI: Lấy thông tin lễ tân theo id_taikhoan =================
exports.getLeTanByTaiKhoan = async (req, res) => {
  try {
    const id_taikhoan = req.params.id_taikhoan;
    if (!id_taikhoan) return res.status(400).json({ message: "Thiếu id_taikhoan" });

    const data = await DatLichLeTanModel.getLeTanByTaiKhoan(id_taikhoan);
    if (!data) return res.status(404).json({ message: "Không tìm thấy lễ tân." });

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy thông tin lễ tân:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin lễ tân." });
  }
};

// ================= MỚI: Lọc bác sĩ theo khoa, ngày, ca =================
exports.getDoctorsBySchedule = async (req, res) => {
  try {
    const { id_khoa, ngay, ca } = req.query;
    if (!id_khoa || !ngay || !ca) {
      return res.status(400).json({ message: "Thiếu tham số: id_khoa, ngay, ca là bắt buộc." });
    }

    const doctors = await DatLichLeTanModel.getDoctorsBySchedule(id_khoa, ngay, ca);
    res.status(200).json(doctors);
  } catch (err) {
    console.error("❌ Lỗi khi lọc bác sĩ:", err);
    res.status(500).json({ message: "Lỗi server khi lọc danh sách bác sĩ." });
  }
};

// ================= ✅ MỚI: Tạo hồ sơ & đặt lịch khám =================
exports.create = async (req, res) => {
  try {
    const data = req.body;

    // Kiểm tra các trường bắt buộc
    if (!data.ho_ten || !data.phone || !data.id_khoa || !data.id_bacsi || !data.ngay) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc: họ tên, điện thoại, khoa, bác sĩ, ngày." });
    }

    // Gọi service xử lý
    const result = await DatLichLeTanService.create(data);

    return res.status(201).json({
      message: "✅ Tạo hồ sơ & đặt lịch thành công!",
      data: result
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo hồ sơ & đặt lịch:", err);
    res.status(500).json({ message: "Lỗi server khi tạo hồ sơ & đặt lịch!" });
  }
};
