// src/services/hoso.service.js
const db = require("../../config/db");
const BenhNhanModel = require("../models/benhnhan.model");
const DatLichLeTanModel = require("../models/datlichletan.model");
const HoSoModel = require("../models/hoso.model");

const HoSoService = {
  async createHoSo(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        id_datlich,
        id_bacsi,
        ho_ten,
        phone,
        email,
        gioi_tinh,
        ngay_sinh,
        dia_chi,
        trieu_chung,
        chuan_doan,
        ghi_chu
      } = data;

      // 1️⃣ Kiểm tra bệnh nhân theo số điện thoại
      let benhNhan = await BenhNhanModel.findByPhone(phone);
      let id_benhnhan;
      if (!benhNhan) {
        id_benhnhan = `BN${Date.now().toString().slice(-6)}`;
        await BenhNhanModel.create({
          id_benhnhan,
          ho_ten,
          phone,
          email,
          gioi_tinh,
          ngay_sinh,
          dia_chi
        });
      } else {
        id_benhnhan = benhNhan.id_benhnhan;
      }

      // 2️⃣ Tạo hồ sơ khám
      const hosoResult = await HoSoModel.create({
        id_datlich,
        id_benhnhan,
        id_bacsi,
        trieu_chung,
        chuan_doan,
        ghi_chu
      });

      // 3️⃣ Cập nhật trạng thái đặt lịch
      await DatLichLeTanModel.updateTrangThai(id_datlich, "DA_TAO_HOSO");

      await connection.commit();
      return { success: true, id_hoso: hosoResult.insertId, id_benhnhan };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
};

module.exports = HoSoService;
