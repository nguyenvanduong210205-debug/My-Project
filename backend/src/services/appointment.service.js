// services/appointment.service.js
const db = require('../../config/db');
const Bacsi = require('../models/bacsi.model');
const DatLich = require('../models/datlich.model');
const Khoa = require('../models/khoa.model'); // Vẫn giữ lại để lấy tên khoa
const { sendBookingConfirmationEmail } = require('./email.service');

const MAX_APPOINTMENTS_PER_KHOA = 9;

const getCaFromKhungGio = (khung_gio) => {
    const hour = parseInt(khung_gio.split(':')[0]);
    if (hour < 12) return 'Sang';
    return 'Chieu';
};

const createNewAppointment = async (formData) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        const { ten_benhnhan, sdt, email, ngay, khung_gio, id_khoa, ly_do } = formData;

        // 1. Lấy tên khoa (để gửi email)
        const khoa = await Khoa.findById(id_khoa, connection);
        if (!khoa) {
            throw new Error('Mã khoa không hợp lệ.');
        }
        
        // 2. Kiểm tra tổng số lịch hẹn của khoa
        const khoaAppointmentCount = await DatLich.countInSlot(ngay, khung_gio, id_khoa, connection);
        if (khoaAppointmentCount >= MAX_APPOINTMENTS_PER_KHOA) {
            throw new Error('Khung giờ tại khoa bạn chọn đã đầy.');
        }

        const caLamViec = getCaFromKhungGio(khung_gio);
        if (!caLamViec) throw new Error("Khung giờ không hợp lệ.");
        
        // 3. LẤY THÔNG TIN CA VÀ BÁC SĨ TỪ CSDL (LOGIC MỚI)
        const { shiftInfo, onDutyDoctors } = await Bacsi.getShiftAndDoctors(id_khoa, ngay, caLamViec, connection);
        
        // 4. TÍNH TOÁN VÒNG TRÒN DỰA TRÊN CSDL (LOGIC MỚI)
        let startIndex = 0;
        if (shiftInfo.last_assigned_bacsi_id) {
            const lastIndex = onDutyDoctors.findIndex(doc => doc.id_bacsi === shiftInfo.last_assigned_bacsi_id);
            if (lastIndex !== -1) {
                startIndex = (lastIndex + 1) % onDutyDoctors.length;
            }
        }
        const rankedDoctors = [...onDutyDoctors.slice(startIndex), ...onDutyDoctors.slice(0, startIndex)];

        // 5. Lặp qua danh sách đã ưu tiên để tìm người còn slot
        const limitPerDoctor = Math.ceil(MAX_APPOINTMENTS_PER_KHOA / onDutyDoctors.length);
        let assignedDoctor = null;

        for (const doctor of rankedDoctors) {
            const count = await DatLich.countAppointmentsForDoctorInSlot(ngay, khung_gio, doctor.id_bacsi, connection);
            if (count < limitPerDoctor) {
                assignedDoctor = doctor; 
                break; 
            }
        }
        
        if (!assignedDoctor) {
            throw new Error('Tất cả bác sĩ đều đã đủ lượt hẹn.');
        }

        // 6. Tạo lịch hẹn
        const newAppointmentData = { ten_benhnhan, sdt, email, ngay, khung_gio, id_khoa, ly_do, id_bacsi: assignedDoctor.id_bacsi, trang_thai: 'CHO_XAC_NHAN' };
        const newAppointment = await DatLich.create(newAppointmentData, connection);
        
        // 7. CẬP NHẬT LƯỢT VÀO CSDL (LOGIC MỚI)
        await Bacsi.updateLastAssignedDoctor(shiftInfo.id_lichlamviec, assignedDoctor.id_bacsi, connection);

        await connection.commit();
        
        const result = { 
            appointment: newAppointment, 
            doctor: assignedDoctor, 
            ten_khoa: khoa.ten_khoa // Thêm tên khoa để gửi mail
        };
        sendBookingConfirmationEmail(result);
        return result; 

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { createNewAppointment };