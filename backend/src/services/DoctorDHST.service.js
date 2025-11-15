// services/DoctorDHST.service.js
const DoctorDHSTModel = require('../models/DoctorDHST.model');

class DoctorDHSTService {
    constructor(pool) {
        this.doctorModel = new DoctorDHSTModel(pool);
        this.pool = pool;
    }

    // --- Profile & Schedule Services ---
    async getProfile(id_bacsi) {
        return await this.doctorModel.findDoctorProfile(id_bacsi);
    }

    async updateProfile(data) {
        if (!data.id_bacsi) throw new Error("Missing doctor ID.");
        
        // Validation
        if (!data.ho_ten || data.ho_ten.trim() === '') {
            throw new Error("Họ tên không được để trống.");
        }
        
        const result = await this.doctorModel.updateDoctorProfile(data);
        
        if (result.affectedRows === 0) {
            throw new Error("Không tìm thấy bác sĩ hoặc không có thay đổi nào.");
        }
        
        return result.affectedRows;
    }

    async getSchedule(id_bacsi, ngay) {
        const schedule = await this.doctorModel.findDoctorSchedule(id_bacsi, ngay);
        
        // Định dạng lại dữ liệu và trạng thái cho Frontend
        return schedule.map(row => {
            // row.ngay đã là string từ query (ngay_dat as ngay)
            const ngayStr = typeof row.ngay === 'string' ? row.ngay : (row.ngay ? row.ngay.toISOString().split('T')[0] : '');
            // row.khung_gio đã được format từ query
            const gioStr = row.khung_gio || '';
            
            // Map trạng thái từ schema
            let trangThaiText = row.trang_thai;
            if (row.trang_thai === 'Cho xac nhan') {
                trangThaiText = 'Chờ xác nhận';
            } else if (row.trang_thai === 'Da xac nhan') {
                trangThaiText = 'Đã xác nhận';
            } else if (row.trang_thai === 'Huy') {
                trangThaiText = 'Hủy';
            }
            
            return {
                id_datlich: row.id_datlich,
                id_benhnhan: row.id_benhnhan || 'N/A',
                ten_benhnhan: row.ten_benhnhan || 'Chưa có thông tin',
                ngay: ngayStr,
                khung_gio: gioStr,
                trang_thai: trangThaiText
            };
        });
    }
    
    async getStatistics(id_bacsi, today) {
        return await this.doctorModel.findDailyStatistics(id_bacsi, today);
    }

    async getDatlichByBenhnhanAndBacsi(id_benhnhan, id_bacsi) {
        return await this.doctorModel.findDatlichByBenhnhanAndBacsi(id_benhnhan, id_bacsi);
    }


    // --- Medical Record & Prescription Services ---
    async getAllRecordDetails(id_datlich) {
        const appointmentDetails = await this.doctorModel.findAppointmentDetails(id_datlich);
        if (!appointmentDetails) return null;

        // Lấy thông tin chi tiết
        const medicalRecord = await this.doctorModel.findMedicalRecord(id_datlich);
        const prescriptionDetails = await this.doctorModel.findPrescriptionDetails(id_datlich);

        // Gom kết quả
        return {
            appointment: {
                id_datlich: appointmentDetails.id_datlich,
                ngay_kham: appointmentDetails.ngay_kham,
                khung_gio: appointmentDetails.khung_gio
            },
            patient: {
                id: appointmentDetails.id_benhnhan,
                ho_ten: appointmentDetails.ho_ten || appointmentDetails.ten_dat_lich,
                gioi_tinh: appointmentDetails.gioi_tinh,
                ngay_sinh: appointmentDetails.ngay_sinh,
                dia_chi: appointmentDetails.dia_chi,
                sdt: appointmentDetails.sdt
            },
            medicalRecord: medicalRecord || {}, 
            prescription: { toa_thuoc: prescriptionDetails } 
        };
    }

    async saveRecord(data) {
        // Trong trường hợp này, chúng ta giả định BN đã có trong hệ thống hoặc được tạo tự động
        const id_benhnhan = data.id_benhnhan || 'BN001'; 

        return await this.doctorModel.upsertMedicalRecord(data, id_benhnhan);
    }
    
    async savePrescription(data) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            const id_benhnhan = data.id_benhnhan || 'BN001'; 
            
            await this.doctorModel.savePrescription(
                connection, 
                data.id_datlich, 
                id_benhnhan, 
                data.id_bacsi, 
                data.toa_thuoc
            );
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
module.exports = DoctorDHSTService;
