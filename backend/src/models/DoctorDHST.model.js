// models/DoctorDHST.model.js

class DoctorDHSTModel {
    constructor(pool) {
        this.pool = pool;
    }

    // --- Profile & Schedule Queries ---
    async findDoctorProfile(id_bacsi) {
        const [rows] = await this.pool.query(
            `SELECT 
                b.ho_ten, b.hoc_vi, b.chuyen_mon, 
                b.nam_kinh_nghiem, b.email, b.phone, k.ten_khoa
             FROM bacsi b
             LEFT JOIN khoa k ON b.id_khoa = k.id_khoa
             WHERE b.id_bacsi = ?`,
            [id_bacsi]
        );
        return rows[0];
    }

    async updateDoctorProfile(data) {
        const { id_bacsi, ho_ten, hoc_vi, chuyen_mon, nam_kinh_nghiem, email, phone } = data;
        
        // Đảm bảo các giá trị không phải undefined
        const updateData = {
            ho_ten: ho_ten || null,
            hoc_vi: hoc_vi || null,
            chuyen_mon: chuyen_mon || null,
            nam_kinh_nghiem: nam_kinh_nghiem !== undefined && nam_kinh_nghiem !== '' ? parseInt(nam_kinh_nghiem) : null,
            email: email || null,
            phone: phone || null
        };
        
        const [result] = await this.pool.query(
            `UPDATE bacsi SET
             ho_ten=?, hoc_vi=?, chuyen_mon=?, nam_kinh_nghiem=?,
             email=?, phone=?
             WHERE id_bacsi=?`,
            [
                updateData.ho_ten, 
                updateData.hoc_vi, 
                updateData.chuyen_mon, 
                updateData.nam_kinh_nghiem,
                updateData.email, 
                updateData.phone, 
                id_bacsi
            ]
        );
        return result;
    }

    async findDoctorSchedule(id_bacsi, ngay) {
        let dateCondition = '';
        let params = [id_bacsi];
        if (ngay) {
            dateCondition = 'AND dl.ngay_dat = ?';
            params.push(ngay);
        }

        const [rows] = await this.pool.query(
            `SELECT
                dl.id_datlich, 
                dl.ngay_dat as ngay, 
                TIME_FORMAT(dl.gio_dat, '%H:%i') as khung_gio, 
                bn.ho_ten as ten_benhnhan, 
                dl.trang_thai, 
                bn.id_benhnhan
             FROM datlich dl
             LEFT JOIN benhnhan bn ON dl.id_benhnhan = bn.id_benhnhan
             WHERE dl.id_bacsi = ? ${dateCondition}
             ORDER BY dl.ngay_dat, dl.gio_dat`,
            params
        );
        return rows;
    }

    async findDailyStatistics(id_bacsi, today) {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(id_datlich) AS so_benh_nhan,
                SUM(CASE WHEN trang_thai = 'Da xac nhan' THEN 1 ELSE 0 END) AS da_kham
             FROM datlich
             WHERE id_bacsi = ? AND ngay_dat = ?`,
            [id_bacsi, today]
        );
        return rows[0];
    }

    // Lấy id_datlich từ id_benhnhan và id_bacsi (lấy lịch hẹn gần nhất)
    async findDatlichByBenhnhanAndBacsi(id_benhnhan, id_bacsi) {
        const [rows] = await this.pool.query(
            `SELECT id_datlich, ngay_dat, gio_dat, trang_thai
             FROM datlich
             WHERE id_benhnhan = ? AND id_bacsi = ?
             ORDER BY ngay_dat DESC, gio_dat DESC
             LIMIT 1`,
            [id_benhnhan, id_bacsi]
        );
        return rows[0] || null;
    }

    // --- Medical Record & Prescription Queries ---
    async findAppointmentDetails(id_datlich) {
        const [rows] = await this.pool.query(
            `SELECT
                dl.id_datlich, 
                DATE_FORMAT(dl.ngay_dat, '%Y-%m-%d') as ngay_kham, 
                TIME_FORMAT(dl.gio_dat, '%H:%i') as khung_gio,
                bn.id_benhnhan, 
                bn.ho_ten, 
                bn.ho_ten AS ten_dat_lich,
                bn.gioi_tinh, 
                DATE_FORMAT(bn.ngay_sinh, '%Y-%m-%d') as ngay_sinh, 
                bn.dia_chi,
                NULL as sdt
             FROM datlich dl
             LEFT JOIN benhnhan bn ON dl.id_benhnhan = bn.id_benhnhan
             WHERE dl.id_datlich = ?`,
            [id_datlich]
        );
        return rows[0];
    }

    async findMedicalRecord(id_datlich) {
        // Lấy id_lichkham từ datlich trước
        const [lichkhamRows] = await this.pool.query(
            `SELECT id_lichkham FROM lichkham WHERE id_datlich = ? LIMIT 1`,
            [id_datlich]
        );
        
        if (!lichkhamRows || lichkhamRows.length === 0) {
            return null;
        }
        
        const id_lichkham = lichkhamRows[0].id_lichkham;
        
        const [rows] = await this.pool.query(
            `SELECT trieu_chung, chan_doan as chuan_doan, ghi_chu, thuoc_ke_don
             FROM hosokhambenh 
             WHERE id_lichkham = ?`,
            [id_lichkham]
        );
        return rows[0] || null;
    }

    async findPrescriptionDetails(id_datlich) {
        // Lấy id_lichkham từ datlich
        const [lichkhamRows] = await this.pool.query(
            `SELECT id_lichkham FROM lichkham WHERE id_datlich = ? LIMIT 1`,
            [id_datlich]
        );
        
        if (!lichkhamRows || lichkhamRows.length === 0) {
            return [];
        }
        
        const id_lichkham = lichkhamRows[0].id_lichkham;
        
        // Lấy thuốc từ thuoc_ke_don trong hosokhambenh (dạng text)
        const [rows] = await this.pool.query(
            `SELECT thuoc_ke_don
             FROM hosokhambenh 
             WHERE id_lichkham = ?`,
            [id_lichkham]
        );
        
        // Trả về mảng rỗng vì schema không có bảng toa_thuoc/chi_tiet_thuoc
        // Thuốc được lưu dạng text trong thuoc_ke_don
        return rows.length > 0 && rows[0].thuoc_ke_don ? [{ thuoc_ke_don: rows[0].thuoc_ke_don }] : [];
    }

    async upsertMedicalRecord(data, id_benhnhan) {
        const { id_datlich, id_bacsi, trieu_chung, chuan_doan, ghi_chu } = data;
        
        // Lấy hoặc tạo id_lichkham từ datlich
        let [lichkhamRows] = await this.pool.query(
            `SELECT id_lichkham FROM lichkham WHERE id_datlich = ? LIMIT 1`,
            [id_datlich]
        );
        
        let id_lichkham;
        if (!lichkhamRows || lichkhamRows.length === 0) {
            // Tạo mới lichkham nếu chưa có
            // Lấy thông tin từ datlich để tạo lichkham
            const [datlichInfo] = await this.pool.query(
                `SELECT ngay_dat FROM datlich WHERE id_datlich = ?`,
                [id_datlich]
            );
            
            if (!datlichInfo || datlichInfo.length === 0) {
                throw new Error('Không tìm thấy thông tin đặt lịch');
            }
            
            // Lấy id_letan đầu tiên (vì id_letan là NOT NULL trong schema)
            const [letanRows] = await this.pool.query(
                `SELECT id_letan FROM letan LIMIT 1`
            );
            
            if (!letanRows || letanRows.length === 0) {
                throw new Error('Không tìm thấy lễ tân trong hệ thống');
            }
            
            // Tạo lichkham mới (id_letan là NOT NULL trong schema)
            const [lichkhamResult] = await this.pool.query(
                `INSERT INTO lichkham (id_datlich, id_letan, ngay_kham)
                 VALUES (?, ?, ?)`,
                [id_datlich, letanRows[0].id_letan, datlichInfo[0].ngay_dat]
            );
            
            id_lichkham = lichkhamResult.insertId;
        } else {
            id_lichkham = lichkhamRows[0].id_lichkham;
        }
        
        // Kiểm tra xem đã có hồ sơ khám bệnh chưa
        const [existingHoso] = await this.pool.query(
            `SELECT id_hoso FROM hosokhambenh WHERE id_lichkham = ? LIMIT 1`,
            [id_lichkham]
        );
        
        if (existingHoso && existingHoso.length > 0) {
            // UPDATE nếu đã có
            await this.pool.query(
                `UPDATE hosokhambenh 
                SET trieu_chung = ?, chan_doan = ?, ghi_chu = ?
                WHERE id_lichkham = ?`,
                [trieu_chung, chuan_doan, ghi_chu, id_lichkham]
            );
        } else {
            // INSERT nếu chưa có
            await this.pool.query(
                `INSERT INTO hosokhambenh 
                (id_lichkham, trieu_chung, chan_doan, ghi_chu)
                VALUES (?, ?, ?, ?)`,
                [id_lichkham, trieu_chung, chuan_doan, ghi_chu]
            );
        }
        
        await this.pool.query(
            `UPDATE datlich SET trang_thai = 'Da xac nhan' WHERE id_datlich = ?`,
            [id_datlich]
        );
    }
    
    async savePrescription(connection, id_datlich, id_benhnhan, id_bacsi, toa_thuoc) {
        // Lấy hoặc tạo id_lichkham từ datlich
        let [lichkhamRows] = await connection.query(
            `SELECT id_lichkham FROM lichkham WHERE id_datlich = ? LIMIT 1`,
            [id_datlich]
        );
        
        let id_lichkham;
        if (!lichkhamRows || lichkhamRows.length === 0) {
            // Tạo mới lichkham nếu chưa có
            const [datlichInfo] = await connection.query(
                `SELECT ngay_dat FROM datlich WHERE id_datlich = ?`,
                [id_datlich]
            );
            
            if (!datlichInfo || datlichInfo.length === 0) {
                throw new Error('Không tìm thấy thông tin đặt lịch');
            }
            
            // Lấy id_letan đầu tiên (vì id_letan là NOT NULL trong schema)
            const [letanRows] = await connection.query(
                `SELECT id_letan FROM letan LIMIT 1`
            );
            
            if (!letanRows || letanRows.length === 0) {
                throw new Error('Không tìm thấy lễ tân trong hệ thống');
            }
            
            const [lichkhamResult] = await connection.query(
                `INSERT INTO lichkham (id_datlich, id_letan, ngay_kham)
                 VALUES (?, ?, ?)`,
                [id_datlich, letanRows[0].id_letan, datlichInfo[0].ngay_dat]
            );
            
            id_lichkham = lichkhamResult.insertId;
        } else {
            id_lichkham = lichkhamRows[0].id_lichkham;
        }
        
        // Chuyển đổi mảng toa_thuoc thành chuỗi text để lưu vào thuoc_ke_don
        const thuocText = toa_thuoc.map(drug => 
            `${drug.ten_thuoc || ''} - Liều lượng: ${drug.lieu_luong || ''} - ${drug.so_ngay || ''} ngày - Cách dùng: ${drug.cach_dung || ''}`
        ).join('\n');
        
        // Kiểm tra xem đã có hồ sơ khám bệnh chưa
        const [existingHoso] = await connection.query(
            `SELECT id_hoso FROM hosokhambenh WHERE id_lichkham = ? LIMIT 1`,
            [id_lichkham]
        );
        
        if (existingHoso && existingHoso.length > 0) {
            // UPDATE nếu đã có
            await connection.query(
                `UPDATE hosokhambenh 
                SET thuoc_ke_don = ?
                WHERE id_lichkham = ?`,
                [thuocText, id_lichkham]
            );
        } else {
            // INSERT nếu chưa có
            await connection.query(
                `INSERT INTO hosokhambenh 
                (id_lichkham, thuoc_ke_don)
                VALUES (?, ?)`,
                [id_lichkham, thuocText]
            );
        }
        
        // Cập nhật trạng thái đặt lịch
        await connection.query(
            `UPDATE datlich SET trang_thai = 'Da xac nhan' WHERE id_datlich = ?`,
            [id_datlich]
        );
    }
}
module.exports = DoctorDHSTModel;
