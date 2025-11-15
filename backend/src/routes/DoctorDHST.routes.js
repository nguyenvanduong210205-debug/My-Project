// routes/DoctorDHST.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/DoctorDHST.controller');

// --- Doctor Profile & Schedule ---
// GET /api/DoctorDHST/getBacsiId?id_taikhoan=... (Lấy id_bacsi từ id_taikhoan)
router.get('/getBacsiId', controller.getBacsiIdFromTaikhoan);
// GET /api/DoctorDHST/doctorProfile?id_bacsi=...
router.get('/doctorProfile', controller.getDoctorProfile);
// GET /api/DoctorDHST/schedule?id_bacsi=...&ngay=...
router.get('/schedule', controller.getDoctorSchedule);
// PUT /api/DoctorDHST/update
router.put('/update', controller.updateDoctorProfile);
// GET /api/DoctorDHST/thongke/today?id_bacsi=... (Thống kê hôm nay)
router.get('/thongke/today', controller.getDailyStatistics);


// --- Patient Medical Records & Prescription ---
// Lấy id_datlich từ id_benhnhan và id_bacsi
// GET /api/DoctorDHST/getDatlich?id_benhnhan=...&id_bacsi=...
router.get('/getDatlich', controller.getDatlichByBenhnhan);
// Lấy TẤT CẢ thông tin chi tiết của một lịch khám (đặt lịch, bệnh nhân, hồ sơ cũ, toa cũ)
// GET /api/DoctorDHST/full_detail?id_datlich=...
router.get('/full_detail', controller.getFullRecordDetail);

// POST /api/DoctorDHST/save_toa
router.post('/save_toa', controller.savePrescription);

// POST /api/DoctorDHST/save_benhan
router.post('/save_benhan', controller.saveMedicalRecord);

module.exports = router;
