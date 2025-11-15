const db = require("../../config/db");

class ChatModel {
  static async saveMessage(userMessage, aiResponse) {
    const sql = 'INSERT INTO chat_history (user_message, ai_response) VALUES (?, ?)';
    await db.query(sql, [userMessage, aiResponse]);
  }

  static async getAllMessages() {
    const [rows] = await db.query('SELECT * FROM chat_history ORDER BY id DESC');
    return rows;
  }
}

module.exports = ChatModel;
