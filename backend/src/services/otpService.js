// src/services/otpService.js
const db = require('../../config/db');
const crypto = require('crypto');
// KHÔNG require twilio khi dùng chế độ mô phỏng

/**
 * Tạo mã OTP ngẫu nhiên 6 chữ số an toàn.
 */
const generateOtp = () => {
    const min = 100000;
    const max = 999999;
    const otp = crypto.randomInt(min, max + 1); 
    return otp.toString();
};

/**
 * Gửi mã OTP: Tạo mã, lưu vào DB và in ra console.
 */
exports.sendOtp = async (phoneNumber) => {
    const otp = generateOtp(); 
    
    // TẠO THỜI GIAN HẾT HẠN TRONG MS
    const expiryTimeMs = Date.now() + 5 * 60 * 1000;
    // TẠO ĐỐI TƯỢNG DATE ĐỂ TRUYỀN CHO MYSQL (KHẮC PHỤC LỖI MÚI GIỜ)
    const expiredAt = new Date(expiryTimeMs); 

    try {
        // 1. Xóa OTP cũ và Lưu trữ OTP mới
        await db.execute(`UPDATE otp_phone SET is_used = 1 WHERE phone = ?`, [phoneNumber]); // Đánh dấu cũ là đã dùng (để tránh lỗi)
        await db.execute(
            `INSERT INTO otp_phone (phone, otp_code, expired_at) VALUES (?, ?, ?)`,
            [phoneNumber, otp, expiredAt] // Truyền đối tượng Date
        );

        // 2. MÔ PHỎNG GỬI SMS
        console.warn(`
            ==================================================
            | 🔑 MÔ PHỎNG GỬI OTP THÀNH CÔNG 🔑
            | SĐT tra cứu: ${phoneNumber}
            | MÃ OTP CẦN NHẬP: ${otp} 
            | (Mã có giá trị đến: ${expiredAt.toLocaleTimeString('vi-VN')})
            ==================================================
        `);
        
        return true; 
    } catch (error) {
        console.error('LỖI LƯU OTP VÀO DATABASE:', error.message);
        return false;
    }
};

/**
 * Xác thực OTP: Kiểm tra mã OTP và trạng thái hết hạn/đã dùng.
 */
exports.verifyOtp = async (phoneNumber, otp) => {
    // 1. TÌM BẢN GHI MỚI NHẤT
    const [rows] = await db.execute(
        // SỬ DỤNG LỆNH SQL ĐƠN GIẢN HƠN VÌ KIỂM TRA THỜI GIAN BẰNG JS
        `SELECT id, expired_at
         FROM otp_phone 
         WHERE phone = ? 
           AND CAST(otp_code AS CHAR) = ? 
           AND is_used = 0
         ORDER BY id DESC LIMIT 1`,
        [phoneNumber, otp]
    );

    if (rows.length === 0) {
        console.warn(`[OTP Verify FAILED] SĐT: ${phoneNumber}. Không tìm thấy mã hoạt động (Sai mã hoặc đã dùng).`);
        return false; 
    }

    const otpRecord = rows[0];
    const expiryTime = new Date(otpRecord.expired_at).getTime(); // Lấy timestamp từ Date Object MySQL
    const currentTime = Date.now(); // Lấy timestamp hiện tại (Node.js)

    // 2. KIỂM TRA THỜI GIAN HẾT HẠN BẰNG JAVASCRIPT
    if (currentTime > expiryTime) {
        // Log báo lỗi hết hạn chi tiết
        console.warn(`[OTP Verify FAILED] Mã đã hết hạn! Current: ${new Date(currentTime).toISOString()}, Expired: ${new Date(expiryTime).toISOString()}`);
        // Đánh dấu hết hạn trong DB
        await db.execute(`UPDATE otp_phone SET is_used = 1 WHERE id = ?`, [otpRecord.id]);
        return false; 
    }
    
    // 3. THÀNH CÔNG
    await db.execute(`UPDATE otp_phone SET is_used = 1 WHERE id = ?`, [otpRecord.id]);
    console.log(`[OTP Verify SUCCESS] Xác thực thành công cho SĐT ${phoneNumber}.`);
    return true; 
};