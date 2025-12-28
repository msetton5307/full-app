const mongoose = require('mongoose');
const FAQModel = require('faq/models/faq.model');

const FAQRepo = {

  getById: async (id) => {
    try {
      let datas = await FAQModel.findById(id).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getByField: async (params) => {
    try {
      let datas = await FAQModel.findOne(params).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByField: async (params) => {
    try {
      let datas = await FAQModel.find(params).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldWithSortAndLimit: async (params, sort, limit) => {
    try {
      let datas = await FAQModel.find(params).sort(sort).limit(limit).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocument: async (field, params) => {
    try {
      let datas = await FAQModel.distinct(field, params);
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      return e;
    }
  },

  getCountByParam: async (params) => {
    try {
      let datas = await FAQModel.countDocuments(params);
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocumentCount: async (field, params) => {
    try {
      let datasCount = await FAQModel.distinct(field, params);
      if (!datasCount) {
        return 0;
      }
      return datasCount.length;
    } catch (e) {
      return e;
    }
  },

  delete: async (id) => {
    try {
      let datas = await FAQModel.findById(id);
      if (datas) {
        let dataDelete = await FAQModel.deleteOne({
          _id: id
        }).exec();
        return dataDelete;
      } else {
        return null;
      }
    } catch (e) {
      throw (e);
    }
  },

  bulkDelete: async (params) => {
    try {
      await FAQModel.deleteMany(params);
      return true;
    } catch (e) {
      return e;
    }
  },

  updateById: async (data, id) => {
    try {
      let datas = await FAQModel.findByIdAndUpdate(id, data, {
        new: true,
        upsert: true
      }).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  updateByField: async (data, param) => {
    try {
      let datas = await FAQModel.updateOne(param, data, {
        new: true
      });
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      return e;
    }
  },

  updateAllByParams: async (data, params) => {
    try {
      let datas = await FAQModel.updateMany(params, data, { new: true });
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      return e;
    }
  },

  save: async (data) => {
    try {
      let datas = await FAQModel.create(data);
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      throw e;
    }
  },

  getListByUserCustom: async (params) => {
    try {
      var conditions = {};
      var and_clauses = [];
      and_clauses.push({ "isDeleted": false });
      and_clauses.push({ "userId": params.userId });
      conditions['$and'] = and_clauses;

      let record = await FAQModel.aggregate([
        { $match: conditions },
        { $project: { isDeleted: 0 } },
        { $sort: { _id: -1 } }
      ]);
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  getByIdCustom: async (id) => {
    try {
      let record = await FAQModel.findById(id, { isDeleted: 0, updatedAt: 0 });
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      return e;
    }
  },


  getStats: async () => {
    try {
      let count = await FAQModel.find({ "isDeleted": false }).countDocuments();
      let activecount = await FAQModel.find({ "isDeleted": false, "status": "Active" }).countDocuments();
      let inactivecount = await FAQModel.find({ "isDeleted": false, "status": "Inactive" }).countDocuments();

      return {
        count,
        activecount,
        inactivecount
      };
    } catch (e) {
      return e;
    }
  },

  getFaqCountByParam: async (params) => {
    try {
      let Faq = await FAQModel.countDocuments(params);
      return Faq;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldCustom: async (params) => {
    try {
      let datas = await FAQModel.find(params, { isDeleted: 0, updatedAt: 0 }).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAll: async (req) => {
    try {
      let conditions = {};
      let and_clauses = [];

      and_clauses.push({ "isDeleted": false });

      if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
        and_clauses.push({
          $or: [
            { 'question': { $regex: req.body.search.value.trim(), $options: 'i' } },
            { 'answer': { $regex: req.body.search.value.trim(), $options: 'i' } }
          ]
        });
      }

      if (req.body.columns && req.body.columns.length) {
        let statusFilter = _.find(req.body.columns, { data: 'status' });
        if (statusFilter && statusFilter.search && statusFilter.search.value) {
          and_clauses.push({
            "status": statusFilter.search.value
          });
        }
      }

      conditions['$and'] = and_clauses;

      let sortOperator = { "$sort": {} };
      if (_.has(req.body, 'order') && req.body.order.length) {
        for (let order of req.body.order) {
          let sortField = req.body.columns[+order.column].data;
          var sortOrder = -1;
          if (order.dir == 'desc') {
            sortOrder = -1;
          } else if (order.dir == 'asc') {
            sortOrder = 1;
          }
          sortOperator["$sort"][sortField] = sortOrder;
        }
      } else {
        sortOperator["$sort"]['_id'] = -1;
      }
      let aggregate = FAQModel.aggregate([
        { $match: conditions },
        sortOperator
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await FAQModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllCustom: async (req) => {
    try {
      let aggregate = FAQModel.aggregate([
        {
          $match: {
            "isDeleted": false,
            "status": 'Active'
          }
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            status: 0,
            isDeleted: 0,
          }
        }
      ])
      var options = {
        page: req.body.page,
        limit: req.body.perpage
      };
      let allRecord = await FAQModel.aggregatePaginate(aggregate, options);
      return allRecord;
    } catch (e) {
      throw e
    }
  },
};

module.exports = FAQRepo;
