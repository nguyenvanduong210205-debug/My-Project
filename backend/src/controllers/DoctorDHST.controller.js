// controllers/DoctorDHST.controller.js
const DoctorDHSTService = require('../services/DoctorDHST.service');
const db = require('../../config/db');

// Tạo Service instance một lần với pool từ config
const service = new DoctorDHSTService(db);

// --- 0. GET ID_BACSI FROM ID_TAIKHOAN ---
exports.getBacsiIdFromTaikhoan = async (req, res) => {
    const { id_taikhoan } = req.query;
    if (!id_taikhoan) return res.status(400).send({ error: "Missing id_taikhoan." });

    try {
        const [rows] = await db.query(
            `SELECT id_bacsi FROM bacsi WHERE id_taikhoan = ? LIMIT 1`,
            [id_taikhoan]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).send({ error: "Doctor not found for this account." });
        }

        res.status(200).json({ data: { id_bacsi: rows[0].id_bacsi } });
    } catch (error) {
        console.error("Error in getBacsiIdFromTaikhoan:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 1. PROFILE ---
exports.getDoctorProfile = async (req, res) => {
    const { id_bacsi } = req?.query;
    if (!id_bacsi) return res.status(400).send({ error: "Missing doctor ID." });

    try {
        const profile = await service.getProfile(id_bacsi);

        if (!profile) return res.status(404).send({ error: "Doctor not found." });

        res.status(200).json({ data: profile });
    } catch (error) {
        console.error("Error in getDoctorProfile:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

exports.updateDoctorProfile = async (req, res) => {
    const data = req.body;
    if (!data.id_bacsi) return res.status(400).send({ error: "Missing doctor ID." });

    try {
        await service.updateProfile(data);

        res.status(200).json({ data: { success: true }, message: "Profile updated successfully." });
    } catch (error) {
        console.error("Error in updateDoctorProfile:", error);
        res.status(500).send({ error: error.message || "Failed to update profile." });
    }
};

// --- 2. SCHEDULE ---
exports.getDoctorSchedule = async (req, res) => {
    const { id_bacsi, ngay } = req.query;
    if (!id_bacsi) return res.status(400).send({ error: "Missing doctor ID." });

    try {
        const schedule = await service.getSchedule(id_bacsi, ngay);

        res.status(200).json({ data: schedule });
    } catch (error) {
        console.error("Error in getDoctorSchedule:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 3. STATISTICS ---
exports.getDailyStatistics = async (req, res) => {
    const { id_bacsi } = req.query;
    if (!id_bacsi) return res.status(400).send({ error: "Missing doctor ID." });

    try {
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày YYYY-MM-DD
        const stats = await service.getStatistics(id_bacsi, today);

        res.status(200).json({ data: { 
            so_benh_nhan: stats.so_benh_nhan || 0,
            da_kham: stats.da_kham || 0 
        } });
    } catch (error) {
        console.error("Error in getDailyStatistics:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 4. FULL RECORD DETAIL ---
exports.getFullRecordDetail = async (req, res) => {
    const { id_datlich } = req.query; 
    if (!id_datlich) return res.status(400).send({ error: "Missing datlich ID." });

    try {
        const details = await service.getAllRecordDetails(id_datlich);

        if (!details) return res.status(404).send({ error: "Appointment not found." });

        res.status(200).json({ data: details });
    } catch (error) {
        console.error("Error fetching full record detail:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 5. GET DATLICH BY BENHNHAN AND BACSI ---
exports.getDatlichByBenhnhan = async (req, res) => {
    const { id_benhnhan, id_bacsi } = req.query;
    if (!id_benhnhan || !id_bacsi) return res.status(400).send({ error: "Missing id_benhnhan or id_bacsi." });

    try {
        const datlich = await service.getDatlichByBenhnhanAndBacsi(id_benhnhan, id_bacsi);
        res.status(200).json({ data: datlich });
    } catch (error) {
        console.error("Error in getDatlichByBenhnhan:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 6. SAVE RECORDS ---
exports.saveMedicalRecord = async (req, res) => {
    const data = req.body;
    if (!data.id_datlich || !data.id_bacsi) return res.status(400).send({ error: "Missing required fields." });

    try {
        await service.saveRecord(data);
        res.status(200).json({ data: { success: true }, message: "Medical record saved successfully." });
    } catch (error) {
        console.error("Error saving medical record:", error);
        res.status(500).send({ error: "Failed to save medical record." });
    }
};

exports.savePrescription = async (req, res) => {
    const data = req.body;
    if (!data.id_datlich || !data.id_bacsi || !data.toa_thuoc) return res.status(400).send({ error: "Missing required fields." });

    try {
        await service.savePrescription(data);
        res.status(200).json({ data: { success: true }, message: "Prescription saved successfully." });
    } catch (error) {
        console.error("Error saving prescription:", error);
        res.status(500).send({ error: "Failed to save prescription." });
    }
};
