// models/khoa.model.js
const db = require("../../config/db");

const findAll = async () => {
  const [rows] = await db.query("SELECT id_khoa, ten_khoa FROM khoa ORDER BY ten_khoa ASC");
  return rows;
};

//Hàm findById để lấy thông tin chi tiết một khoa
const findById = async (id_khoa, connection) => {
    // Sử dụng connection được truyền vào từ service để đảm bảo transaction
    const conn = connection || db;
    
    // Chỉ cần lấy ten_khoa để gửi vào email
    const [rows] = await conn.query(
        "SELECT ten_khoa FROM khoa WHERE id_khoa = ?",
        [id_khoa]
    );
    
    return rows[0] || null;
};

module.exports = { 
    findAll, 
    findById 
};