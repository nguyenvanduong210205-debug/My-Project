// src/controllers/lichlamviec.controller.js
const LichLamViec = require("../models/lichlamviec.model");

exports.getScheduleByMonth = async (req, res) => {
  try {
    const { id_khoa, thang, nam } = req.query;
    const result = await LichLamViec.getByMonth(id_khoa, thang, nam);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lịch làm việc", error: err.message });
  }
};

exports.saveSchedule = async (req, res) => {
  try {
    const data = req.body; // [{ id_khoa, ngay, ca, id_bacsi: [] }]
    await LichLamViec.saveSchedule(data);
    res.json({ message: "Lưu lịch làm việc thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lưu lịch làm việc", error: err.message });
  }
};
