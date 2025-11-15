// backend/src/routes/letan.routes.js
const express = require("express");
const router = express.Router();
const letanController = require("../controllers/letan.controller");

// 1️⃣ Lấy danh sách lễ tân
router.get("/", letanController.getAllLetan);

// 2️⃣ Lấy chi tiết lễ tân theo id
router.get("/:id_letan", letanController.getLetanById);

// 3️⃣ Cập nhật thông tin lễ tân
router.put("/:id_letan", letanController.updateLetan);

module.exports = router;
