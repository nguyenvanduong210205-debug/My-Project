// services/datLichService.js
import DatLichModel from "../models/datLichModel.js";

const DatLichService = {
  async getAllDatLich() {
    return await DatLichModel.getAll();
  },

  async getDatLichById(id) {
    return await DatLichModel.getById(id);
  },

  async createDatLich(data) {
    return await DatLichModel.create(data);
  },

  async updateDatLich(id, data) {
    return await DatLichModel.update(id, data);
  },

  async deleteDatLich(id) {
    return await DatLichModel.remove(id);
  },
};

export default DatLichService;
