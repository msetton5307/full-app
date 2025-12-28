const mongoose = require('mongoose');
const Notification = require('notification/models/notification.model');
const perPage = config.other.pageLimit;

const NotificationRepo = {

    getAll: async (req) => {

        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push({
                "isDeleted": false
            });
            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'question': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'answer': { $regex: req.body.search.value.trim(), $options: 'i' } },


                    ]
                });
            }
            conditions['$and'] = and_clauses;

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.find(req.body.columns, { data: 'status' });
                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }
            }

            let sortOperator = { "$sort": {} };
            if (_.has(req.body, 'order') && req.body.order.length) {
                for (let order of req.body.order) {
                    let sortField = req.body.columns[+order.column].data;
                    if (order.dir == 'desc') {
                        var sortOrder = -1;
                    } else if (order.dir == 'asc') {
                        var sortOrder = 1;
                    }
                    sortOperator["$sort"][sortField] = sortOrder;
                }
            } else {
                sortOperator["$sort"]['_id'] = -1;
            }

            var aggregate = Notification.aggregate([
                {
                    $match: conditions
                },
                {
                    $sort:
                    {
                        createdAt:-1
                    }
                }
            ]);
            var options = {
                page: req.body.page,
                limit: req.body.length
            };
            let allRecord = await Notification.aggregatePaginate(aggregate, options);
            return allRecord;
        } catch (e) {
            throw (e);
        }
    },


    getById: async (id) => {
        try {
            let record = await Notification.findById(id).lean().exec();
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },


    hardDelete: async (params) => {
        try {
            let deleted = await Notification.deleteMany(params);
            if (!deleted) {
                return null;
            }
            return deleted;
        } catch (err) {
            throw err;
        }
    },

    getByField: async (params) => {
        try {
            let record = await Notification.findOne(params).exec();
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },

    getAllByField: async (params) => {
        try {
            let record = await Notification.find(params).sort({
                '_id': -1
            }).exec();
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },



    save: async (data) => {
        try {
            
            let save = await Notification.create(data);
            if (!save) {
                return null;
            }
            return save;
        } catch (e) {
            return e;
        }
    },

    getDocumentCount: async (params) => {
        try {
            let recordCount = await Notification.countDocuments(params);
            if (!recordCount) {
                return null;
            }
            return recordCount;
        } catch (e) {
            return e;
        }
    },

    getCountByParam: async (params) => {
        try {
            let Faq = await Notification.countDocuments(params);
            return Faq;
        } catch (e) {
            throw (e);
        }
    },

    delete: async (id) => {
        try {
            let record = await Notification.findById(id);
            if (record) {
                let recordDelete = await Notification.findByIdAndUpdate(id, {
                    isDeleted: true
                }, {
                    new: true
                });
                if (!recordDelete) {
                    return null;
                }
                return recordDelete;
            }
        } catch (e) {
            throw e;
        }
    },

    updateById: async (data, id) => {
        try {
            let record = await Notification.findByIdAndUpdate(id, data, {
                new: true
            });
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            return e;
        }
    },

    updateByField: async (field, fieldValue, data) => {
        //todo: update by field
    },

    getByParamsCustom: async (params) => {
        try {
            let record = await Notification.aggregate([
                {
                    $match: {
                        $and: [params]
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0,
                        status: 0,
                        isDeleted: 0
                    }
                }
            ])
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            throw e
        }
    },

    getAllByParams: async (params) => {
        try {
            let aggregate = Notification.aggregate([
                {
                    $match: {
                        $and: [params]
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

            if (!aggregate) {
                return null;
            }
            return aggregate;
        } catch (e) {
            throw e
        }
    },

    getStats: async () => {
        try {
            let count = await Notification.find({ "isDeleted": false }).count();
            let activecount = await Notification.find({ "isDeleted": false, "status": "Active" }).count();
            let inactivecount = await Notification.find({ "isDeleted": false, "status": "Inactive" }).count();

            return {
                count,
                activecount,
                inactivecount
            };
        } catch (e) {
            return e;
        }
    },


    getAllNotifications: async (params, pagination, req) => {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push(
                params
            );

            if (req.body.zone && req.body.zone == "sa") {
                and_clauses.push({
                    "zone": "sa"
                })
            } else {
                and_clauses.push({
                    "zone": ""
                })
            }

            conditions['$and'] = and_clauses;

            let aggregate = Notification.aggregate([
                {
                    $match: conditions
                },
                {
                    $project: {
                        updatedAt: 0,
                        status: 0,
                        isDeleted: 0,
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { user_id: '$reference_user_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$user_id'] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    first_name: 1,
                                    last_name: 1,
                                    full_name: 1,
                                    profile_image: 1
                                }
                            }

                        ],
                        as: 'reference_user_details'
                    }
                },
                {
                    $unwind: {
                        path: '$reference_user_details',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'deals',
                        let: { deal_id: '$reference_deal_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$deal_id'] },
                                            { $eq: ['$isDeleted', false] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    deal_title: 1,
                                    description: 1
                                }
                            }
                        ],
                        as: 'reference_deal_details'
                    }
                },
                {
                    $unwind: {
                        path: '$reference_deal_details',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'tasks',
                        let: { user_id: '$task_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$user_id'] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    title: 1,
                                    userId: 1
                                }
                            }

                        ],
                        as: 'task_details'
                    }
                },
                {
                    $unwind: {
                        path: '$task_details',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "target_user_id": 1,
                        "marked_as_read": 1,
                        "action": 1,
                        "notification_message": 1,
                        "createdAt": 1,
                        "reference_user_details": 1,
                        "reference_deal_id": 1,
                        "reference_deal_details": 1,
                        "task_details": 1,
                        "type": 1,
                        "zone":1
                    }
                }
            ])

            let allRecord = await Notification.aggregatePaginate(aggregate, pagination);

            if (!allRecord) {
                return null;
            }
            return allRecord;
        } catch (e) {
            throw e
        }
    },


    updateMany: async (params, data) => {
        try {
            let updatedData = await Notification.updateMany(params, { $set: data });
            if (!updatedData) {
                return null;
            }
            return updatedData;
        } catch (err) {
            return err;
        }
    },


};

module.exports = NotificationRepo;
