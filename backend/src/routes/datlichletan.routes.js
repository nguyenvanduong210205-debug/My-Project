// src/routes/datlichletan.routes.js
const express = require("express");
const router = express.Router();
const datLichLeTanController = require("../controllers/datlichletan.controller");

// ================= MỚI: Các route đặc biệt đặt lên trước =================

// 🔹 Lấy thông tin lễ tân theo id_taikhoan
// Ví dụ: GET /api/datlichletan/letan/TAI_KHOAN_01
router.get("/letan/:id_taikhoan", datLichLeTanController.getLeTanByTaiKhoan);

// 🔹 Lọc bác sĩ theo khoa, ngày, ca
// Ví dụ: GET /api/datlichletan/filter/doctors?id_khoa=K01&ngay=2025-10-01&ca=Sang
router.get("/filter/doctors", datLichLeTanController.getDoctorsBySchedule);

// 🔹 ✅ Tạo hồ sơ & đặt lịch mới
// Ví dụ: POST /api/datlichletan/create
router.post("/create", datLichLeTanController.create);

// ================= CÁC ROUTE HIỆN CÓ (KHÔNG THAY ĐỔI) =================

// 🔹 Lấy toàn bộ danh sách đặt lịch
router.get("/", datLichLeTanController.getAll);

// 🔹 Lấy danh sách theo trạng thái
router.get("/trangthai/:status", datLichLeTanController.getByStatus);

// 🔹 Lấy chi tiết 1 lịch khám theo id
router.get("/:id_datlich", datLichLeTanController.getById);

module.exports = router;
