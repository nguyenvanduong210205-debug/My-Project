// controllers/DoctorDHST.controller.js
const DoctorDHSTService = require('../services/DoctorDHST.service');

// Hàm tạo Service instance cho mỗi request
const getService = (req) => new DoctorDHSTService(req.pool);

// --- 1. PROFILE ---
exports.getDoctorProfile = async (req, res) => {
    const { id_bacsi } = req?.query;
    if (!id_bacsi) return res.status(400).send({ error: "Missing doctor ID." });

    try {
        const service = getService(req);
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
        const service = getService(req);
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
        const service = getService(req);
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
        const service = getService(req);
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
        const service = getService(req);
        const details = await service.getAllRecordDetails(id_datlich);

        if (!details) return res.status(404).send({ error: "Appointment not found." });

        res.status(200).json({ data: details });
    } catch (error) {
        console.error("Error fetching full record detail:", error);
        res.status(500).send({ error: "Internal server error." });
    }
};

// --- 5. SAVE RECORDS ---
exports.saveMedicalRecord = async (req, res) => {
    const data = req.body;
    if (!data.id_datlich || !data.id_bacsi) return res.status(400).send({ error: "Missing required fields." });

    try {
        const service = getService(req);
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
        const service = getService(req);
        await service.savePrescription(data);
        res.status(200).json({ data: { success: true }, message: "Prescription saved successfully." });
    } catch (error) {
        console.error("Error saving prescription:", error);
        res.status(500).send({ error: "Failed to save prescription." });
    }
};
