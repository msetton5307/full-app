const mongoose = require("mongoose");
const BankAccount = require("../model/bank.model");

const BankAccountRepository = {
    getAll: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push({
                isDeleted: false,
            });

            var sortOperator = {
                $sort: {},
            };

            if (_.isObject(req.body)) {
                if (_.has(req.body, "keyword") && req.body.keyword.trim() != "") {
                    and_clauses.push({
                        $or: [
                            { question: { $regex: '^' + req.body.keyword.trim(), $options: "i" } },
                        ],
                    });
                }
                if (
                    _.has(req.body, "status") &&
                    (req.body.status.trim() == "Active" ||
                        req.body.status.trim() == "Inactive")
                ) {
                    and_clauses.push({
                        status: req.body.status,
                    });
                }

                if (_.has(req.body, "sort_by")) {
                    var sortField = req.body.sort_by;
                    if (req.body.sort_order == "desc") {
                        var sortOrder = -1;
                    } else if (req.body.sort_order == "asc") {
                        var sortOrder = 1;
                    }
                    sortOperator["$sort"][sortField] = sortOrder;
                } else {
                    sortOperator["$sort"]["_id"] = -1;
                }
            }

            conditions["$and"] = and_clauses;

            var aggregate = BankAccount.aggregate([
                {
                    $match: conditions,
                },
                sortOperator,
            ]);

            var options = {
                page: req.body.page,
                limit: req.body.per_page,
            };
            let allRecord = await BankAccount.aggregatePaginate(aggregate, options);

            return allRecord;
        } catch (e) {
            throw e;
        }
    },

    getById: async (id) => {
        try {
            let record = await BankAccount.findById(id).lean().exec();
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            throw e;
        }
    },

    getByField: async (params) => {
        try {
            let record = await BankAccount.findOne(params).exec();
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            throw e;
        }
    },

    getAllByField: async (params) => {

        try {
            let record = await BankAccount.find(params).sort({ createdAt: -1 }).exec();
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            throw e;
        }
    },

    save: async (data) => {
        try {
            let save = await BankAccount.create(data);
            if (!save) {
                return null;
            }
            return save;
        } catch (e) {
            throw e;
        }
    },

    getDocumentCount: async (params) => {
        try {
            let recordCount = await BankAccount.countDocuments(params);
            if (!recordCount) {
                return 0;
            }
            return recordCount;
        } catch (e) {
            throw e;
        }
    },

    delete: async (id) => {
        try {
            let record = await BankAccount.findById(id);
            if (record) {
                let recordDelete = await BankAccount.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
                if (!recordDelete) {
                    return null;
                }
                return recordDelete;
            }
        } catch (e) {
            throw e;
        }
    },

    updateById: async (id, data) => {
        try {
            let record = await BankAccount.findByIdAndUpdate(id, data, {
                new: true,
            });
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            throw e;
        }
    },

    updateMany: async (params, data) => {
        try {
            let updatedData = await BankAccount.updateMany(params, { $set: data });
            if (!updatedData) {
                return null;
            }
            return updatedData;
        } catch (err) {
            return err;
        }
    },

    updateByField: async (field, fieldValue, data) => {
        //todo: update by field
    },

    getAllBankAccounts: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({
                "isDeleted": false,
                "status": "Active",
            });

            var sortOperator = {
                "$sort": {}
            };

            if (_.isObject(req.body)) {
                if (_.has(req.body, 'keyword') && req.body.keyword.trim() != '') {
                    and_clauses.push({
                        $or: [
                            { 'title': { $regex: '^' + req.body.keyword.trim(), $options: 'i' } },
                            { 'dateString': { $regex: '^' + req.body.keyword.trim(), $options: 'i' } },
                        ]
                    });
                }


                if (_.has(req.body, 'sort_by') && req.body.sort_by.trim() != '' && req.body.sort_by != null) {
                    var sortField = req.body.sort_by;
                    if (req.body.sort_order == 'desc') {
                        var sortOrder = -1;
                    } else {
                        var sortOrder = 1;
                    }
                    sortOperator["$sort"][sortField] = sortOrder;
                } else {
                    sortOperator["$sort"]['_id'] = -1;
                }
            }

            conditions['$and'] = and_clauses;

            var aggregate = BankAccount.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "BankAccount_writer",
                        foreignField: "_id",
                        as: "writer_details",
                    },
                },
                {
                    $unwind: "$writer_details"
                },
                {
                    $addFields:
                    {
                        dateString: {
                            $dateToString: {
                                date: '$createdAt',
                                format: "%m-%d-%Y",
                            }
                        }
                    }
                },
                {
                    $match: conditions
                },
                {
                    $project: {
                        "title": 1,
                        "description": 1,
                        "image": 1,
                        "tags": 1,
                        "createdAt": 1,
                        "writer_details.first_name": 1,
                        "writer_details.last_name": 1,
                        "writer_details.full_name": 1
                    }
                },
                sortOperator
            ]);

            var options = {
                page: req.body.page,
                limit: req.body.per_page
            };
            let allBankAccounts = await BankAccount.aggregatePaginate(aggregate, options);

            return allBankAccounts;
        } catch (err) {
            throw err;
        }
    },


    getByParamsCustom: async (params) => {
        try {
            let record = await BankAccount.aggregate([
                {
                    $match: {
                        $and: [params]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "BankAccount_writer",
                        foreignField: "_id",
                        as: "writer_details",
                    },
                },
                {
                    $unwind: "$writer_details"
                },
                {
                    $project: {
                        "title": 1,
                        "description": 1,
                        "image": 1,
                        "tags": 1,
                        "createdAt": 1,
                        "writer_details.first_name": 1,
                        "writer_details.last_name": 1,
                        "writer_details.full_name": 1
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

    getRelatedBankAccount: async (id) => {
        try {
            let record = await BankAccount.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
                {
                    $lookup:
                    {
                        from: "BankAccounts",
                        let: {
                            tags: '$tags',
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$tags", "$$tags"] },
                                                { $ne: ["$_id", mongoose.Types.ObjectId(id)] }
                                            ]
                                    }
                                }
                            },
                        ],
                        as: "related_BankAccounts"
                    }
                }
            ])

            if (record.length > 0) {
                return record[0];
            }
            return null;
        } catch (e) {
            throw e
        }
    }
   
    
};

module.exports = BankAccountRepository;
