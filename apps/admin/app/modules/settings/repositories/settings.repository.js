const mongoose = require('mongoose');
const SettingsModel = require('settings/models/settings.model');

const settingsRepository = {
    getById: async (id) => {
        try {
            let datas = await SettingsModel.findById(id).exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    getByField: async (params) => {
        try {
            let datas = await SettingsModel.findOne(params).lean().exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    getAllByField: async (params) => {
        try {
            let datas = await SettingsModel.find(params).exec();
            return datas;
        } catch (e) {
            throw (e);
        }
    },

    delete: async (id) => {
        try {
            let datas = await SettingsModel.findById(id);
            if (datas) {
                let dataDelete = await SettingsModel.deleteOne({
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
            let datas = await SettingsModel.findByIdAndUpdate(id, data, {
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
            let datas = await SettingsModel.create(data);
            if (!datas) {
                return null;
            }
            return datas;
        } catch (e) {
            throw e;
        }
    },

    saveOrUpdate: async (params, data) => {


        try {
    
          return await SettingsModel.updateOne(
            params,
            { $set: data },
            { upsert: true }
          )
        }
        catch (e) {
          throw e
        }
      },
};



module.exports = settingsRepository;