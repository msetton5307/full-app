const PriceTracker = require('../models/priceTracker.model');

const PriceTrackerRepository = {
  async getAllByField(params) {
    try {
      const record = await PriceTracker.find(params).sort({createdAt: -1}).exec();
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  async getById(id) {
    try {
      const record = await PriceTracker.findById(id).exec();
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  async save(data) {
    try {
      const save = await PriceTracker.create(data);
      if (!save) {
        return null;
      }
      return save;
    } catch (e) {
      throw e;
    }
  },

  async updateById(data, id) {
    try {
      const update = await PriceTracker.findByIdAndUpdate(id, data, {new: true}).exec();
      if (!update) {
        return null;
      }
      return update;
    } catch (e) {
      throw e;
    }
  },
};

module.exports = PriceTrackerRepository;
