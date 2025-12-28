const mongoose = require('mongoose');
const keywordsModel = require('../models/keywords.model');

const keywordsRepo = {

  getById: async (id) => {
    try {
      let datas = await keywordsModel.findById(id).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getByField: async (params) => {
    try {
      let datas = await keywordsModel.findOne(params).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByField: async (params) => {
    try {
      let datas = await keywordsModel.find(params).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldWithSortAndLimit: async (params, sort, limit) => {
    try {
      let datas = await keywordsModel.find(params).sort(sort).limit(limit).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocument: async (field, params) => {
    try {
      let datas = await keywordsModel.distinct(field, params);
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
      let datas = await keywordsModel.countDocuments(params);
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocumentCount: async (field, params) => {
    try {
      let datasCount = await keywordsModel.distinct(field, params);
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
      let datas = await keywordsModel.findById(id);
      if (datas) {
        let dataDelete = await keywordsModel.deleteOne({
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
      await keywordsModel.deleteMany(params);
      return true;
    } catch (e) {
      return e;
    }
  },

  updateById: async (data, id) => {
    try {
      let datas = await keywordsModel.findByIdAndUpdate(id, data, {
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
      let datas = await keywordsModel.updateOne(param, data, {
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
      let datas = await keywordsModel.updateMany(params, data, { new: true });
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
      let datas = await keywordsModel.create(data);
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

      let record = await keywordsModel.aggregate([
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
      let record = await keywordsModel.findById(id, { isDeleted: 0, updatedAt: 0 });
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
      let count = await keywordsModel.find({ "isDeleted": false }).countDocuments();
      let activecount = await keywordsModel.find({ "isDeleted": false, "status": "Active" }).countDocuments();
      let inactivecount = await keywordsModel.find({ "isDeleted": false, "status": "Inactive" }).countDocuments();

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
      let Faq = await keywordsModel.countDocuments(params);
      return Faq;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldCustom: async (params) => {
    try {
      let datas = await keywordsModel.find(params, { isDeleted: 0, updatedAt: 0 }).lean().exec();
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
            { 'keyword': { $regex: req.body.search.value.trim(), $options: 'i' } },
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
      let aggregate = keywordsModel.aggregate([
        { $match: conditions },
        {
          $lookup:
          {
            from: "categories",
            let: { id: "$category_id" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [
                        { $eq: ["$_id", "$$id"] },
                        { $eq: ["$isDeleted", false] }
                      ]
                  }
                }
              }
            ],
            as: "categories"
          }
        },
        {
          $unwind:{
            path:"$categories",
            preserveNullAndEmptyArrays:true
          }
        },
        {
          $project:
          {
            keyword:1,
            _id:1,
            category:"$categories.title",
            status:1
          }
        },
        sortOperator
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await keywordsModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllCustom: async (req) => {
    try {
      let aggregate = keywordsModel.aggregate([
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
      let allRecord = await keywordsModel.aggregatePaginate(aggregate, options);
      return allRecord;
    } catch (e) {
      throw e
    }
  },
};

module.exports = keywordsRepo;
