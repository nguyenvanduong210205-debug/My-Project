require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
  if (err) {
    switch (err.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('❌ Sai tài khoản hoặc mật khẩu MySQL.');
        break;
      case 'ENOTFOUND':
        console.error('❌ Không tìm thấy host MySQL.');
        break;
      default:
        console.error('❌ Lỗi kết nối database:', err);
    }
  } else {
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
  }
});

module.exports = pool.promise();
