// services/benhNhanService.js
import BenhNhanModel from "../models/benhNhanModel.js";

const BenhNhanService = {
  async getAllBenhNhan() {
    return await BenhNhanModel.getAll();
  },

  async getBenhNhanById(id) {
    return await BenhNhanModel.getById(id);
  },

  async createBenhNhan(data) {
    return await BenhNhanModel.create(data);
  },

  async updateBenhNhan(id, data) {
    return await BenhNhanModel.update(id, data);
  },

  async deleteBenhNhan(id) {
    return await BenhNhanModel.remove(id);
  },
};

export default BenhNhanService;
