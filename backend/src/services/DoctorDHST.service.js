// services/DoctorDHST.service.js
const DoctorDHSTModel = require('../models/DoctorDHST.model');

class DoctorDHSTService {
    constructor(pool) {
        this.doctorModel = new DoctorDHSTModel(pool);
        this.pool = pool;
    }

    // --- Profile & Schedule Services ---
    async getProfile(id_bacsi) {
        console.log("Fetching profile for doctor ID:", id_bacsi);
        console.log("Check doctorModel:", this?.doctorModel);
        return await this?.doctorModel?.findDoctorProfile(id_bacsi);
    }

    async updateProfile(data) {
        if (!data.id_bacsi) throw new Error("Missing doctor ID.");
        const result = await this.doctorModel.updateDoctorProfile(data);
        return result.affectedRows;
    }

    async getSchedule(id_bacsi, ngay) {
        const schedule = await this.doctorModel.findDoctorSchedule(id_bacsi, ngay);
        
        // Định dạng lại dữ liệu và trạng thái cho Frontend
        return schedule.map(row => ({
            id_datlich: row.id_datlich,
            id_benhnhan: row.id_benhnhan || 'N/A', // Dùng N/A nếu chưa tạo hồ sơ BN
            ten_benhnhan: row.ten_benhnhan,
            ngay: row.ngay.toISOString().split('T')[0],
            khung_gio: row.khung_gio.substring(0, 5),
            trang_thai: row.trang_thai === 'CHO_XAC_NHAN' ? 'Chờ xác nhận' :
                        row.trang_thai === 'DA_TAO_HOSO' ? 'Đã tạo hồ sơ' :
                        'Hoàn thành' // HOAN_THANH
        }));
    }
    
    async getStatistics(id_bacsi, today) {
        return await this.doctorModel.findDailyStatistics(id_bacsi, today);
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
