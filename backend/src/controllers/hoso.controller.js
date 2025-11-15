// src/controllers/hoso.controller.js
const HoSoModel = require("../models/hoso.model");
const HoSoService = require("../services/hoso.service");

exports.createHoSo = async (req, res) => {
  try {
    const result = await HoSoService.createHoSo(req.body);
    res.status(201).json({
      message: "✅ Hồ sơ bệnh án đã được tạo thành công!",
      data: result
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo hồ sơ bệnh án:", err);
    res.status(500).json({ message: "Lỗi server khi tạo hồ sơ bệnh án", error: err.message });
  }
};

exports.getAllHoSo = async (req, res) => {
  try {
    const data = await HoSoModel.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách hồ sơ" });
  }
};

exports.getHoSoById = async (req, res) => {
  try {
    const id_hoso = req.params.id_hoso;
    const data = await HoSoModel.getById(id_hoso);
    if (!data) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết hồ sơ" });
  }
};
