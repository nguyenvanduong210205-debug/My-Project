// backend/src/routes/listdoctor.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const listDoctorController = require("../controllers/listdoctor.controller");

// ⚙️ Dùng memoryStorage để lấy buffer thay vì lưu file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1️⃣ Lấy danh sách bác sĩ
router.get("/", listDoctorController.getAllDoctors);

// 2️⃣ Lấy chi tiết bác sĩ theo id_bacsi
router.get("/:id_bacsi", listDoctorController.getDoctorById);

// 3️⃣ Cập nhật thông tin bác sĩ (cho phép upload ảnh)
router.put("/:id_bacsi", upload.single("hinh_anh"), listDoctorController.updateDoctor);

// 4️⃣ Khóa / mở khóa hồ sơ bác sĩ
router.patch("/:id_bacsi/lock", listDoctorController.lockDoctor);

module.exports = router;
