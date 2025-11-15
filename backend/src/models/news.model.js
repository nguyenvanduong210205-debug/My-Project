const pool = require("../../config/db");

const NewsModel = {
  // 📌 Lấy tất cả bài viết
  async getAll() {
    const [rows] = await pool.query(`
      SELECT id, title, slug, summary, image, author, category, status, created_at
      FROM news
      ORDER BY created_at DESC
    `);

    // 🧠 Chuyển Buffer ảnh sang Base64 để hiển thị
    return rows.map(row => ({
      ...row,
      image: row.image ? row.image.toString("base64") : null,
    }));
  },

  // 📌 Lấy bài viết theo ID
  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM news WHERE id = ? LIMIT 1", [id]);
    const news = rows[0];
    if (!news) return null;

    // Chuyển ảnh sang base64
    news.image = news.image ? news.image.toString("base64") : null;
    return news;
  },

  // 📌 Lấy bài viết theo danh mục
  async getByCategory(category) {
    const [rows] = await pool.query(
      `
      SELECT id, title, slug, summary, image, author, category, status, created_at
      FROM news
      WHERE category = ?
      ORDER BY created_at DESC
      `,
      [category]
    );

    return rows.map(row => ({
      ...row,
      image: row.image ? row.image.toString("base64") : null,
    }));
  },

  // 📌 Thêm mới bài viết
  async create(data) {
    const { title, slug, summary, content, image, author, category, status } = data;
    const validStatus = status === "draft" ? "draft" : "published";

    const [result] = await pool.query(
      `
      INSERT INTO news (title, slug, summary, content, image, author, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [title, slug, summary, content, image, author, category, validStatus]
    );
    return result.insertId;
  },

  // 📌 Cập nhật bài viết
  async update(id, data) {
    const { title, slug, summary, content, image, author, category, status } = data;
    const validStatus = status === "draft" ? "draft" : "published";

    const [result] = await pool.query(
      `
      UPDATE news
      SET title = ?, slug = ?, summary = ?, content = ?, image = ?, author = ?, category = ?, status = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [title, slug, summary, content, image, author, category, validStatus, id]
    );
    return result.affectedRows;
  },

  // 📌 Cập nhật trạng thái
  async updateStatus(id, status) {
    const validStatus = status === "draft" ? "draft" : "published";
    const [result] = await pool.query(
      `UPDATE news SET status = ?, updated_at = NOW() WHERE id = ?`,
      [validStatus, id]
    );
    return result.affectedRows;
  },

  // 📌 Xóa bài viết
  async delete(id) {
    const [result] = await pool.query("DELETE FROM news WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

module.exports = NewsModel;
