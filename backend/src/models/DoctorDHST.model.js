// models/DoctorDHST.model.js

class DoctorDHSTModel {
    constructor(pool) {
        this.pool = pool;
    }

    // --- Profile & Schedule Queries ---
    async findDoctorProfile(id_bacsi) {
        const [rows] = await this.pool.query(
            `SELECT 
                b.ho_ten, b.hoc_vi, b.chuc_vu, b.chuyen_mon, 
                b.nam_kinh_nghiem, b.email, b.phone, b.diachi, k.ten_khoa
             FROM bacsi b
             LEFT JOIN khoa k ON b.id_khoa = k.id_khoa
             WHERE b.id_bacsi = ?`,
            [id_bacsi]
        );
        return rows[0];
    }

    async updateDoctorProfile(data) {
        const { id_bacsi, ho_ten, hoc_vi, chuc_vu, chuyen_mon, nam_kinh_nghiem, email, phone, diachi } = data;
        const [result] = await this.pool.query(
            `UPDATE bacsi SET
             ho_ten=?, hoc_vi=?, chuc_vu=?, chuyen_mon=?, nam_kinh_nghiem=?,
             email=?, phone=?, diachi=?
             WHERE id_bacsi=?`,
            [ho_ten, hoc_vi, chuc_vu, chuyen_mon, nam_kinh_nghiem, email, phone, diachi, id_bacsi]
        );
        return result;
    }

    async findDoctorSchedule(id_bacsi, ngay) {
        let dateCondition = '';
        let params = [id_bacsi];
        if (ngay) {
            dateCondition = 'AND dl.ngay = ?';
            params.push(ngay);
        }

        const [rows] = await this.pool.query(
            `SELECT
                dl.id_datlich, dl.ngay, dl.khung_gio, 
                dl.ten_benhnhan, dl.trang_thai, bn.id_benhnhan
             FROM dat_lich dl
             LEFT JOIN benhnhan bn ON dl.sdt = bn.phone
             WHERE dl.id_bacsi = ? ${dateCondition}
             ORDER BY dl.ngay, dl.khung_gio`,
            params
        );
        return rows;
    }

    async findDailyStatistics(id_bacsi, today) {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(id_datlich) AS so_benh_nhan,
                SUM(CASE WHEN trang_thai = 'HOAN_THANH' THEN 1 ELSE 0 END) AS da_kham
             FROM dat_lich
             WHERE id_bacsi = ? AND ngay = ?`,
            [id_bacsi, today]
        );
        return rows[0];
    }

    // --- Medical Record & Prescription Queries ---
    async findAppointmentDetails(id_datlich) {
        const [rows] = await this.pool.query(
            `SELECT
                dl.id_datlich, DATE_FORMAT(dl.ngay, '%Y-%m-%d') as ngay_kham, dl.khung_gio, dl.ten_benhnhan AS ten_dat_lich, dl.sdt,
                bn.id_benhnhan, bn.ho_ten, bn.gioi_tinh, DATE_FORMAT(bn.ngay_sinh, '%Y-%m-%d') as ngay_sinh, bn.dia_chi
             FROM dat_lich dl
             LEFT JOIN benhnhan bn ON dl.sdt = bn.phone
             WHERE dl.id_datlich = ?`,
            [id_datlich]
        );
        return rows[0];
    }

    async findMedicalRecord(id_datlich) {
        const [rows] = await this.pool.query(
            `SELECT trieu_chung, chuan_doan, ghi_chu 
             FROM ho_so_kham 
             WHERE id_datlich = ?`,
            [id_datlich]
        );
        // Lưu ý: Trường ket_qua_xet_nghiem không có trong schema bạn cung cấp, chỉ có trieu_chung, chuan_doan, ghi_chu
        return rows[0];
    }

    async findPrescriptionDetails(id_datlich) {
        const [rows] = await this.pool.query(
            `SELECT 
                ct.ten_thuoc, ct.lieu_luong, ct.so_ngay, ct.cach_dung
             FROM ho_so_kham h
             JOIN toa_thuoc t ON h.id_hoso = t.id_hoso
             JOIN chi_tiet_thuoc ct ON t.id_toa = ct.id_toa
             WHERE h.id_datlich = ?`,
            [id_datlich]
        );
        return rows;
    }

    async upsertMedicalRecord(data, id_benhnhan) {
        const { id_datlich, id_bacsi, trieu_chung, chuan_doan, ghi_chu } = data;
        
        await this.pool.query(
            `INSERT INTO ho_so_kham 
            (id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, 'DA_KHAM')
            ON DUPLICATE KEY UPDATE
            id_benhnhan=VALUES(id_benhnhan), id_bacsi=VALUES(id_bacsi), trieu_chung=VALUES(trieu_chung), 
            chuan_doan=VALUES(chuan_doan), ghi_chu=VALUES(ghi_chu), trang_thai='DA_KHAM'`,
            [id_datlich, id_benhnhan, id_bacsi, trieu_chung, chuan_doan, ghi_chu]
        );
        
        await this.pool.query(
            `UPDATE dat_lich SET trang_thai = 'HOAN_THANH' WHERE id_datlich = ?`,
            [id_datlich]
        );
    }
    
    async savePrescription(connection, id_datlich, id_benhnhan, id_bacsi, toa_thuoc) {
        
        // 1. Đảm bảo hồ sơ khám tồn tại và lấy id_hoso
        const [hsInsertResult] = await connection.query(
            `INSERT INTO ho_so_kham (id_datlich, id_benhnhan, id_bacsi)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE id_hoso=LAST_INSERT_ID(id_hoso), id_bacsi=VALUES(id_bacsi)`,
            [id_datlich, id_benhnhan, id_bacsi]
        );
        const id_hoso = hsInsertResult.insertId;

        // 2. Chèn vào toa_thuoc (giả sử một hồ sơ khám chỉ có 1 toa/ngày)
        const [toaInsertResult] = await connection.query(
            `INSERT INTO toa_thuoc (id_hoso, id_benhnhan, id_bacsi)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE id_toa=LAST_INSERT_ID(id_toa), id_bacsi=VALUES(id_bacsi)`,
            [id_hoso, id_benhnhan, id_bacsi]
        );
        const id_toa = toaInsertResult.insertId;

        // 3. Xóa chi tiết thuốc cũ
        await connection.query('DELETE FROM chi_tiet_thuoc WHERE id_toa = ?', [id_toa]);

        // 4. Chèn chi tiết thuốc mới
        const insertCtSql = `INSERT INTO chi_tiet_thuoc (id_toa, ten_thuoc, lieu_luong, so_ngay, cach_dung) VALUES ?`;
        const ctValues = toa_thuoc.map(drug => [
            id_toa, drug.ten_thuoc, drug.lieu_luong, drug.so_ngay, drug.cach_dung
        ]);
        
        if (ctValues.length > 0) {
            await connection.query(insertCtSql, [ctValues]);
        }
    }
}
module.exports = DoctorDHSTModel;
