// routes/datlich.routes.js
const express = require('express');
const router = express.Router();
const datlichController = require('../controllers/datlich.controller');

router.post('/', datlichController.createDatLich);

// Route để kiểm tra các khung giờ đã đầy
router.get('/availability', datlichController.getFullSlots); 

module.exports = router;