// routes/khoa.routes.js
const express = require('express');
const router = express.Router();
const khoaController = require('../controllers/khoa.controller');

router.get('/', khoaController.getAllKhoa);

module.exports = router;