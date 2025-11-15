require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Mật khẩu mặc định cho tất cả tài khoản (sẽ hash)
const DEFAULT_PASSWORD = "123456";

// Hàm hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Hàm tạo slug từ title
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Hàm tạo ngày ngẫu nhiên trong khoảng
function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
}

// Hàm format date cho MySQL
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

async function seedDatabase() {
  const connection = await db.getConnection();

  try {
    console.log("🌱 Bắt đầu seed database...\n");

    // Hash password mặc định
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    console.log("✅ Đã hash password mặc định: 123456\n");

    // ==================== 1. SEED KHOA ====================
    console.log("📋 Đang seed dữ liệu KHOA...");
    const khoaData = [
      {
        ten_khoa: "Khoa Tim mạch",
        mo_ta:
          "Chuyên khám và điều trị các bệnh lý về tim mạch, huyết áp, rối loạn nhịp tim. Đội ngũ bác sĩ giàu kinh nghiệm với trang thiết bị hiện đại.",
      },
      {
        ten_khoa: "Khoa Nội tiêu hóa",
        mo_ta:
          "Chẩn đoán và điều trị các bệnh lý về đường tiêu hóa, gan mật, dạ dày. Áp dụng các phương pháp nội soi tiên tiến.",
      },
      {
        ten_khoa: "Khoa Thần kinh",
        mo_ta:
          "Chuyên điều trị các bệnh lý thần kinh, đau đầu, động kinh, đột quỵ. Có máy MRI, CT scan hiện đại.",
      },
      {
        ten_khoa: "Khoa Cơ xương khớp",
        mo_ta:
          "Điều trị các bệnh về xương khớp, thoái hóa, viêm khớp. Phục hồi chức năng và vật lý trị liệu.",
      },
      {
        ten_khoa: "Khoa Sản phụ khoa",
        mo_ta:
          "Chăm sóc sức khỏe phụ nữ, khám thai, sinh đẻ an toàn. Đội ngũ bác sĩ sản phụ khoa giàu kinh nghiệm.",
      },
      {
        ten_khoa: "Khoa Nhi",
        mo_ta:
          "Chăm sóc sức khỏe trẻ em từ sơ sinh đến 15 tuổi. Môi trường thân thiện, trang thiết bị chuyên biệt cho trẻ em.",
      },
    ];

    // Lưu lại ID thực tế của các khoa sau khi insert
    const insertedKhoaIds = [];
    for (const khoa of khoaData) {
      const result = await connection.query(
        "INSERT INTO khoa (ten_khoa, mo_ta) VALUES (?, ?)",
        [khoa.ten_khoa, khoa.mo_ta]
      );
      // result[0] là OkPacket có insertId
      insertedKhoaIds.push(result[0].insertId);
    }
    console.log(`✅ Đã thêm ${khoaData.length} khoa\n`);

    // ==================== 2. SEED TAIKHOAN ====================
    console.log("👤 Đang seed dữ liệu TAIKHOAN...");
    const taikhoanData = [
      // Admin
      { username: "admin", role: "ADMIN", status: "ACTIVE" },

      // Bác sĩ (BS001 - BS010)
      { username: "bs001", role: "BACSI", status: "ACTIVE" },
      { username: "bs002", role: "BACSI", status: "ACTIVE" },
      { username: "bs003", role: "BACSI", status: "ACTIVE" },
      { username: "bs004", role: "BACSI", status: "ACTIVE" },
      { username: "bs005", role: "BACSI", status: "ACTIVE" },
      { username: "bs006", role: "BACSI", status: "ACTIVE" },
      { username: "bs007", role: "BACSI", status: "ACTIVE" },
      { username: "bs008", role: "BACSI", status: "ACTIVE" },

      // Lễ tân (LT001 - LT005)
      { username: "lt001", role: "LETAN", status: "ACTIVE" },
      { username: "lt002", role: "LETAN", status: "ACTIVE" },
      { username: "lt003", role: "LETAN", status: "ACTIVE" },
    ];

    const insertedAccountIds = [];
    for (const account of taikhoanData) {
      // id_taikhoan là AUTO_INCREMENT, không cần set
      const result = await connection.query(
        "INSERT INTO taikhoan (username, password, role, status) VALUES (?, ?, ?, ?)",
        [account.username, hashedPassword, account.role, account.status]
      );
      insertedAccountIds.push({
        id: result[0].insertId,
        role: account.role,
        username: account.username,
      });
    }
    console.log(`✅ Đã thêm ${taikhoanData.length} tài khoản\n`);

    // ==================== 3. SEED BACSI ====================
    console.log("👨‍⚕️ Đang seed dữ liệu BACSI...");
    // Map bác sĩ với khoa dựa trên index (0 = Khoa Tim mạch, 1 = Khoa Nội tiêu hóa, ...)
    const bacsiInfo = [
      {
        ho_ten: "PGS.TS. Nguyễn Văn An",
        hoc_vi: "Phó Giáo sư, Tiến sĩ",
        chuyen_mon: "Tim mạch can thiệp",
        khoaIndex: 0,
        nam_kinh_nghiem: 25,
        phone: "0912345678",
        email: "nguyenvanan@dhst.vn",
      },
      {
        ho_ten: "TS.BS. Trần Thị Bình",
        hoc_vi: "Tiến sĩ, Bác sĩ",
        chuyen_mon: "Nội tiêu hóa",
        khoaIndex: 1,
        nam_kinh_nghiem: 20,
        phone: "0912345679",
        email: "tranthibinh@dhst.vn",
      },
      {
        ho_ten: "BS.CKII. Lê Văn Cường",
        hoc_vi: "Bác sĩ Chuyên khoa II",
        chuyen_mon: "Thần kinh",
        khoaIndex: 2,
        nam_kinh_nghiem: 18,
        phone: "0912345680",
        email: "levancuong@dhst.vn",
      },
      {
        ho_ten: "TS.BS. Phạm Thị Dung",
        hoc_vi: "Tiến sĩ, Bác sĩ",
        chuyen_mon: "Cơ xương khớp",
        khoaIndex: 3,
        nam_kinh_nghiem: 22,
        phone: "0912345681",
        email: "phamthidung@dhst.vn",
      },
      {
        ho_ten: "BS.CKI. Hoàng Văn Em",
        hoc_vi: "Bác sĩ Chuyên khoa I",
        chuyen_mon: "Sản phụ khoa",
        khoaIndex: 4,
        nam_kinh_nghiem: 15,
        phone: "0912345682",
        email: "hoangvanem@dhst.vn",
      },
      {
        ho_ten: "BS.CKII. Vũ Thị Phương",
        hoc_vi: "Bác sĩ Chuyên khoa II",
        chuyen_mon: "Nhi khoa",
        khoaIndex: 5,
        nam_kinh_nghiem: 19,
        phone: "0912345683",
        email: "vuthiphuong@dhst.vn",
      },
      {
        ho_ten: "TS.BS. Đỗ Văn Giang",
        hoc_vi: "Tiến sĩ, Bác sĩ",
        chuyen_mon: "Tim mạch",
        khoaIndex: 0,
        nam_kinh_nghiem: 16,
        phone: "0912345684",
        email: "dovangiang@dhst.vn",
      },
      {
        ho_ten: "BS.CKI. Bùi Thị Hoa",
        hoc_vi: "Bác sĩ Chuyên khoa I",
        chuyen_mon: "Nội tiêu hóa",
        khoaIndex: 1,
        nam_kinh_nghiem: 12,
        phone: "0912345685",
        email: "buithihoa@dhst.vn",
      },
    ];

    // Lấy các tài khoản bác sĩ đã tạo (bỏ qua admin, chỉ lấy BACSI)
    const bacsiAccounts = insertedAccountIds.filter(
      (acc) => acc.role === "BACSI"
    );
    const bacsiData = [];

    for (let i = 0; i < Math.min(bacsiAccounts.length, bacsiInfo.length); i++) {
      const account = bacsiAccounts[i];
      const info = bacsiInfo[i];
      // Lấy id_khoa thực tế từ mảng insertedKhoaIds
      const id_khoa = insertedKhoaIds[info.khoaIndex] || null;
      // id_bacsi là AUTO_INCREMENT, không cần set
      const insertResult = await connection.query(
        "INSERT INTO bacsi (id_taikhoan, ho_ten, hoc_vi, chuyen_mon, id_khoa, nam_kinh_nghiem, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          account.id,
          info.ho_ten,
          info.hoc_vi,
          info.chuyen_mon,
          id_khoa,
          info.nam_kinh_nghiem,
          info.phone,
          info.email,
        ]
      );
      // Lấy id_bacsi vừa insert để dùng sau
      bacsiData.push({
        id_bacsi: insertResult[0].insertId,
        id_taikhoan: account.id,
      });
    }
    console.log(`✅ Đã thêm ${bacsiData.length} bác sĩ\n`);

    // ==================== 4. SEED LETAN ====================
    console.log("👩‍💼 Đang seed dữ liệu LETAN...");
    const letanInfo = [
      {
        ho_ten: "Nguyễn Thị Lan",
        ca_lam: "Sang",
        phone: "0923456789",
        email: "nguyenthilan@dhst.vn",
      },
      {
        ho_ten: "Trần Văn Minh",
        ca_lam: "Chieu",
        phone: "0923456790",
        email: "tranvanminh@dhst.vn",
      },
      {
        ho_ten: "Lê Thị Hương",
        ca_lam: "Toi",
        phone: "0923456791",
        email: "lethihuong@dhst.vn",
      },
    ];

    // Lấy các tài khoản lễ tân đã tạo
    const letanAccounts = insertedAccountIds.filter(
      (acc) => acc.role === "LETAN"
    );
    const insertedLetanData = [];

    for (let i = 0; i < Math.min(letanAccounts.length, letanInfo.length); i++) {
      const account = letanAccounts[i];
      const info = letanInfo[i];
      // id_letan là AUTO_INCREMENT, không cần set
      const insertResult = await connection.query(
        "INSERT INTO letan (id_taikhoan, ho_ten, ca_lam, phone, email) VALUES (?, ?, ?, ?, ?)",
        [account.id, info.ho_ten, info.ca_lam, info.phone, info.email]
      );
      // Lấy id_letan vừa insert để dùng sau
      insertedLetanData.push({
        id_letan: insertResult[0].insertId,
        id_taikhoan: account.id,
      });
    }
    console.log(`✅ Đã thêm ${insertedLetanData.length} lễ tân\n`);

    // ==================== 5. SEED BENHNHAN ====================
    console.log("🏥 Đang seed dữ liệu BENHNHAN...");
    const benhnhanData = [
      {
        ho_ten: "Nguyễn Văn A",
        gioi_tinh: "Nam",
        ngay_sinh: "1985-05-15",
        dia_chi: "123 Đường ABC, Quận 1, TP.HCM",
        so_bhyt: "BH123456789",
      },
      {
        ho_ten: "Trần Thị B",
        gioi_tinh: "Nu",
        ngay_sinh: "1990-08-20",
        dia_chi: "456 Đường XYZ, Quận 2, TP.HCM",
        so_bhyt: "BH123456790",
      },
      {
        ho_ten: "Lê Văn C",
        gioi_tinh: "Nam",
        ngay_sinh: "1988-03-10",
        dia_chi: "789 Đường DEF, Quận 3, TP.HCM",
        so_bhyt: "BH123456791",
      },
      {
        ho_ten: "Phạm Thị D",
        gioi_tinh: "Nu",
        ngay_sinh: "1992-11-25",
        dia_chi: "321 Đường GHI, Quận 4, TP.HCM",
        so_bhyt: "BH123456792",
      },
      {
        ho_ten: "Hoàng Văn E",
        gioi_tinh: "Nam",
        ngay_sinh: "1987-07-18",
        dia_chi: "654 Đường JKL, Quận 5, TP.HCM",
        so_bhyt: "BH123456793",
      },
      {
        ho_ten: "Vũ Thị F",
        gioi_tinh: "Nu",
        ngay_sinh: "1995-02-14",
        dia_chi: "987 Đường MNO, Quận 6, TP.HCM",
        so_bhyt: "BH123456794",
      },
      {
        ho_ten: "Đỗ Văn G",
        gioi_tinh: "Nam",
        ngay_sinh: "1989-09-30",
        dia_chi: "147 Đường PQR, Quận 7, TP.HCM",
        so_bhyt: "BH123456795",
      },
      {
        ho_ten: "Bùi Thị H",
        gioi_tinh: "Nu",
        ngay_sinh: "1993-12-05",
        dia_chi: "258 Đường STU, Quận 8, TP.HCM",
        so_bhyt: "BH123456796",
      },
      {
        ho_ten: "Ngô Văn I",
        gioi_tinh: "Nam",
        ngay_sinh: "1986-04-22",
        dia_chi: "369 Đường VWX, Quận 9, TP.HCM",
        so_bhyt: "BH123456797",
      },
      {
        ho_ten: "Đinh Thị K",
        gioi_tinh: "Nu",
        ngay_sinh: "1991-06-28",
        dia_chi: "741 Đường YZ, Quận 10, TP.HCM",
        so_bhyt: "BH123456798",
      },
      {
        ho_ten: "Lý Văn L",
        gioi_tinh: "Nam",
        ngay_sinh: "1984-01-12",
        dia_chi: "852 Đường AA, Quận 11, TP.HCM",
        so_bhyt: "BH123456799",
      },
      {
        ho_ten: "Võ Thị M",
        gioi_tinh: "Nu",
        ngay_sinh: "1994-10-08",
        dia_chi: "963 Đường BB, Quận 12, TP.HCM",
        so_bhyt: "BH123456800",
      },
    ];

    for (const benhnhan of benhnhanData) {
      await connection.query(
        "INSERT INTO benhnhan (ho_ten, gioi_tinh, ngay_sinh, dia_chi, so_bhyt) VALUES (?, ?, ?, ?, ?)",
        [
          benhnhan.ho_ten,
          benhnhan.gioi_tinh,
          benhnhan.ngay_sinh,
          benhnhan.dia_chi,
          benhnhan.so_bhyt,
        ]
      );
    }
    console.log(`✅ Đã thêm ${benhnhanData.length} bệnh nhân\n`);

    // ==================== 6. SEED DATLICH ====================
    console.log("📅 Đang seed dữ liệu DATLICH...");
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const datlichData = [];
    const trangThaiOptions = ["Cho xac nhan", "Da xac nhan", "Huy"];
    const gioOptions = [
      "08:00:00",
      "09:00:00",
      "10:00:00",
      "14:00:00",
      "15:00:00",
      "16:00:00",
    ];

    // Tạo 20 lịch hẹn
    for (let i = 1; i <= 20; i++) {
      const randomDateObj = randomDate(today, nextWeek);
      const ngay_dat = formatDate(randomDateObj);
      const gio_dat = gioOptions[Math.floor(Math.random() * gioOptions.length)];
      const id_benhnhan = Math.floor(Math.random() * benhnhanData.length) + 1;
      // Lấy id_khoa ngẫu nhiên từ mảng insertedKhoaIds
      const randomKhoaIndex = Math.floor(
        Math.random() * insertedKhoaIds.length
      );
      const id_khoa = insertedKhoaIds[randomKhoaIndex];
      // Lấy id_bacsi từ mảng bacsiData đã tạo
      const randomBacsi =
        bacsiData[Math.floor(Math.random() * bacsiData.length)];
      const id_bacsi = randomBacsi ? randomBacsi.id_bacsi : null;
      const trang_thai =
        trangThaiOptions[Math.floor(Math.random() * trangThaiOptions.length)];

      datlichData.push({
        id_benhnhan,
        id_khoa,
        id_bacsi,
        ngay_dat,
        gio_dat,
        trang_thai,
      });
    }

    for (const datlich of datlichData) {
      await connection.query(
        "INSERT INTO datlich (id_benhnhan, id_khoa, id_bacsi, ngay_dat, gio_dat, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
        [
          datlich.id_benhnhan,
          datlich.id_khoa,
          datlich.id_bacsi,
          datlich.ngay_dat,
          datlich.gio_dat,
          datlich.trang_thai,
        ]
      );
    }
    console.log(`✅ Đã thêm ${datlichData.length} lịch hẹn\n`);

    // ==================== 7. SEED LICHLAMVIEC ====================
    console.log("📆 Đang seed dữ liệu LICHLAMVIEC...");
    const caOptions = ["Sang", "Chieu", "Toi"];
    const lichlamviecData = [];

    // Tạo lịch làm việc cho 2 tuần tới
    for (let day = 0; day < 14; day++) {
      const workDate = new Date(today);
      workDate.setDate(today.getDate() + day);
      const ngay = formatDate(workDate);

      // Mỗi ngày có 3-5 bác sĩ làm việc
      const numDoctors = Math.floor(Math.random() * 3) + 3;
      const selectedDoctors = [];

      for (let i = 0; i < numDoctors; i++) {
        let selectedBacsi;
        do {
          selectedBacsi =
            bacsiData[Math.floor(Math.random() * bacsiData.length)];
        } while (
          !selectedBacsi ||
          selectedDoctors.includes(selectedBacsi.id_bacsi)
        );

        selectedDoctors.push(selectedBacsi.id_bacsi);
        const ca = caOptions[Math.floor(Math.random() * caOptions.length)];

        lichlamviecData.push({
          id_bacsi: selectedBacsi.id_bacsi,
          ngay,
          ca,
          ghi_chu: null,
        });
      }
    }

    for (const lich of lichlamviecData) {
      await connection.query(
        "INSERT INTO lichlamviec (id_bacsi, ngay, ca, ghi_chu) VALUES (?, ?, ?, ?)",
        [lich.id_bacsi, lich.ngay, lich.ca, lich.ghi_chu]
      );
    }
    console.log(`✅ Đã thêm ${lichlamviecData.length} lịch làm việc\n`);

    // ==================== 8. SEED LICHLAMVIEC_FIX ====================
    console.log("📋 Đang seed dữ liệu LICHLAMVIEC_FIX...");
    const thuOptions = ["2", "3", "4", "5", "6", "7", "CN"];
    const lichlamviecFixData = [];

    // Mỗi bác sĩ có lịch cố định 2-4 ca/tuần
    for (const bacsi of bacsiData) {
      const numShifts = Math.floor(Math.random() * 3) + 2;
      const selectedDays = [];

      for (let j = 0; j < numShifts; j++) {
        let thu;
        do {
          thu = thuOptions[Math.floor(Math.random() * thuOptions.length)];
        } while (selectedDays.includes(thu));

        selectedDays.push(thu);
        const ca = caOptions[Math.floor(Math.random() * caOptions.length)];

        lichlamviecFixData.push({
          id_bacsi: bacsi.id_bacsi,
          thu_trong_tuan: thu,
          ca,
          ghi_chu: null,
        });
      }
    }

    for (const lich of lichlamviecFixData) {
      await connection.query(
        "INSERT INTO lichlamviec_fix (id_bacsi, thu_trong_tuan, ca, ghi_chu) VALUES (?, ?, ?, ?)",
        [lich.id_bacsi, lich.thu_trong_tuan, lich.ca, lich.ghi_chu]
      );
    }
    console.log(
      `✅ Đã thêm ${lichlamviecFixData.length} lịch làm việc cố định\n`
    );

    // ==================== 9. SEED LICHKHAM ====================
    console.log("🏥 Đang seed dữ liệu LICHKHAM...");
    // Lấy tất cả lịch hẹn đã xác nhận để tạo lịch khám (tăng từ 10 lên tất cả)
    const [confirmedAppointments] = await connection.query(
      "SELECT id_datlich, id_khoa, ngay_dat FROM datlich WHERE trang_thai = 'Da xac nhan'"
    );

    const lichkhamData = [];
    for (const appointment of confirmedAppointments) {
      const randomLetan =
        insertedLetanData[Math.floor(Math.random() * insertedLetanData.length)];
      if (randomLetan) {
        lichkhamData.push({
          id_datlich: appointment.id_datlich,
          id_letan: randomLetan.id_letan,
          ngay_kham: appointment.ngay_dat,
          ket_qua: null,
        });
      }
    }

    // Nếu không có lịch hẹn đã xác nhận, tạo lịch khám từ một số lịch hẹn "Cho xac nhan"
    if (lichkhamData.length === 0) {
      const [pendingAppointments] = await connection.query(
        "SELECT id_datlich, id_khoa, ngay_dat FROM datlich WHERE trang_thai = 'Cho xac nhan' LIMIT 5"
      );

      for (const appointment of pendingAppointments) {
        const randomLetan =
          insertedLetanData[
            Math.floor(Math.random() * insertedLetanData.length)
          ];
        if (randomLetan) {
          lichkhamData.push({
            id_datlich: appointment.id_datlich,
            id_letan: randomLetan.id_letan,
            ngay_kham: appointment.ngay_dat,
            ket_qua: null,
          });
        }
      }
    }

    for (const lichkham of lichkhamData) {
      await connection.query(
        "INSERT INTO lichkham (id_datlich, id_letan, ngay_kham, ket_qua) VALUES (?, ?, ?, ?)",
        [
          lichkham.id_datlich,
          lichkham.id_letan,
          lichkham.ngay_kham,
          lichkham.ket_qua,
        ]
      );
    }
    console.log(`✅ Đã thêm ${lichkhamData.length} lịch khám\n`);

    // ==================== 10. SEED HOSOKHAMBENH ====================
    console.log("📄 Đang seed dữ liệu HOSOKHAMBENH...");
    const [lichkhamRows] = await connection.query(
      "SELECT id_lichkham FROM lichkham LIMIT 5"
    );

    const hosokhambenhData = [
      {
        chan_doan: "Viêm dạ dày cấp",
        trieu_chung: "Đau bụng vùng thượng vị, buồn nôn, ợ hơi",
        thuoc_ke_don:
          "Omeprazole 20mg x 2 viên/ngày, uống trước ăn 30 phút. Thời gian: 2 tuần.",
        ghi_chu: "Hạn chế đồ cay nóng, rượu bia. Tái khám sau 2 tuần.",
      },
      {
        chan_doan: "Tăng huyết áp",
        trieu_chung: "Đau đầu, chóng mặt, mệt mỏi",
        thuoc_ke_don:
          "Amlodipine 5mg x 1 viên/ngày, uống sau ăn sáng. Thời gian: 1 tháng.",
        ghi_chu: "Đo huyết áp hàng ngày, tái khám sau 1 tháng.",
      },
      {
        chan_doan: "Đau đầu do căng thẳng",
        trieu_chung: "Đau đầu vùng thái dương, căng thẳng",
        thuoc_ke_don: "Paracetamol 500mg khi đau. Nghỉ ngơi, thư giãn.",
        ghi_chu: "Tránh stress, ngủ đủ giấc.",
      },
      {
        chan_doan: "Viêm khớp gối",
        trieu_chung: "Đau khớp gối, sưng, khó vận động",
        thuoc_ke_don:
          "Diclofenac 50mg x 2 viên/ngày sau ăn. Thời gian: 1 tuần.",
        ghi_chu: "Hạn chế vận động mạnh, chườm lạnh khi sưng.",
      },
      {
        chan_doan: "Cảm cúm",
        trieu_chung: "Sốt, ho, sổ mũi, đau họng",
        thuoc_ke_don:
          "Paracetamol 500mg x 3 lần/ngày. Vitamin C. Nghỉ ngơi, uống nhiều nước.",
        ghi_chu: "Tái khám nếu sốt cao hoặc triệu chứng nặng hơn.",
      },
    ];

    for (
      let i = 0;
      i < Math.min(lichkhamRows.length, hosokhambenhData.length);
      i++
    ) {
      await connection.query(
        "INSERT INTO hosokhambenh (id_lichkham, chan_doan, trieu_chung, thuoc_ke_don, ghi_chu) VALUES (?, ?, ?, ?, ?)",
        [
          lichkhamRows[i].id_lichkham,
          hosokhambenhData[i].chan_doan,
          hosokhambenhData[i].trieu_chung,
          hosokhambenhData[i].thuoc_ke_don,
          hosokhambenhData[i].ghi_chu,
        ]
      );
    }
    console.log(
      `✅ Đã thêm ${Math.min(
        lichkhamRows.length,
        hosokhambenhData.length
      )} hồ sơ khám bệnh\n`
    );

    // ==================== 11. SEED NEWS ====================
    console.log("📰 Đang seed dữ liệu NEWS...");
    const newsData = [
      {
        title: "Bệnh viện DHST khai trương phòng khám mới",
        summary:
          "Bệnh viện DHST vừa khai trương phòng khám mới với trang thiết bị hiện đại, phục vụ tốt hơn nhu cầu khám chữa bệnh của người dân.",
        content: `<p>Bệnh viện Đa khoa DHST Healthcare vui mừng thông báo về việc khai trương phòng khám mới với diện tích 500m², được trang bị đầy đủ các thiết bị y tế hiện đại nhất.</p>
        <p>Phòng khám mới bao gồm:</p>
        <ul>
          <li>Phòng khám đa khoa với 10 phòng khám riêng biệt</li>
          <li>Phòng xét nghiệm với máy móc tự động hóa</li>
          <li>Phòng chờ rộng rãi, thoáng mát</li>
          <li>Khu vực tiếp đón và tư vấn chuyên nghiệp</li>
        </ul>
        <p>Với việc mở rộng này, bệnh viện DHST cam kết mang đến dịch vụ khám chữa bệnh chất lượng cao, giảm thời gian chờ đợi và nâng cao trải nghiệm của bệnh nhân.</p>`,
        category: "Tin tức",
        author: "Admin",
        status: "published",
      },
      {
        title: "10 dấu hiệu cảnh báo bệnh tim mạch bạn cần biết",
        summary:
          "Nhận biết sớm các dấu hiệu của bệnh tim mạch giúp phòng ngừa và điều trị kịp thời, tránh những biến chứng nguy hiểm.",
        content: `<p>Bệnh tim mạch là một trong những nguyên nhân gây tử vong hàng đầu. Việc nhận biết sớm các dấu hiệu cảnh báo là vô cùng quan trọng.</p>
        <h3>10 dấu hiệu cảnh báo:</h3>
        <ol>
          <li>Đau ngực hoặc khó chịu ở ngực</li>
          <li>Khó thở, đặc biệt khi gắng sức</li>
          <li>Mệt mỏi bất thường</li>
          <li>Chóng mặt hoặc ngất xỉu</li>
          <li>Nhịp tim không đều</li>
          <li>Phù chân, mắt cá chân</li>
          <li>Ho kéo dài, đặc biệt vào ban đêm</li>
          <li>Đổ mồ hôi lạnh</li>
          <li>Buồn nôn hoặc chán ăn</li>
          <li>Đau lan ra cánh tay, cổ, hàm</li>
        </ol>
        <p>Nếu bạn gặp bất kỳ dấu hiệu nào trên, hãy đến ngay cơ sở y tế để được thăm khám và tư vấn kịp thời.</p>`,
        category: "Sức khỏe",
        author: "BS. Nguyễn Văn An",
        status: "published",
      },
      {
        title: "Chế độ dinh dưỡng cho người bệnh tiểu đường",
        summary:
          "Chế độ ăn uống hợp lý đóng vai trò quan trọng trong việc kiểm soát đường huyết và phòng ngừa biến chứng của bệnh tiểu đường.",
        content: `<p>Bệnh tiểu đường là một bệnh mạn tính cần được quản lý suốt đời. Chế độ dinh dưỡng là một phần không thể thiếu trong quá trình điều trị.</p>
        <h3>Nguyên tắc dinh dưỡng:</h3>
        <ul>
          <li>Ăn đủ bữa, không bỏ bữa</li>
          <li>Hạn chế đường và tinh bột</li>
          <li>Tăng cường rau xanh, chất xơ</li>
          <li>Chọn thực phẩm có chỉ số đường huyết thấp</li>
          <li>Uống đủ nước, hạn chế đồ uống có đường</li>
        </ul>
        <h3>Thực phẩm nên ăn:</h3>
        <ul>
          <li>Rau xanh: bông cải, cà rốt, cà chua</li>
          <li>Trái cây ít đường: táo, cam, bưởi</li>
          <li>Ngũ cốc nguyên hạt: gạo lứt, yến mạch</li>
          <li>Protein nạc: thịt gà, cá, đậu phụ</li>
        </ul>
        <p>Hãy tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng để có chế độ ăn phù hợp với tình trạng sức khỏe của bạn.</p>`,
        category: "Dinh dưỡng",
        author: "BS. Trần Thị Bình",
        status: "published",
      },
      {
        title: "Tầm quan trọng của khám sức khỏe định kỳ",
        summary:
          "Khám sức khỏe định kỳ giúp phát hiện sớm các bệnh lý, từ đó có phương án điều trị kịp thời và hiệu quả.",
        content: `<p>Nhiều người chỉ đi khám khi có triệu chứng bệnh, nhưng việc khám sức khỏe định kỳ là vô cùng quan trọng để bảo vệ sức khỏe lâu dài.</p>
        <h3>Lợi ích của khám sức khỏe định kỳ:</h3>
        <ul>
          <li>Phát hiện sớm các bệnh lý tiềm ẩn</li>
          <li>Đánh giá tình trạng sức khỏe tổng thể</li>
          <li>Điều chỉnh lối sống và chế độ ăn uống</li>
          <li>Tiết kiệm chi phí điều trị về lâu dài</li>
          <li>Giảm nguy cơ biến chứng nghiêm trọng</li>
        </ul>
        <h3>Khuyến nghị:</h3>
        <ul>
          <li>Người trẻ (dưới 30): Khám 1-2 lần/năm</li>
          <li>Người trung niên (30-50): Khám 2 lần/năm</li>
          <li>Người cao tuổi (trên 50): Khám 3-4 lần/năm</li>
        </ul>
        <p>Bệnh viện DHST cung cấp các gói khám sức khỏe tổng quát với giá ưu đãi. Liên hệ hotline 096.989.9999 để đặt lịch.</p>`,
        category: "Sức khỏe",
        author: "Admin",
        status: "published",
      },
      {
        title: "Cách phòng ngừa bệnh cảm cúm mùa",
        summary:
          "Với thời tiết thay đổi, bệnh cảm cúm dễ lây lan. Hãy trang bị kiến thức để phòng ngừa hiệu quả.",
        content: `<p>Cảm cúm là bệnh lý phổ biến, đặc biệt vào mùa mưa và thời điểm giao mùa. Phòng ngừa là cách tốt nhất để bảo vệ sức khỏe.</p>
        <h3>Biện pháp phòng ngừa:</h3>
        <ol>
          <li><strong>Tiêm vaccine cúm:</strong> Tiêm vaccine hàng năm là cách hiệu quả nhất</li>
          <li><strong>Rửa tay thường xuyên:</strong> Bằng xà phòng hoặc dung dịch sát khuẩn</li>
          <li><strong>Tránh tiếp xúc gần:</strong> Với người đang bị cảm cúm</li>
          <li><strong>Che miệng khi ho/hắt hơi:</strong> Dùng khăn giấy hoặc khuỷu tay</li>
          <li><strong>Tăng cường sức đề kháng:</strong> Ăn uống đủ chất, ngủ đủ giấc</li>
          <li><strong>Giữ vệ sinh môi trường:</strong> Thông thoáng, sạch sẽ</li>
        </ol>
        <h3>Triệu chứng cần lưu ý:</h3>
        <ul>
          <li>Sốt cao trên 38.5°C</li>
          <li>Ho kéo dài</li>
          <li>Đau nhức cơ thể</li>
          <li>Mệt mỏi kéo dài</li>
        </ul>
        <p>Nếu có các triệu chứng trên, hãy đến cơ sở y tế để được thăm khám và điều trị kịp thời.</p>`,
        category: "Phòng bệnh",
        author: "BS. Vũ Thị Phương",
        status: "published",
      },
      {
        title: "Bệnh viện DHST triển khai hệ thống đặt lịch online",
        summary:
          "Từ nay, bệnh nhân có thể đặt lịch khám trực tuyến qua website, tiết kiệm thời gian và thuận tiện hơn.",
        content: `<p>Bệnh viện DHST vui mừng thông báo về việc triển khai hệ thống đặt lịch khám online mới, giúp bệnh nhân dễ dàng đặt lịch mà không cần đến trực tiếp bệnh viện.</p>
        <h3>Tính năng của hệ thống:</h3>
        <ul>
          <li>Đặt lịch khám 24/7, mọi lúc mọi nơi</li>
          <li>Xem lịch làm việc của bác sĩ theo thời gian thực</li>
          <li>Nhận email xác nhận tự động</li>
          <li>Nhắc nhở lịch hẹn qua SMS</li>
          <li>Tra cứu lịch hẹn đã đặt</li>
          <li>Hủy hoặc đổi lịch dễ dàng</li>
        </ul>
        <h3>Cách sử dụng:</h3>
        <ol>
          <li>Truy cập website bệnh viện DHST</li>
          <li>Chọn mục "Đặt lịch khám"</li>
          <li>Chọn khoa, bác sĩ và thời gian phù hợp</li>
          <li>Điền thông tin cá nhân</li>
          <li>Xác nhận và nhận email thông báo</li>
        </ol>
        <p>Hệ thống đặt lịch online giúp giảm thời gian chờ đợi, tăng trải nghiệm của bệnh nhân và nâng cao hiệu quả quản lý của bệnh viện.</p>`,
        category: "Tin tức",
        author: "Admin",
        status: "published",
      },
    ];

    for (const news of newsData) {
      const slug = createSlug(news.title);
      await connection.query(
        "INSERT INTO news (title, slug, summary, content, category, author, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          news.title,
          slug,
          news.summary,
          news.content,
          news.category,
          news.author,
          news.status,
        ]
      );
    }
    console.log(`✅ Đã thêm ${newsData.length} tin tức\n`);

    console.log("🎉 Hoàn thành seed database!\n");
    console.log("📝 Thông tin đăng nhập:");
    console.log("   - Admin: username='admin', password='123456'");
    console.log("   - Bác sĩ: username='bs001' đến 'bs008', password='123456'");
    console.log(
      "   - Lễ tân: username='lt001' đến 'lt003', password='123456'\n"
    );
  } catch (error) {
    console.error("❌ Lỗi khi seed database:", error);
    throw error;
  } finally {
    connection.release();
    // Không gọi db.end() vì db là pool, chỉ release connection
    console.log("✅ Đã đóng kết nối database");
  }
}

// Chạy seed
seedDatabase()
  .then(() => {
    console.log("\n✨ Seed database thành công!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed database thất bại:", error);
    process.exit(1);
  });
