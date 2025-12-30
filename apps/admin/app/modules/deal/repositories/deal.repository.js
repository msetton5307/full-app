const mongoose = require('mongoose');
const DealModel = require('../models/deal.model');
const DealImageModel = require('../models/deal.images.model');
const DealLikeModel = require("../models/deal.like.model");
const DealFavoriteModel = require("../models/deal.favorite.model");

const DealRepo = {

  getById: async (id) => {
    try {
      let datas = await DealModel.findById(id).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getByField: async (params) => {
    try {
      let datas = await DealModel.findOne(params).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByField: async (params) => {
    try {
      let datas = await DealModel.find(params).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldWithSortAndLimit: async (params, sort, limit) => {
    try {
      let datas = await DealModel.find(params).sort(sort).limit(limit).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocument: async (field, params) => {
    try {
      let datas = await DealModel.distinct(field, params);
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
      let datas = await DealModel.countDocuments(params);
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getDistinctDocumentCount: async (field, params) => {
    try {
      let datasCount = await DealModel.distinct(field, params);
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
      let datas = await DealModel.findById(id);
      if (datas) {
        let dataDelete = await DealModel.deleteOne({
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
      await DealModel.deleteMany(params);
      return true;
    } catch (e) {
      return e;
    }
  },

  bulkDeleteImages: async (params) => {
    try {
      await DealImageModel.deleteMany(params);
      return true;
    } catch (e) {
      return e;
    }
  },

  updateById: async (data, id) => {
    try {
      let datas = await DealModel.findByIdAndUpdate(id, data, {
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
      let datas = await DealModel.updateOne(param, data, {
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
      let datas = await DealModel.updateMany(params, data, { new: true });
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
      let datas = await DealModel.create(data);
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

      let record = await DealModel.aggregate([
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
      let record = await DealModel.findById(id, { isDeleted: 0, updatedAt: 0 });
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
      let count = await DealModel.find({ "isDeleted": false }).countDocuments();
      let approvedCount = await DealModel.find({ "isDeleted": false, "status": "Approved" }).countDocuments();
      let pendingCount = await DealModel.find({ "isDeleted": false, "status": "Pending" }).countDocuments();
      let expiredCount = await DealModel.find({ "isDeleted": false, "status": "Expired" }).countDocuments();

      return {
        count,
        approvedCount,
        pendingCount,
        expiredCount
      };
    } catch (e) {
      return e;
    }
  },

  getPaymentStats: async () => {
    try {
      let count = await DealModel.find({ "status": "Approved", "isDeleted": false, userId: { $ne: null } }).countDocuments();
      let activecount = await DealModel.find({ "isDeleted": false, "isPaymentDone": true, "status": "Approved", userId: { $ne: null } }).countDocuments();
      let inactivecount = await DealModel.find({ "isDeleted": false, "isPaymentDone": false, "status": "Approved", userId: { $ne: null } }).countDocuments();

      return {
        count,
        activecount,
        inactivecount
      };
    } catch (e) {
      return e;
    }
  },

  getAllWithMetrics: async () => {
    try {
      const deals = await DealModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'dealimages',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$deal_id', '$$id'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              },
              { $sort: { createdAt: 1 } },
              { $limit: 1 },
              { $project: { image: 1 } }
            ],
            as: 'images'
          }
        },
        {
          $lookup: {
            from: 'likedislikedeals',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$dealId', '$$id'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: '$dealId',
                  likes: {
                    $sum: { $cond: [{ $eq: ['$isLike', true] }, 1, 0] }
                  },
                  dislikes: {
                    $sum: { $cond: [{ $eq: ['$isDislike', true] }, 1, 0] }
                  }
                }
              }
            ],
            as: 'likeStats'
          }
        },
        {
          $addFields: {
            primaryImage: { $ifNull: [{ $arrayElemAt: ['$images.image', 0] }, null] },
            likes: { $ifNull: [{ $arrayElemAt: ['$likeStats.likes', 0] }, 0] },
            dislikes: { $ifNull: [{ $arrayElemAt: ['$likeStats.dislikes', 0] }, 0] },
            clickCount: { $ifNull: ['$clickCount', 0] },
            ctaClickCount: { $ifNull: ['$ctaClickCount', 0] },
            expiredReports: { $ifNull: ['$expiredReports', 0] },
            isExpiredReported: { $ifNull: ['$isExpiredReported', false] }
          }
        },
        {
          $project: {
            images: 0,
            likeStats: 0
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return deals;
    } catch (e) {
      throw (e);
    }
  },

  getFaqCountByParam: async (params) => {
    try {
      let Faq = await DealModel.countDocuments(params);
      return Faq;
    } catch (e) {
      throw (e);
    }
  },

  getAllByFieldCustom: async (params) => {
    try {
      let datas = await DealModel.find(params, { isDeleted: 0, updatedAt: 0 }).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getAllDeals: async (req) => {
    try {


      let conditions = {};
      let and_clauses = [];

      and_clauses.push({ "isDeleted": false });
      and_clauses.push({ "status": "Approved" });


      if (req.body.search) {

        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.trim(), $options: 'i' } },
          ]
        });
      }

      conditions['$and'] = and_clauses;
      console.log("conditions: ", conditions);

      let aggregate = DealModel.aggregate([
        { $match: conditions },
        {
          $lookup: {
            from: 'dealimages',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$deal_id', '$$id'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              }, {
                $project: {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0
                }
              }
            ],
            as: 'images'
          },
        },
        {
          $lookup: {
            from: 'categories',
            let: { id: '$categoryId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$id'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              }, {
                $project: {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0,

                }
              }
            ],
            as: 'categories'
          },
        },
        {
          $unwind: {
            path: "$categories",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            discounted_price: {
              $subtract: [
                { $toDouble: "$deal_price" },
                {
                  $multiply: [
                    { $toDouble: "$deal_price" },
                    { $divide: [{ $toDouble: "$discount" }, 100] }
                  ]
                }
              ]
            }
          }
        },

        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
            categoryId: 0
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllDealsCustom: async (req) => {
    try {


      let conditions = {};
      let and_clauses = [];

      and_clauses.push({ "isDeleted": false });


      if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {

        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.value.trim(), $options: 'i' } },
          ]
        });
      }

      conditions['$and'] = and_clauses;



      let aggregate = DealModel.aggregate([
        {
          $lookup: {
            from: "dealimages",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and:
                      [
                        { $eq: ["$deal_id", "$$id"] },
                        { $eq: ["$isDeleted", false] }
                      ]
                  }
                }
              }
            ],
            as: "dealimages"
          }
        },
        {
          $addFields: {
            discounted_price: {
              $subtract: [
                { $toDouble: "$deal_price" },
                {
                  $multiply: [
                    { $toDouble: "$deal_price" },
                    { $divide: [{ $toDouble: "$discount" }, 100] }
                  ]
                }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            deal_title: 1,
            deal_price: 1,
            status: 1,
            isFeature: 1,
            "image": "$images.image",
            discount: 1,
            discounted_price: 1,
            brand_logo: 1
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $addFields: {
            deals: {
              $cond: {
                if: { $eq: [{ $type: req.body.isFeature }, "bool"] },  // Check if isFeature is provided
                then: {
                  $filter: {
                    input: "$deals",  // The deals array
                    as: "deal",
                    cond: { $eq: ["$$deal.isFeature", true] }  // Filter where isFeature is true
                  }
                },
                else: "$deals"  // Return all deals if isFeature is not provided
              }
            }
          }
        },
        {
          $match: conditions  // Apply your other matching conditions
        },
        {
          $project: {
            _id: 1,
            deal_title: 1,
            deal_price: 1,
            status: 1,
            isFeature: 1,
            "image": "$images.image",
            discount: 1,
            discounted_price: 1,
            brand_logo: 1
          }
        },

      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
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
            { 'deal_title': { $regex: req.body.search.value.trim(), $options: 'i' } },
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
      // console.log(conditions);
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


      let aggregate = DealModel.aggregate([
        { $match: conditions },
        {
          $lookup:
          {
            from: "dealimages",
            let: { id: "$_id" },
            pipeline:
              [
                {
                  $match:
                  {
                    $expr:
                    {
                      $and:
                        [
                          { $eq: ["$deal_id", "$$id"] },
                          { $eq: ["$isDeleted", false] },
                        ]
                    }
                  }
                }
              ],
            as: "images"
          }
        },
        {
          $project: {
            // createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
            categoryId: 0
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllApprovedDeals: async (req) => {
    try {


      let conditions = {};
      let and_clauses = [];

      and_clauses.push({ "isDeleted": false });
      and_clauses.push({ status: "Approved" });
      and_clauses.push({ userId: { $ne: null } });


      if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {

        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.value.trim(), $options: 'i' } },
          ]
        });
      }


      // if (req.body.columns && req.body.columns.length) {

      //   let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
      //   if (statusFilter && statusFilter.search && statusFilter.search.value) {

      //     and_clauses.push({
      //       "status": statusFilter.search.value
      //     });
      //   }
      // }

      conditions['$and'] = and_clauses;
      // console.log(conditions);
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


      let aggregate = DealModel.aggregate([
        { $match: conditions },
        {
          $lookup:
          {
            from: "users",
            let: { id: "$userId" },
            pipeline:
              [
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
            as: "users"
          }
        },
        {
          $unwind:
          {
            path: "$users",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            deal_title: 1,
            product_link: 1,
            "userName": "$users.fullName",
            "userId": "$users._id",
            status: 1,
            isPaymentDone: 1
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllDealsByUser: async (req) => {
    try {


      let conditions = {};
      let and_clauses = [];
      // console.log(req.body);


      and_clauses.push({ "isDeleted": false });


      if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {

        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.value.trim(), $options: 'i' } },
          ]
        });
      }

      if (_.has(req.body, 'isFeature') && typeof req.body.isFeature === 'boolean') {
        and_clauses.push({ isFeature: req.body.isFeature })
      }

      conditions['$and'] = and_clauses;

      let aggregate = DealModel.aggregate([
        { $match: conditions },
        {
          $lookup: {
            from: "dealimages",
            let: { id: "$_id" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [
                        { $eq: ["$deal_id", "$$id"] },
                        { $eq: ["$isDeleted", false] }
                      ]
                  }
                }
              }
            ],
            as: "dealimages"
          }
        },
        {
          $addFields: {
            discounted_price: {
              $subtract: [
                { $toDouble: "$deal_price" },
                {
                  $multiply: [
                    { $toDouble: "$deal_price" },
                    { $divide: [{ $toDouble: "$discount" }, 100] }
                  ]
                }
              ]
            }
          }
        },

        {
          $sort: { _id: -1 }
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0
          }
        },
      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getAllCustom: async (req) => {
    try {
      let aggregate = DealModel.aggregate([
        {
          $match: {
            "isDeleted": false,
            "status": 'Active',
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
      let allRecord = await DealModel.aggregatePaginate(aggregate, options);
      return allRecord;
    } catch (e) {
      throw e
    }
  },

  getDeal: async (req) => {
    try {
      console.log(req.params.id, "idddddddd");

      let aggregate = DealModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
            isDeleted: false
          },
        },
        {
          $lookup: {
            from: 'dealimages',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$deal_id', '$$id'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              {
                $project: {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0,
                },
              },
            ],
            as: 'images',
          },
        },
        {
          $lookup: {
            from: 'categories',
            let: { id: '$categoryId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$id'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              {
                $project: {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0,
                },
              },
            ],
            as: 'categories',
          },
        },
        {
          $unwind: {
            path: '$categories',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'likedislikedeals',
            let: { dealId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$dealId', '$$dealId'] },
                      { $eq: ['$userId', new mongoose.Types.ObjectId(req.user._id)] },
                    ],
                  },
                },
              },
              {
                $project: {
                  isLike: 1,
                  isDislike: 1,
                  _id: 0,
                },
              },
            ],
            as: 'likeData',
          },
        },
        {
          $addFields: {
            isLike: {
              $cond: {
                if: { $gt: [{ $size: '$likeData' }, 0] },
                then: { $arrayElemAt: ['$likeData.isLike', 0] },
                else: false,
              },
            },
          }
        },

        {
          $addFields: {
            isDislike: {
              $cond: {
                if: { $gt: [{ $size: '$likeData' }, 0] },
                then: { $arrayElemAt: ['$likeData.isDislike', 0] },
                else: false,
              },
            },
          }
        },

        {
          $lookup: {
            from: 'favoritedeals',
            let: { dealId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$dealId', '$$dealId'] },
                      { $eq: ['$userId', new mongoose.Types.ObjectId(req.user._id)] },
                    ],
                  },
                },
              },
            ],
            as: 'favouriteData',
          },
        },
        {
          $addFields: {
            isFavourite: {
              $cond: {
                if: { $gt: [{ $size: '$favouriteData' }, 0] },
                then: { $arrayElemAt: ['$favouriteData.isFavorite', 0] },
                else: false,
              },
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
            categoryId: 0,
            likeData: 0,
            favouriteData: 0,
          },
        },
      ]);

      return aggregate;
    } catch (e) {
      throw e;
    }
  },


  saveImage: async (data) => {
    try {
      let datas = await DealImageModel.create(data);
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      throw e;
    }
  },

  saveLike: async (data) => {
    try {
      let datas = await DealLikeModel.create(data);
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      throw e;
    }
  },

  saveFavorite: async (data) => {
    try {
      let datas = await DealFavoriteModel.create(data);
      if (!datas) {
        return null;
      }
      return datas;
    } catch (e) {
      throw e;
    }
  },

  getAllByFieldImages: async (params) => {
    try {
      let datas = await DealImageModel.find(params).exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  getByFieldFavorite: async (params) => {
    try {
      let datas = await DealFavoriteModel.findOne(params).lean().exec();
      return datas;
    } catch (e) {
      throw (e);
    }
  },

  bulkDeleteImages: async (params) => {
    try {
      await DealImageModel.deleteMany(params);
      return true;
    } catch (e) {
      return e;
    }
  },

  saveOrUpdateLike: async (params, data) => {


    try {

      return await DealLikeModel.updateOne(
        params,
        { $set: data },
        { upsert: true }
      )
    }
    catch (e) {
      throw e
    }
  },

  saveOrUpdateFavorite: async (params, data) => {


    try {

      return await DealFavoriteModel.updateOne(
        params,
        { $set: data },
        { upsert: true }
      )
    }
    catch (e) {
      throw e
    }
  },
  getFavoritesByUser: async (req, res, params) => {
    try {

      console.log('hittttttt');

      let conditions = {};
      let and_clauses = [];
      console.log(req.body);

      and_clauses.push(params)
      and_clauses.push({ "isDeleted": false });


      if (_.has(req.body, 'search')) {

        and_clauses.push({
          $or: [
            { 'deals.deal_title': { $regex: req.body.search.trim(), $options: 'i' } },
          ]
        });
      }



      conditions['$and'] = and_clauses;



      let aggregate = DealFavoriteModel.aggregate([

        // { $match: conditions },

        {
          $lookup: {
            from: 'deals',
            let: { id: '$dealId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$id'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              }, {
                $project: {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0
                }
              },
              {
                $addFields: {
                  discounted_price: {
                    $subtract: [
                      { $toDouble: "$deal_price" },
                      {
                        $multiply: [
                          { $toDouble: "$deal_price" },
                          { $divide: [{ $toDouble: "$discount" }, 100] }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                $lookup:
                {
                  from: "dealimages",
                  let: { id: "$_id" },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr:
                        {
                          $and:
                            [
                              { $eq: ["$deal_id", "$$id"] },
                              { $eq: ["$isDeleted", false] }
                            ]
                        }
                      }
                    },
                    {
                      $project:
                      {
                        createdAt: 0,
                        updatedAt: 0,
                        isDeleted: 0
                      }
                    }
                  ],
                  as: "dealimages"
                }
              }
            ],
            as: 'deals'
          },
        },
        { $match: conditions },

        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0
          }
        },

      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealFavoriteModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getDealsByUser: async (req, res, params) => {

    try {

      // console.log(req.body);

      let conditions = {};
      let and_clauses = [];

      if (!_.isEmpty(params)) {
        and_clauses.push(params)
      }
      and_clauses.push({ "isDeleted": false });


      if (_.has(req.body, 'search')) {
        // console.log("hittttttt");


        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.trim(), $options: 'i' } },
          ]
        });
      }

      if (req.body.isFeature === true) {

        and_clauses.push({ isFeature: true })
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
      console.log(conditions);
      //   console.log(and_clauses,"Aaaaa");

      let aggregate = DealModel.aggregate([

        {
          $addFields: {
            discounted_price: {
              $subtract: [
                { $toDouble: "$deal_price" },
                {
                  $multiply: [
                    { $toDouble: "$deal_price" },
                    { $divide: [{ $toDouble: "$discount" }, 100] }
                  ]
                }
              ]
            }
          }
        },


        {
          $match: conditions
        },
        {
          $lookup: {
            from: "dealimages",
            let: { id: "$_id" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [
                        { $eq: ["$deal_id", "$$id"] },
                        { $eq: ["$isDeleted", false] }
                      ]
                  }
                }
              },
              {
                $project:
                {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0
                }
              }
            ],
            as: "images"
          }
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
            categoryId: 0
          }
        },

        {
          $sort: { _id: -1 }
        }

      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  },

  getDealsofUser: async (req, res, params) => {

    try {

      // console.log(req.body);

      let conditions = {};
      let and_clauses = [];

      if (!_.isEmpty(params)) {
        and_clauses.push(params)
      }
      and_clauses.push({ "isDeleted": false });
      // and_clauses.push({ "status": "Approved" });


      if (_.has(req.body, 'search')) {
        // console.log("hittttttt");


        and_clauses.push({
          $or: [
            { 'deal_title': { $regex: req.body.search.trim(), $options: 'i' } },
          ]
        });
      }

      if (_.has(req.body, 'status')) {

        if (req.body.status === 'Approved') {
          and_clauses.push({ "status": "Approved" });
        }

      }

      if (_.has(req.body, 'isPaymentDone')) {

        if (req.body.isPaymentDone === true) {
          and_clauses.push({ "isPaymentDone": true });
        }

      }

      conditions['$and'] = and_clauses;
      console.log(conditions);
      //   console.log(and_clauses,"Aaaaa");

      let aggregate = DealModel.aggregate([

        {
          $addFields: {
            discounted_price: {
              $subtract: [
                { $toDouble: "$deal_price" },
                {
                  $multiply: [
                    { $toDouble: "$deal_price" },
                    { $divide: [{ $toDouble: "$discount" }, 100] }
                  ]
                }
              ]
            }
          }
        },


        {
          $match: conditions
        },
        {
          $lookup: {
            from: "dealimages",
            let: { id: "$_id" },
            pipeline: [
              {
                $match:
                {
                  $expr:
                  {
                    $and:
                      [
                        { $eq: ["$deal_id", "$$id"] },
                        { $eq: ["$isDeleted", false] }
                      ]
                  }
                }
              },
              {
                $project:
                {
                  createdAt: 0,
                  updatedAt: 0,
                  isDeleted: 0
                }
              }
            ],
            as: "images"
          }
        },

        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
          }
        },

        {
          $sort: { _id: -1 }
        }

      ]);
      let options = { page: req.body.page, limit: req.body.length };
      let allTestimonial = await DealModel.aggregatePaginate(aggregate, options);

      return allTestimonial;
    } catch (e) {
      throw (e);
    }
  }

}


module.exports = DealRepo;
