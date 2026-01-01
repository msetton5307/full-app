const mongoose = require('mongoose');
const CollectionModel = require('../models/collection.model');

const CollectionRepo = {
  getById: async (id) => {
    try {
      return await CollectionModel.findById(id).exec();
    } catch (e) {
      throw e;
    }
  },

  getByField: async (params) => {
    try {
      return await CollectionModel.findOne(params).lean().exec();
    } catch (e) {
      throw e;
    }
  },

  getAllByField: async (params) => {
    try {
      return await CollectionModel.find(params).exec();
    } catch (e) {
      throw e;
    }
  },

  save: async (data) => {
    try {
      return await CollectionModel.create(data);
    } catch (e) {
      throw e;
    }
  },

  updateById: async (data, id) => {
    try {
      return await CollectionModel.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (e) {
      throw e;
    }
  },

  getStats: async () => {
    try {
      const count = await CollectionModel.countDocuments({ isDeleted: false });
      const activeCount = await CollectionModel.countDocuments({ isDeleted: false, status: 'Active' });
      const inactiveCount = await CollectionModel.countDocuments({ isDeleted: false, status: 'Inactive' });

      return { count, activeCount, inactiveCount };
    } catch (e) {
      return e;
    }
  },

  getAll: async (req) => {
    try {
      const andClauses = [{ isDeleted: false }];

      if (_.isObject(req.body.search) && _.has(req.body.search, 'value') && req.body.search.value) {
        andClauses.push({
          $or: [
            { title: { $regex: req.body.search.value.trim(), $options: 'i' } },
            { description: { $regex: req.body.search.value.trim(), $options: 'i' } },
          ],
        });
      }

      if (req.body.columns && req.body.columns.length) {
        const statusFilter = _.find(req.body.columns, { data: 'status' });
        if (statusFilter && statusFilter.search && statusFilter.search.value) {
          andClauses.push({ status: statusFilter.search.value });
        }
      }

      const conditions = { $and: andClauses };

      const sortOperator = { $sort: {} };
      if (_.has(req.body, 'order') && req.body.order.length) {
        for (const order of req.body.order) {
          const sortField = req.body.columns[+order.column].data;
          const sortOrder = order.dir === 'asc' ? 1 : -1;
          sortOperator.$sort[sortField] = sortOrder;
        }
      } else {
        sortOperator.$sort._id = -1;
      }

      const aggregate = CollectionModel.aggregate([
        { $match: conditions },
        {
          $project: {
            title: 1,
            description: 1,
            coverImage: 1,
            status: 1,
            dealsCount: { $size: { $ifNull: ['$deals', []] } },
            createdAt: 1,
          },
        },
        sortOperator,
      ]);

      const options = { page: req.body.page, limit: req.body.length };
      return await CollectionModel.aggregatePaginate(aggregate, options);
    } catch (e) {
      throw e;
    }
  },
};

module.exports = CollectionRepo;
