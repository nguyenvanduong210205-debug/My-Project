// src/routes/hoso.routes.js
const express = require("express");
const router = express.Router();
const hoSoController = require("../controllers/hoso.controller");

// ✅ Lễ tân tạo hồ sơ khám mới
router.post("/", hoSoController.createHoSo);

// ✅ Lấy danh sách hồ sơ khám
router.get("/", hoSoController.getAllHoSo);

// ✅ Lấy chi tiết hồ sơ khám
router.get("/:id_hoso", hoSoController.getHoSoById);

module.exports = router;
