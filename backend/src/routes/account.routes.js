const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");

// 📋 Lấy danh sách tài khoản
router.get("/", accountController.getAllAccounts);

// 🔄 Cập nhật trạng thái (Khóa / Mở khóa)
router.put("/:id/status", accountController.updateAccountStatus);

// 🔁 Reset mật khẩu
router.put("/:id/reset-password", accountController.resetPassword);

module.exports = router;
