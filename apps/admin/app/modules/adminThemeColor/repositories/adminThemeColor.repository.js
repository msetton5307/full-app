const mongoose = require('mongoose');
const ThemeColorModel = require('adminThemeColor/models/adminThemeColor.model');

const adminThemeColorRepository = {
    getById: async (id) => {
        try {
            let datas = await ThemeColorModel.findById(id).exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    getByField: async (params) => {
        try {
            let datas = await ThemeColorModel.findOne(params).lean().exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    getAllByField: async (params) => {
        try {
            let datas = await ThemeColorModel.find(params).exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    delete: async (id) => {
        try {
            let datas = await ThemeColorModel.findById(id);
            if (datas) {
                let dataDelete = await ThemeColorModel.deleteOne({
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

    deleteByField: async (field, fieldValue) => {
        //todo: Implement delete by field
    },


    updateById: async (data, id) => {
        try {
            let datas = await ThemeColorModel.findByIdAndUpdate(id, data, {
                new: true,
                upsert: true
            }).exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    updateByField: async (field, fieldValue, data) => {
        //todo: update by field
    },

    save: async (data) => {
        try {
            let datas = await ThemeColorModel.create(data);
            if (!datas) {
                return null;
            }
            return datas;
        } catch (e) {
            throw e;
        }
    }
};

module.exports = adminThemeColorRepository;