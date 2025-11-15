// controllers/khoa.controller.js
const KhoaModel = require('../models/khoa.model');

const getAllKhoa = async (req, res) => {
  try {
    const khoaList = await KhoaModel.findAll();
    res.status(200).json(khoaList);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách khoa:", error);
    res.status(500).json({ message: error.message || "Lỗi khi lấy danh sách khoa." });
  }
};

module.exports = { getAllKhoa };
