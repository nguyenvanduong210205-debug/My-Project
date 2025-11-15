// backend/src/controllers/letan.controller.js
const Letan = require("../models/letan.model");

// ===============================
// 1️⃣ LẤY DANH SÁCH TẤT CẢ LỄ TÂN
// ===============================
exports.getAllLetan = async (req, res) => {
  try {
    const data = await Letan.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi server khi lấy danh sách lễ tân:", err.message);
    res.status(500).json({
      message: "Lỗi server khi truy vấn danh sách lễ tân.",
      error: err.message || "Lỗi Database",
    });
  }
};

// ===============================
// 2️⃣ LẤY CHI TIẾT 1 LỄ TÂN THEO ID
// ===============================
exports.getLetanById = async (req, res) => {
  try {
    const id = req.params.id_letan;
    const data = await Letan.getById(id);

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy lễ tân" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi server khi lấy chi tiết lễ tân:", err.message);
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết lễ tân.",
      error: err.message || "Lỗi Database",
    });
  }
};

// ===============================
// 3️⃣ CẬP NHẬT THÔNG TIN LỄ TÂN
// (KHÔNG CHO SỬA TÊN)
// ===============================
exports.updateLetan = async (req, res) => {
  const id = req.params.id_letan;
  const updateData = req.body;

  // Không cho phép sửa tên
  if (updateData.ho_ten) {
    return res.status(400).json({ message: "Không được phép sửa tên lễ tân" });
  }

  try {
    // Kiểm tra tồn tại
    const letan = await Letan.getById(id);
    if (!letan) {
      return res.status(404).json({ message: "Không tìm thấy lễ tân" });
    }

    // Tiến hành cập nhật
    const result = await Letan.update(id, updateData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không thể cập nhật thông tin lễ tân" });
    }

    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi server khi cập nhật lễ tân:", err.message);
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin lễ tân.",
      error: err.message || "Lỗi Database",
    });
  }
};
