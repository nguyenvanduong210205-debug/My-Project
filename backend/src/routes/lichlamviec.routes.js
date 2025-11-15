const express = require("express");
const router = express.Router();
const lichController = require("../controllers/lichlamviec.controller");

router.get("/", lichController.getScheduleByMonth);  // ?id_khoa=...&thang=...&nam=...
router.post("/", lichController.saveSchedule);

module.exports = router;
