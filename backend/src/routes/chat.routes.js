const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// Gửi tin nhắn chat
router.post("/", chatController.handleChatMessage);

// Lấy lịch sử chat
router.get("/history", chatController.getChatHistory);

module.exports = router;
