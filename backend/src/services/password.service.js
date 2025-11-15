const bcrypt = require("bcrypt");

// Sinh mật khẩu ngẫu nhiên
function generatePassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Hash mật khẩu
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = { generatePassword, hashPassword };
