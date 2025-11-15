// services/hosoKhamService.js
import HoSoKhamModel from "../models/hosoKhamModel.js";

const HoSoKhamService = {
  async getAllHoSoKham() {
    return await HoSoKhamModel.getAll();
  },

  async getHoSoKhamById(id) {
    return await HoSoKhamModel.getById(id);
  },

  async createHoSoKham(data) {
    return await HoSoKhamModel.create(data);
  },

  async updateHoSoKham(id, data) {
    return await HoSoKhamModel.update(id, data);
  },

  async deleteHoSoKham(id) {
    return await HoSoKhamModel.remove(id);
  },
};

export default HoSoKhamService;
