// controllers/datlich.controller.js
const appointmentService = require('../services/appointment.service'); // 1. Import service mới

const createDatLich = async (req, res) => {
    try {
        // 2. Lấy toàn bộ dữ liệu từ form
        const formData = req.body;

        // 3. Kiểm tra đầu vào cơ bản (có thể thêm nhiều kiểm tra hơn)
        const { ten_benhnhan, sdt, ngay, khung_gio, id_khoa } = formData;
        if (!ten_benhnhan || !sdt || !ngay || !khung_gio || !id_khoa) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng điền đầy đủ thông tin bắt buộc." 
            });
        }

        // 4. Gọi service để xử lý toàn bộ logic phức tạp
        const result = await appointmentService.createNewAppointment(formData);

        // 5. Trả về kết quả thành công cho người dùng
        res.status(201).json({
            success: true,
            message: "Đặt lịch thành công!",
            data: result, // Dữ liệu trả về từ service
        });

    } catch (error) {
        // Bắt lỗi từ service và gửi về thông báo lỗi
        console.error("Lỗi tại datlich.controller:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Đã có lỗi xảy ra trên máy chủ."
        });
    }
};

const DatLichModel = require('../models/datlich.model');
const getFullSlots = async (req, res) => {
    try {
        const { ngay, id_khoa } = req.query;
        if (!ngay || !id_khoa) {
            return res.status(400).json({ message: "Thiếu thông tin ngày hoặc khoa." });
        }
        const fullSlots = await DatLichModel.findFullSlots(ngay, id_khoa);
        res.status(200).json({ success: true, data: fullSlots });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kiểm tra lịch hẹn." });
    }
};

module.exports = { createDatLich, getFullSlots };