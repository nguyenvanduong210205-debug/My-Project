const pool = require("../../config/db");

async function findUserByUsername(username) {
  const [rows] = await pool.query("SELECT * FROM taikhoan WHERE username = ?", [username]);
  return rows[0];
}

module.exports = { findUserByUsername };
