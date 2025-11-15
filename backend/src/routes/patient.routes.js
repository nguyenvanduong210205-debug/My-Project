// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.post('/search/request-otp', patientController.requestOtp);
router.post('/search/verify-otp', patientController.verifyOtpAndGetPatients);
router.get('/visits/:patientId', patientController.getPatientVisits);
router.get('/visit-details/:lichKhamId', patientController.getVisitDetails); // Đổi tên để rõ ràng hơn
router.get('/visit-details/:lichKhamId/download-pdf', patientController.downloadVisitPdf);
module.exports = router;