// models/datlich.model.js
const db = require("../../config/db");

const DatLich = {
    /**
     * Tạo một lịch hẹn mới trong bảng dat_lich.
     * @param {object} bookingData - Dữ liệu lịch hẹn khớp với các cột trong bảng.
     * @param {object} connection - Đối tượng kết nối CSDL để dùng trong transaction.
     * @returns {object} - Thông tin lịch hẹn vừa được tạo.
     */
    create: async (bookingData, connection) => {
        const sql = "INSERT INTO dat_lich SET ?";
        const [result] = await connection.query(sql, bookingData);
        return { id_datlich: result.insertId, ...bookingData };
    },

    /**
     * Đếm số lượng lịch hẹn của MỘT BÁC SĨ trong một khung giờ cụ thể.
     * Dùng để kiểm tra xem bác sĩ đã nhận đủ 10 bệnh nhân hay chưa.
     * @returns {number} - Số lượng lịch hẹn (ví dụ: 0, 1, 2...).
     */
    countAppointmentsForDoctorInSlot: async (ngay, khung_gio, id_bacsi, connection) => {
        const sql = `
            SELECT COUNT(*) as count 
            FROM dat_lich
            WHERE ngay = ? AND khung_gio = ? AND id_bacsi = ? AND trang_thai != 'HOAN_THANH'
        `;
        const [rows] = await connection.query(sql, [ngay, khung_gio, id_bacsi]);
        return rows[0].count;
    },
     countInSlot: async (ngay, khung_gio, id_khoa, connection) => {
        const sql = `
            SELECT COUNT(*) as count 
            FROM dat_lich
            WHERE ngay = ? AND khung_gio = ? AND id_khoa = ? AND trang_thai != 'HOAN_THANH'
        `;
        const [rows] = await connection.query(sql, [ngay, khung_gio, id_khoa]);
        return rows[0].count;
    },
    /**
     * Tìm tất cả các khung giờ đã ĐẦY (đủ 10 người) trong MỘT KHOA vào một ngày.
     * Dùng cho chức năng làm mờ các lựa chọn trên frontend.
     * @returns {Array<string>} - Mảng các khung giờ đã đầy (ví dụ: ['07:00:00', '09:00:00']).
     */
    findFullSlots: async (ngay, id_khoa) => {
        const sql = `
            SELECT khung_gio
            FROM dat_lich
            WHERE ngay = ? AND id_khoa = ? AND trang_thai != 'HOAN_THANH'
            GROUP BY khung_gio
            HAVING COUNT(*) >= 10;
        `;
        const [rows] = await db.query(sql, [ngay, id_khoa]);
        return rows.map(row => row.khung_gio);
    }
};

module.exports = DatLich;