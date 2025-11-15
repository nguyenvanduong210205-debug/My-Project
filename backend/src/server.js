require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const db = require("../config/db"); // 🔥 đổi ./config -> ../config

const PORT = process.env.PORT || 3000;

// ================== MIDDLEWARE CƠ BẢN ==================
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // ✅ tăng limit cho base64
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ================== IMPORT CÁC ROUTES ==================
const userRoutes = require("./routes/user.routes");
const khoaRoutes = require("./routes/khoa.routes");
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const newsRoutes = require("./routes/news.routes");
const appointmentRoutes = require("./routes/datlich.routes");
const chatRoutes = require("./routes/chat.routes");
const patientRoutes = require("./routes/patient.routes");
const listDoctorRoutes = require("./routes/listdoctor.routes");
const lichLamViecRoutes = require("./routes/lichlamviec.routes");
const letanRoutes = require("./routes/letan.routes");
const DoctorDHSTRoutes = require("./routes/DoctorDHST.routes");
const hoSoRoutes = require("./routes/hoso.routes");//Sáng
const datLichLeTanRoutes = require("./routes/datlichletan.routes");//Sáng
// nếu file routes nằm trong src/routes/datlichletan.routes.js
app.use("/api/datlichletan", datLichLeTanRoutes);//Sáng

// ================== PHỤC VỤ FRONTEND ==================
//giao dien danh cho benh nhan
app.use(express.static(path.join(__dirname, "../../frontend/pages/giaodienbenhnhan")));

// Khi vào trang chủ -> tự động mở index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/pages/giaodienbenhnhan/index.html"));
});

//giao dien dành cho nhân viên
app.use(express.static(path.join(__dirname, "../../frontend/pages")));

app.get("/login", (req,res)=>{
  res.sendFile(path.join(__dirname, "../../frontend/pages/nhanvien/login.html"))
});
// ================== GẮN ROUTE API ==================
app.use("/api/users", userRoutes);
app.use("/api/khoa", khoaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/datlich", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/listdoctor", listDoctorRoutes);
app.use("/api/lichlamviec", lichLamViecRoutes);
app.use("/api/letan", letanRoutes);
app.use("/api/DoctorDHST", DoctorDHSTRoutes);
app.use("/api/hoso", hoSoRoutes);//Sáng

// ================== XỬ LÝ LỖI ==================
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("🔥 Lỗi server:", err.stack);
  res.status(500).json({ message: "Đã có lỗi xảy ra trên máy chủ." });
});

// ================== KHỞI ĐỘNG SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
