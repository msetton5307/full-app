const mongoose = require('mongoose');
const User = require('../models/user.model');
const userModel = require('../models/user.model');
const _ = require("lodash")
const userRepository = {
    findOneWithRole: async (params) => {
        try {
            const email = params?.email?.trim().toLowerCase();
            const query = {
                email,
                isDeleted: false
            };

            if (Array.isArray(params?.roles) && params.roles.length) {
                query.role = { $in: params.roles };
            }

            let user = await User.findOne(query).populate('role').exec();

            if (!user) {
                throw {
                    "status": 500,
                    data: null,
                    "message": 'Authentication failed. User not found.'
                }
            }

            if (!user.validPassword(params.password, user.password)) {
                throw {
                    "status": 500,
                    data: null,
                    "message": 'Authentication failed. Wrong password.'
                }
            } else {
                throw {
                    "status": 200,
                    data: user,
                    "message": ""
                }
            }
        } catch (e) {
            return e;
        }
    },

    bulkDelete: async (params) => {
        try {
            await User.deleteMany(params);
            return true;
        } catch (e) {
            return e;
        }
    },

    getAllUsers: async (req) => {
        try {
            let conditions = {};
            let and_clauses = [];

            and_clauses.push({ "isDeleted": false, "isSignupCompleted": true });
            and_clauses.push({ "user_role.role": req.body.role });

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'fullName': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'email': { $regex: '^' + req.body.search.value.trim(), $options: 'i' } },
                        { 'phone': { $regex: '^' + req.body.search.value.trim(), $options: 'i' } },

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
            // console.log(req.body,'body');
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

            let aggregate = User.aggregate([
                {
                    $lookup: {
                        "from": "roles",
                        "let": { role: "$role" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "user_role"
                    }
                },
                { "$unwind": "$user_role" },
                { $match: conditions },
                {
                    $group: {
                        '_id': '$_id',
                        'fullName': { $first: '$fullName' },
                        'email': { $first: '$email' },
                        'phone': { $first: '$phone' },
                        'isDeleted': { $first: '$isDeleted' },
                        'status': { $first: '$status' },
                        'user_role': { $first: '$user_role' },
                        'profile_image': { $first: '$profile_image' },
                        // 'isVerified': { $first: '$isVerified' },
                        'createdAt': { $first: '$createdAt' }
                    }
                },

                // { $sort: { createdAt: -1 } }
                sortOperator
            ]);

            let options = { page: req.body.page, limit: req.body.length };
            let allUsers = await User.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    },
    getAllManualCheckUsers: async (req) => {
        try {
            let conditions = {};
            let and_clauses = [];

            and_clauses.push({ "isDeleted": false, isSignupCompleted: true, "isGenderVerified": false, "manualGenderVeificationStatus": "pending" });
            and_clauses.push({ "user_role.role": req.body.role });

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'fullName': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'email': { $regex: '^' + req.body.search.value.trim(), $options: 'i' } },
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

            let aggregate = User.aggregate([
                {
                    $lookup: {
                        "from": "roles",
                        "let": { role: "$role" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "user_role"
                    }
                },
                { "$unwind": "$user_role" },
                { $match: conditions },
                {
                    $group: {
                        '_id': '$_id',
                        'fullName': { $first: '$fullName' },
                        'email': { $first: '$email' },
                        'phone': { $first: '$phone' },
                        'isDeleted': { $first: '$isDeleted' },
                        'status': { $first: '$status' },
                        'user_role': { $first: '$user_role' },
                        'profile_image': { $first: '$profile_image' },
                        'isVerified': { $first: '$isVerified' },
                        'createdAt': { $first: '$createdAt' }
                    }
                },
                sortOperator
            ]);

            let options = { page: req.body.page, limit: req.body.length };
            let allUsers = await User.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    },

    getAllUsersByFields: async (params) => {
        try {
            return await User.aggregate([
                {
                    $project: {
                        _id: '$_id',
                        first_name: 1,
                        last_name: 1,
                        fullName: 1,
                        email: 1,
                        status: 1,
                        isDeleted: 1
                    }
                },
                { $match: params }
            ]);
        } catch (e) {
            return e;
        }
    },

    getUserDetails: async (params) => {
        try {
            let aggregate = await User.aggregate([
                { $match: params },
                {
                    $lookup: {
                        "from": "roles",
                        let: { role: "$role" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] }
                                        ]
                                    }
                                }
                            },

                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "role"
                    }
                },
                { "$unwind": "$role" },
                // {
                //     $lookup:{
                //         from:"hobbies",
                //         let :{hobbyIds : "$hobby"},
                //         pipeline:[
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $and: [
                //                             { $in: ["$_id", "$$hobbyIds"] },
                //                             { $eq: ["$isDeleted", false] },
                //                             { $eq: ["$status", "Active"] }
                //                         ]
                //                     }
                //                 }
                //             },
                //         ],
                //         as:"hobby_data"
                //     }
                // },

                {
                    $project: {
                        password: 0,
                        deviceToken: 0,
                        deviceType: 0,
                        register_type: 0,
                        isDeleted: 0,
                        status: 0,
                        updatedAt: 0,
                    }
                },
            ]);
            if (!aggregate) return null;
            return aggregate;
        } catch (e) {
            return e;
        }
    },
    getUserDetailsCustom: async (params, logged_in_user) => {
        try {
            // console.log(logged_in_user,"logged_in_user");
            let aggregate = await User.aggregate([
                { $match: params },
                {
                    $lookup: {
                        "from": "roles",
                        let: { role: "$role" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] }
                                        ]
                                    }
                                }
                            },

                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "role"
                    }
                },
                { "$unwind": "$role" },
                {
                    $lookup: {
                        from: "hobbies",
                        let: { hobbyIds: "$hobby" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$_id", "$$hobbyIds"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$status", "Active"] }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "hobby_data"
                    }
                },

                {
                    $lookup: {
                        from: "user_gallery_images",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", "$$userId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$status", "Active"] }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "galery_data"
                    }
                },

                {
                    $lookup: {
                        from: "friends",
                        let: { user_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$status", "Accepted"] },
                                            { $eq: ["$isDeleted", false] },
                                            {
                                                $or: [
                                                    { $eq: ["$from_user_id", "$$user_id"] },
                                                    { $eq: ["$to_user_id", "$$user_id"] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    friend_id: {
                                        $cond: [
                                            { $eq: ["$from_user_id", "$$user_id"] },
                                            "$to_user_id",
                                            "$from_user_id"
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "friends_of_user"
                    }
                },
                {
                    $lookup: {
                        from: "friends",
                        let: { loggedin_user_id: logged_in_user },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$status", "Accepted"] },
                                            { $eq: ["$isDeleted", false] },
                                            {
                                                $or: [
                                                    { $eq: ["$from_user_id", "$$loggedin_user_id"] },
                                                    { $eq: ["$to_user_id", "$$loggedin_user_id"] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    friend_id: {
                                        $cond: [
                                            { $eq: ["$from_user_id", "$$loggedin_user_id"] },
                                            "$to_user_id",
                                            "$from_user_id"
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "friends_of_loggedin_user"
                    }
                },
                {
                    $addFields: {
                        mutual_friends: {
                            $setIntersection: [
                                "$friends_of_user.friend_id",
                                "$friends_of_loggedin_user.friend_id"
                            ]
                        },
                        mutual_friend_count: {
                            $size: {
                                $setIntersection: [
                                    "$friends_of_user.friend_id",
                                    "$friends_of_loggedin_user.friend_id"
                                ]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'chat_room_users',
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$status", "Active"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$user_id", "$$userId"] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "user_room_details"
                    }
                },

                {
                    $lookup: {
                        from: 'chat_room_users',
                        let: { userId: logged_in_user },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$status", "Active"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$user_id", "$$userId"] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "logged_in_user_room_details"
                    }
                },

                {
                    $addFields: {
                        common_room_ids: {
                            $setIntersection: [
                                { $map: { input: "$user_room_details", as: "urd", in: "$$urd.room_id" } },
                                { $map: { input: "$logged_in_user_room_details", as: "lurd", in: "$$lurd.room_id" } }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        room_id: {
                            $cond: [
                                { $gt: [{ $size: "$common_room_ids" }, 0] },
                                { $arrayElemAt: ["$common_room_ids", 0] },
                                null
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        age: {
                            $subtract: [
                                { $year: new Date() },
                                { $year: "$dob" }
                            ]
                        }
                    }
                },

                // {
                //     $lookup: {
                //         from: "friends",
                //         let: { loggedin_user_id: "$logged_in_user", friend_id: "$_id" },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $and: [
                //                             // { $eq: ["$status", "Accepted"] },
                //                             { $eq: ["$isDeleted", false] },
                //                             {

                //                                 $or: [
                //                                     { $eq: ["$from_user_id", "$$loggedin_user_id"] },
                //                                     { $eq: ["$from_user_id", "$$friend_id"] }
                //                                 ]

                //                             },
                //                             {

                //                                 $or: [
                //                                     { $eq: ["$to_user_id", "$$loggedin_user_id"] },
                //                                     { $eq: ["$to_user_id", "$$friend_id"] }
                //                                 ]

                //                             }
                //                             // {$in :["$from_user_id",["$$loggedin_user_id","$$friend_id"]]},
                //                             // {$in :["$to_user_id",["$$loggedin_user_id","$$friend_id"]]}


                //                         ],

                //                     }
                //                 }
                //             },
                //         ],
                //         as: "friends_list"
                //     }
                // },
                // {
                //     $addFields: {
                //         isFriend: {
                //             $cond: [
                //                 { $gt: [{ $size: "$friends_list" }, 0] },
                //                 true,
                //                 false
                //             ]
                //         },
                //         // logged_in_user:"$logged_in_user"
                //     }
                // },

                {
                    $project: {
                        hobby: 0,
                        password: 0,
                        deviceToken: 0,
                        deviceType: 0,
                        register_type: 0,
                        isDeleted: 0,
                        status: 0,
                        updatedAt: 0,
                        common_room_ids: 0,
                        logged_in_user_room_details: 0,
                        user_room_details: 0,
                        friends_of_loggedin_user: 0,
                        friends_of_user: 0,
                        // logged_in_user:"$logged_in_user"
                        // friends_list:0,
                        // friends_of_loggedin_user:0,
                        // friends_of_user:0

                    }
                },
            ]);
            if (!aggregate) return null;
            return aggregate;
        } catch (e) {
            return e;
        }
    },

    getById: async (id) => {
        try {
            let user = await User.findById(id).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getByIdWithUserDevices: async (id) => {
        try {
            let user = await User.findById(id).populate('role').populate({
                path: 'userdevices',
                options: { sort: { updatedAt: -1 } }
            }).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getByIdWithParam: async (id) => {
        try {
            let user = await User.findById(id).populate('role').populate({
                path: 'userdevices',
                options: { sort: { updatedAt: -1 } }
            }).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getByField: async (params) => {
        try {
            let user = await User.findOne(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getAllSelectedFields: async (params) => {
        try {
            let user = await User.find(params, { email: 1, first_name: 1, last_name: 1, fullName: 1, _id: 1 }).exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    getDistinctDocument: async (field, params) => {
        try {
            let record = await User.distinct(field, params);
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            return e;
        }
    },

    getUserCountByParam: async (params) => {
        try {
            let user = await User.countDocuments(params);
            return user;
        } catch (e) {
            throw (e);
        }
    },

    getDistinctDocumentCount: async (field, params) => {
        try {
            let recordCount = await User.distinct(field, params);
            if (!recordCount) {
                return 0;
            }
            return recordCount.length;
        } catch (e) {
            return e;
        }
    },


    getAllByField: async (params) => {
        try {
            let user = await User.find(params).populate('role').lean().exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getLimitUserByField: async (params, limit) => {
        try {
            let user = await User.find(params).populate('role').limit(limit).sort({
                _id: -1
            }).exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    delete: async (id) => {
        try {
            let user = await User.findById(id);
            if (user) {
                let userDelete = await User.deleteOne({
                    _id: id
                }).exec();
                if (!userDelete) {
                    return null;
                } else {
                    await PrivacySettingsModel.deleteMany({ user_id: new mongoose.Types.ObjectId(id) });
                    return userDelete;
                }
            } else {
                return null;
            }
        } catch (e) {
            return e;
        }
    },

    deleteByField: async (field, fieldValue) => {
        //todo: Implement delete by field
    },


    updateById: async (data, id) => {
        try {
            let user = await User.findByIdAndUpdate(id, data, {
                new: true
            });

            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },


    updateByField: async (data, param) => {
        try {
            let user = await User.updateOne(param, data, {
                new: true
            });
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    updateAllByParams: async (data, params) => {
        try {
            let datas = await User.updateMany(params, data, { new: true });
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
            let user = await User.create(data);

            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    forgotPassword: async (params) => {
        try {
            let user = await User.findOne({ email: params.email.trim(), isDeleted: false }).exec();
            if (!user) {
                throw { "status": 500, data: null, "message": 'Authentication failed. User not found.' }
            } else if (user) {
                let random_pass = Math.random().toString(36).substr(2, 9);
                let readable_pass = random_pass;
                random_pass = user.generateHash(random_pass);
                let user_details = await User.findByIdAndUpdate(user._id, { password: random_pass }).exec();
                if (!user_details) {
                    throw { "status": 500, data: null, "message": 'User not found.' }
                } else {
                    throw { "status": 200, data: readable_pass, "message": "Mail is sending to your mail id with new password" }
                }
                //return readable_pass;	
            }
        } catch (e) {
            return e;
        }
    },

    getUser: async (id) => {
        try {
            let user = await User.findOne({
                id
            }).exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    getUserByField: async (data) => {
        try {
            let user = await User.findOne(data).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    getUsersByField: async (data) => {
        try {
            let user = await User.find(data).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    },

    findAllUsers: async () => {
        try {
            let data = await User.find({ "isDeleted": false });
            if (_.isEmpty(data)) {
                return null;
            }
            return data;
        } catch (err) {
            throw err;
        }
    },

    getByIdWithPopulate: async (id) => {
        try {
            let user = await User.findById(id).populate('role').lean().exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    },

    getByParam: async (params) => {
        try {
            let record = await User.aggregate([
                {
                    $match: {
                        $and: [params]
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0,
                        creditScores: 0,
                        stripeCustomerId: 0,
                        registerType: 0,
                        socialId: 0,
                        deviceToken: 0,
                        deviceType: 0,
                        isDeleted: 0,
                        isActive: 0,
                        status: 0,
                        subscription: 0,
                        promoCode: 0,
                        referralCode: 0,
                        isSubscribed: 0,
                        role: 0,
                        phone: 0,
                        email: 0,
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

    getUserDetailsProfile: async (id) => {
        try {
            let conditions = {};
            let and_clauses = [];

            and_clauses.push({ _id: new mongoose.Types.ObjectId(id), "isDeleted": false });
            conditions['$and'] = and_clauses;

            let aggregate = await User.aggregate([
                { $match: conditions },
                {
                    $lookup: {
                        "from": "roles",
                        "let": { role: "$role" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "user_role"
                    }
                },
                { "$unwind": "$user_role" },

                {
                    $lookup: {
                        "from": "promt_answers",
                        "let": { userId: "$_id" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", "$$userId"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                        ],
                        "as": "answerData"
                    }
                },

                {
                    $addFields: {
                        isAboutYouFound: {
                            $cond: [
                                { $gt: [{ $size: "$answerData" }, 0] },
                                true,
                                false
                            ]
                        }
                    }
                }, {
                    $project: {
                        answerData: 0,
                    }
                }


            ]);
            return aggregate[0];

        }
        catch (error) {
            throw error
        }
    },

    getUserDetailsforChat: async (params, userId) => {
        try {
            let conditions = {};
            let and_clauses = [];

            and_clauses.push({ _id: new mongoose.Types.ObjectId(params), "isDeleted": false });
            conditions['$and'] = and_clauses;

            let aggregate = User.aggregate([
                { $match: conditions },
                {
                    $lookup: {
                        "from": "roles",
                        "let": { role: "$role" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "user_role"
                    }
                },
                { "$unwind": "$user_role" },


                {
                    $lookup: {
                        "from": "chat_rooms",
                        let: { userId },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ["$from_id", new mongoose.Types.ObjectId(params)] },
                                                    { $eq: ["$to_id", new mongoose.Types.ObjectId(userId)] },
                                                    { $eq: ["$is_block", true] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $eq: ["$to_id", new mongoose.Types.ObjectId(params)] },
                                                    { $eq: ["$from_id", new mongoose.Types.ObjectId(userId)] },
                                                    { $eq: ["$is_block", true] }
                                                ]
                                            }
                                        ]
                                    }

                                }
                            },

                        ],
                        "as": "chat_details"
                    }
                },
                {
                    $unwind:
                    {
                        path: '$chat_details',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $addFields: {
                        "is_block": {
                            $cond: {
                                if: { $ifNull: ["$chat_details", false] },
                                then: true,
                                else: false
                            }
                        }
                    }
                },

                {
                    $project: {
                        "fullName": "$fullName",
                        "is_block": "$is_block",
                        "profile_image": "$profile_image",
                        "isOnline": "$isOnline",
                        "last_seen": "$last_seen",
                        "blocked_by": "$chat_details.block_by"
                    }
                },

            ]);
            return aggregate;

        }
        catch (error) {
            throw error;
        }
    },

    getAllSuggestedUsers: async (req) => {
        try {

            let aggregate = User.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [Number(req.user.lng), Number(req.user.lat)]


                        },

                        key: "geo_loc",
                        distanceField: "distance",

                        // maxDistance: req.body.distance * 1000,
                        distanceMultiplier: 0.001
                    }
                },
                // {
                //     $match:{
                //         isDeleted:false,
                //         // isSignupCompleted:true,
                //         // isProfileCompleted:true,
                //         status:"Unblock",
                //         // isGenderVerified:true,
                //         _id:{$ne:req.user._id}

                //     }
                // },



                {
                    $lookup: {
                        "from": "roles",
                        "let": { role: "$role" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$role"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: "$_id",
                                    role: "$role",
                                    roleDisplayName: "$roleDisplayName"
                                }
                            }
                        ],
                        "as": "user_role"
                    }
                },
                { "$unwind": "$user_role" },

                {
                    $lookup: {
                        from: "user_gallery_images",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", "$$userId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$status", "Active"] }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "galery_data"
                    }
                },
                {
                    $addFields: {
                        logged_in_user_id: new mongoose.Types.ObjectId(req.user._id)
                    }
                },
                {
                    $lookup: {
                        from: "friends",
                        let: { loggedin_user_id: "$logged_in_user_id", friend_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            // { $eq: ["$status", "Accepted"] },
                                            { $eq: ["$isDeleted", false] },
                                            {

                                                $or: [
                                                    { $eq: ["$from_user_id", "$$loggedin_user_id"] },
                                                    { $eq: ["$to_user_id", "$$loggedin_user_id"] }
                                                ]

                                            },
                                            {

                                                $or: [
                                                    { $eq: ["$from_user_id", "$$friend_id"] },
                                                    { $eq: ["$to_user_id", "$$friend_id"] }
                                                ]

                                            }

                                        ],

                                    }
                                }
                            },
                        ],
                        as: "friends"
                    }
                },
                {
                    $addFields: {
                        isFriend: {
                            $cond: [
                                { $gt: [{ $size: "$friends" }, 0] },
                                true,
                                false
                            ]
                        }
                    }
                },

                {
                    $lookup: {
                        from: "interesteds",
                        let: { loggedin_user_id: "$logged_in_user_id", friend_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            // { $eq: ["$status", "Accepted"] },
                                            { $eq: ["$isDeleted", false] },
                                            {

                                                $or: [
                                                    { $eq: ["$from_user_id", "$$loggedin_user_id"] },
                                                    { $eq: ["$to_user_id", "$$loggedin_user_id"] }
                                                ]

                                            },
                                            {

                                                $or: [
                                                    { $eq: ["$from_user_id", "$$friend_id"] },
                                                    { $eq: ["$to_user_id", "$$friend_id"] }
                                                ]

                                            }

                                        ],

                                    }
                                }
                            },
                        ],
                        as: "interests"
                    }
                },
                {
                    $addFields: {
                        isInterested: {
                            $cond: [
                                { $gt: [{ $size: "$interests" }, 0] },
                                true,
                                false
                            ]
                        }
                    }
                },
                { $match: req.body.conditions },
                req.body.sortOperator
            ]);

            let options = { page: req.body.page, limit: req.body.perpage };
            let allUsers = await User.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    },

    saveOrUpdate: async (params, data) => {


        try {

            return await userModel.updateOne(
                params,
                { $set: data },
                { upsert: true }
            )
        }
        catch (e) {
            throw e
        }
    },

    getAllDeals: async (params) => {

        try {
            let conditions = {};
            let and_clauses = [];

            and_clauses.push({ "isDeleted": false });
            and_clauses.push(params);

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'fullName': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'email': { $regex: '^' + req.body.search.value.trim(), $options: 'i' } },
                        { 'phone': { $regex: '^' + req.body.search.value.trim(), $options: 'i' } },

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
            // console.log(req.body,'body');
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

            let aggregate = await userModel.aggregate([
                { $match: conditions },
                {
                    $lookup: {
                        from: "deals",
                        let: { id: "$personalized_category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$categoryId", "$$id"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                }])


            let options = { page: req.body.page, limit: req.body.length };
            let allUsers = await User.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }

    },

    getDealsByUser: async (req, res, params) => {

        try {

            console.log(req.body);

            let conditions = {};
            let and_clauses = [];

            and_clauses.push(params)
            and_clauses.push({ "isDeleted": false });


            // if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {

            //   and_clauses.push({
            //     $or: [
            //       { 'deal_title': { $regex: req.body.search.value.trim(), $options: 'i' } },
            //     ]
            //   });
            // }

            // if (req.body.isFeature === true) {

            //     and_clauses.push({ "deals.isFeature": true })
            // }

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

            let aggregate = userModel.aggregate([

                {
                    $lookup: {
                        from: "deals",
                        let: { id: { $ifNull: ["$personalized_category.category", []] } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$categoryId", "$$id"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "dealimages",
                                    let: { id: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$deal_id", "$$id"] },
                                                        { $eq: ["$isDeleted", false] }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                createdAt: 0,
                                                updatedAt: 0,
                                                isDeleted: 0
                                            }
                                        }
                                    ],
                                    as: "dealimages"
                                }
                            },
                            // {
                            //     $unwind: "$images"
                            // },
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
                                    dealimages:1,
                                    discount: 1,
                                    discounted_price: 1,
                                    brand_logo: 1
                                }
                            },
                            {
                                $sort: { _id: -1 }
                            }
                        ],
                        as: "deals"
                    }
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
                        deals: 1
                    }
                }

            ]);
            let options = { page: req.body.page, limit: req.body.length };
            let allTestimonial = await userModel.aggregatePaginate(aggregate, options);

            return allTestimonial;
        } catch (e) {
            throw (e);
        }
    },

};

module.exports = userRepository;
