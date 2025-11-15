// models/bacsi.model.js
const db = require("../../config/db");

/**
 * Lấy thông tin ca làm việc VÀ danh sách bác sĩ trong ca đó
 */
const getShiftAndDoctors = async (id_khoa, ngay, ca, connection) => {
    // 1. Lấy thông tin ca (gồm id ca và bác sĩ cuối cùng được phân)
    const shiftSql = `
        SELECT id_lichlamviec, last_assigned_bacsi_id 
        FROM lichlamviec 
        WHERE id_khoa = ? AND ngay = ? AND ca = ?
    `;
    const [shiftResult] = await connection.query(shiftSql, [id_khoa, ngay, ca]);
    if (shiftResult.length === 0) {
        throw new Error(`Khoa ${id_khoa} không có lịch làm việc vào ${ca} ngày ${ngay}.`);
    }
    const shiftInfo = shiftResult[0]; // { id_lichlamviec: 1, last_assigned_bacsi_id: 'BS001' }

    // 2. Lấy danh sách bác sĩ được gán vào ca đó
    const doctorsSql = `
        SELECT b.id_bacsi, b.ho_ten, b.chuyen_mon
        FROM lichlamviec_bacsi lvb
        INNER JOIN bacsi b ON lvb.id_bacsi = b.id_bacsi
        WHERE lvb.id_lichlamviec = ?
    `;
    const [onDutyDoctors] = await connection.query(doctorsSql, [shiftInfo.id_lichlamviec]);
    
    if (onDutyDoctors.length === 0) {
        throw new Error(`Ca làm việc (ID: ${shiftInfo.id_lichlamviec}) không có bác sĩ nào được phân công.`);
    }

    return { shiftInfo, onDutyDoctors };
};

/**
 * Cập nhật bác sĩ cuối cùng được phân công cho ca
 */
const updateLastAssignedDoctor = async (id_lichlamviec, id_bacsi, connection) => {
    const sql = "UPDATE lichlamviec SET last_assigned_bacsi_id = ? WHERE id_lichlamviec = ?";
    await connection.query(sql, [id_bacsi, id_lichlamviec]);
    console.log(`✅ Đã cập nhật lượt cho ca ${id_lichlamviec}, bác sĩ cuối cùng là ${id_bacsi}`);
};

module.exports = { getShiftAndDoctors, updateLastAssignedDoctor };