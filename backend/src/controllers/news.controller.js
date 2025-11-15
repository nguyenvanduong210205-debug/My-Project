const NewsModel = require("../models/news.model");
const fs = require("fs");

// 🧩 Tạo slug từ tiêu đề (VD: "Tin mới hôm nay" → "tin-moi-hom-nay")
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const NewsController = {
  // 📋 Lấy tất cả bài viết
  async getAll(req, res) {
    try {
      const news = await NewsModel.getAll();

      // 🖼️ Chuyển ảnh Binary → Base64 có prefix data URI
      const formatted = news.map(item => ({
        ...item,
        image: item.image
          ? `data:image/jpeg;base64,${item.image.toString("base64")}`
          : null,
      }));

      res.status(200).json(formatted);
    } catch (err) {
      console.error("❌ Lỗi getAll:", err);
      res.status(500).json({ error: "Không thể tải danh sách bài viết" });
    }
  },

  // 🔍 Lấy bài viết theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const news = await NewsModel.getById(id);
      if (!news) return res.status(404).json({ error: "Không tìm thấy bài viết" });

      news.image = news.image
        ? `data:image/jpeg;base64,${news.image.toString("base64")}`
        : null;

      res.json(news);
    } catch (err) {
      console.error("❌ Lỗi getById:", err);
      res.status(500).json({ error: "Không thể tải bài viết" });
    }
  },

  // 🗂️ Lấy bài viết theo danh mục
  async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const news = await NewsModel.getByCategory(category);

      const formatted = news.map(item => ({
        ...item,
        image: item.image
          ? `data:image/jpeg;base64,${item.image.toString("base64")}`
          : null,
      }));

      res.json(formatted);
    } catch (err) {
      console.error("❌ Lỗi getByCategory:", err);
      res.status(500).json({ error: "Không thể tải bài viết theo danh mục" });
    }
  },

  // ➕ Thêm bài viết mới (lưu ảnh vào DB)
  async create(req, res) {
    try {
      const { title, summary, content, author, category } = req.body;
      if (!title || !content)
        return res.status(400).json({ error: "Thiếu tiêu đề hoặc nội dung" });

      let imageBuffer = null;

      // 🖼️ Có upload file qua form-data
      if (req.file) {
        imageBuffer = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path); // ✅ Xóa file tạm
      }

      // 🖼️ Hoặc gửi ảnh Base64 qua body JSON
      if (!imageBuffer && req.body.imageBase64) {
        imageBuffer = Buffer.from(req.body.imageBase64, "base64");
      }

      const slug = generateSlug(title);
      const status = "published";

      const newId = await NewsModel.create({
        title,
        slug,
        summary,
        content,
        image: imageBuffer,
        author,
        category,
        status,
      });

      res.json({ message: "✅ Đăng bài thành công!", id: newId });
    } catch (err) {
      console.error("❌ Lỗi create:", err);
      res.status(500).json({ error: "Không thể tạo bài viết" });
    }
  },

  // ✏️ Cập nhật bài viết
  async update(req, res) {
    try {
      const { id } = req.params;
      const existing = await NewsModel.getById(id);
      if (!existing) return res.status(404).json({ error: "Không tìm thấy bài viết" });

      const { title, summary, content, author, category, status } = req.body;
      let imageBuffer = existing.image;

      if (req.file) {
        imageBuffer = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path);
      }

      if (req.body.imageBase64) {
        imageBuffer = Buffer.from(req.body.imageBase64, "base64");
      }

      const updatedData = {
        title: title || existing.title,
        slug: title ? generateSlug(title) : existing.slug,
        summary: summary || existing.summary,
        content: content || existing.content,
        image: imageBuffer,
        author: author || existing.author,
        category: category || existing.category,
        status: status || existing.status,
      };

      const affected = await NewsModel.update(id, updatedData);
      if (affected === 0) return res.status(400).json({ error: "Không thể cập nhật bài viết" });

      res.json({ message: "✅ Cập nhật bài viết thành công!" });
    } catch (err) {
      console.error("❌ Lỗi update:", err);
      res.status(500).json({ error: "Không thể cập nhật bài viết" });
    }
  },

  // 🗑️ Xóa bài viết
  async delete(req, res) {
    try {
      const { id } = req.params;
      const news = await NewsModel.getById(id);
      if (!news) return res.status(404).json({ error: "Không tìm thấy bài viết" });

      await NewsModel.delete(id);
      res.json({ message: "🗑️ Đã xóa bài viết thành công!" });
    } catch (err) {
      console.error("❌ Lỗi delete:", err);
      res.status(500).json({ error: "Không thể xóa bài viết" });
    }
  },

  // 🔄 Cập nhật trạng thái bài viết
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const news = await NewsModel.getById(id);
      if (!news) return res.status(404).json({ error: "Không tìm thấy bài viết" });

      await NewsModel.updateStatus(id, status);
      res.json({ message: "✅ Cập nhật trạng thái thành công!", status });
    } catch (err) {
      console.error("❌ Lỗi updateStatus:", err);
      res.status(500).json({ error: "Không thể cập nhật trạng thái bài viết" });
    }
  },
};

module.exports = NewsController;
