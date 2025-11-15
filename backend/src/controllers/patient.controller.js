// controllers/patientController.js
const patientModel = require('../models/patientModel');
const otpService = require('../services/otpService');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// --- Hàm định dạng ngày (yyyy-mm-dd → dd/mm/yyyy)
const formatDbDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        return typeof dateValue === 'string' && dateValue.length <= 10
            ? dateValue.split('-').reverse().join('/')
            : 'N/A';
    }
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// --- 1️⃣ Gửi số điện thoại và yêu cầu OTP ---
exports.requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber)
        return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại.' });

    try {
        const patients = await patientModel.findPatientsByPhone(phoneNumber);

        if (patients.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy bệnh nhân nào có số điện thoại này.'
            });
        }

        const success = await otpService.sendOtp(phoneNumber);
        if (!success) throw new Error('Lỗi gửi OTP');

        res.json({
            message: 'Đã gửi mã OTP đến số điện thoại của bạn.',
            phoneNumber
        });
    } catch (err) {
        console.error('Error requestOtp:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi gửi mã OTP.' });
    }
};

// --- 2️⃣ Xác thực OTP và lấy danh sách bệnh nhân ---
exports.verifyOtpAndGetPatients = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp)
        return res.status(400).json({ message: 'Thiếu số điện thoại hoặc mã OTP.' });

    try {
        const isValid = await otpService.verifyOtp(phoneNumber, otp);
        if (!isValid)
            return res.status(401).json({ message: 'Mã OTP không hợp lệ hoặc hết hạn.' });

        const patients = await patientModel.findPatientsByPhone(phoneNumber);

        res.json({
            message: 'Xác thực thành công.',
            patients: patients.map(p => ({
                id_benhnhan: p.id_benhnhan,
                ho_ten: p.ho_ten,
                ngay_sinh: formatDbDate(p.ngay_sinh),
                gioi_tinh: p.gioi_tinh
            }))
        });
    } catch (err) {
        console.error('Error verifyOtp:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi xác thực OTP.' });
    }
};

// --- 3️⃣ Lấy danh sách các lần khám của bệnh nhân ---
exports.getPatientVisits = async (req, res) => {
    const { patientId } = req.params;

    try {
        const visits = await patientModel.getVisitsByPatientId(patientId);
        if (!visits || visits.length === 0)
            return res.status(404).json({ message: 'Bệnh nhân chưa có lần khám nào.' });

        res.json({
            visits: visits.map(v => ({
                id_lichkham: v.id_lichkham,
                ngay_kham: formatDbDate(v.ngay_kham),
                khoa: v.ten_khoa,
                bacsi: v.ten_bacsi,
                chan_doan_tom_tat: v.chan_doan || 'Chưa cập nhật'
            }))
        });
    } catch (err) {
        console.error('Error getPatientVisits:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách khám.' });
    }
};

// --- 4️⃣ Lấy chi tiết 1 lần khám ---
exports.getVisitDetails = async (req, res) => {
    const { lichKhamId } = req.params;

    try {
        const details = await patientModel.getVisitDetails(lichKhamId);
        if (!details)
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ khám bệnh.' });

        res.json({ details });
    } catch (err) {
        console.error('Error getVisitDetails:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi lấy chi tiết hồ sơ.' });
    }
};

// --- 5️⃣ Lấy chi tiết bệnh nhân theo ID ---
exports.getPatientDetail = async (req, res) => {
    const { id_benhnhan } = req.query;
    
    if (!id_benhnhan) {
        return res.status(400).json({ message: 'Thiếu ID bệnh nhân.' });
    }

    try {
        const BenhNhanModel = require('../models/benhnhan.model');
        const patient = await BenhNhanModel.getById(id_benhnhan);
        
        if (!patient) {
            return res.status(404).json({ message: 'Không tìm thấy bệnh nhân.' });
        }

        res.json({ data: patient });
    } catch (err) {
        console.error('Error getPatientDetail:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi lấy chi tiết bệnh nhân.' });
    }
};

// --- 5️⃣ Xuất PDF hồ sơ khám bệnh ---
exports.downloadVisitPdf = async (req, res) => {
    const { lichKhamId } = req.params;

    try {
        const details = await patientModel.getVisitDetails(lichKhamId);
        console.log("details from model:", details);

        if (!details) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu hồ sơ để tạo PDF." });
        }

        // --- Chuẩn bị dữ liệu ---
        const patientName = details.ten_benhnhan || 'Khong_ro_ten';
        const doctorName = details.ten_bacsi || 'Không rõ';
        const chuyenKhoa = details.ten_khoa || 'Không rõ';
        const ngayKhamFormatted = formatDbDate(details.ngay_kham);

        // --- Tên file PDF ---
        const rawFilename = `HoSoKhamBenh_${patientName.replace(/\s/g, '_')}_REC-${lichKhamId}.pdf`;
        const encodedFilename = encodeURIComponent(rawFilename);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedFilename}`);

        // --- Tạo tài liệu PDF ---
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // --- Font tiếng Việt ---
        const fontPath = path.resolve(__dirname, '..', 'vietnam-font.ttf');
        if (fs.existsSync(fontPath)) {
            doc.registerFont('VN', fontPath);
            doc.font('VN');
        } else {
            console.warn('⚠ Font file không tồn tại, dùng Helvetica.');
            doc.font('Helvetica');
        }

        // --- Header ---
        doc.fontSize(20).fillColor('#000').text('BỆNH ÁN ĐIỆN TỬ DHST HOSPITAL', { align: 'center' }).moveDown(1);

        // --- Thông tin bệnh nhân ---
        doc.fontSize(14).fillColor('#1565C0').text('THÔNG TIN BỆNH NHÂN:', { underline: true }).moveDown(0.5);
        doc.fillColor('#000').fontSize(12);
doc.text(`- Họ tên: ${details.ho_ten_bn || 'Không rõ tên bệnh nhân'}`);
doc.text(`(ID: ${details.id_hoso || 'N/A'})`);
doc.text(`- Ngày sinh: ${formatDbDate(details.ngay_sinh_bn)}   Giới tính: ${details.gioi_tinh_bn || 'N/A'}`);
doc.text(`- SĐT: ${details.sdt_bn || 'N/A'}`);
doc.text(`- Email: ${details.email_bn || 'N/A'}`);
doc.moveDown(1);

        // --- Thông tin khám bệnh ---
        doc.fontSize(14).fillColor('#f4b400').text('THÔNG TIN KHÁM BỆNH:', { underline: true }).moveDown(0.5);
        doc.fillColor('#000').fontSize(12);
        doc.text(`- Ngày khám: ${ngayKhamFormatted}`);
        doc.text(`- Bác sĩ: BS. ${doctorName}   Chuyên khoa: ${chuyenKhoa}`);
        doc.moveDown(1);

        // --- Chi tiết bệnh án ---
        doc.fontSize(14).fillColor('#CC0000').text('CHI TIẾT BỆNH ÁN:', { underline: true }).moveDown(0.5);
        doc.fillColor('#000').fontSize(12);
        doc.text(`Chẩn đoán: ${details.chuan_doan || 'N/A'}`);
        doc.text(`Triệu chứng: ${details.trieu_chung || 'N/A'}`);
        doc.text(`Ghi chú BS: ${details.ghi_chu || 'Không có ghi chú'}`);
        doc.moveDown(1);

        // --- Đơn thuốc kê đơn ---
        doc.fontSize(14).fillColor('#28a745').text('ĐƠN THUỐC KÊ ĐƠN:', { underline: true }).moveDown(0.5);
        doc.fillColor('#000');

        if (details.thuoc_ke_don) {
            try {
                const meds = JSON.parse(details.thuoc_ke_don);
                meds.forEach((m, i) => {
                    doc.text(`${i + 1}. ${m.ten_thuoc || 'Không rõ'} - ${m.lieu_luong || ''} - ${m.cach_dung || ''}`);
                });
            } catch {
                doc.text(details.thuoc_ke_don);
            }
        } else {
            doc.text('Không có thuốc được kê đơn.');
        }

        doc.moveDown(2);
        doc.fontSize(12).fillColor('#777').text('--- Hết hồ sơ khám bệnh ---', { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('Error downloadVisitPdf:', err);
        if (!res.headersSent)
            res.status(500).json({ message: 'Lỗi khi tạo PDF hồ sơ bệnh nhân.' });
    }
};
