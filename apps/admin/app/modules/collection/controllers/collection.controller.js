const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const CollectionRepo = require('../repositories/collection.repository');
const DealRepo = require('../../deal/repositories/deal.repository');
const SYSAVINGS_API_BASE_URL = 'https://api.sysavings.com';

class CollectionController {
  constructor() {
    this.getDealsForDropdown = this.getDealsForDropdown.bind(this);
    this.fetchDealsFromApi = this.fetchDealsFromApi.bind(this);
    this.normalizeApiDeal = this.normalizeApiDeal.bind(this);
    this.renderAddCollectionPage = this.renderAddCollectionPage.bind(this);
    this.renderEditpage = this.renderEditpage.bind(this);
  }

  async list(req, res) {
    try {
      let status = '';
      if (req.query.status) {
        status = req.query.status;
      }

      const data = await CollectionRepo.getStats();
      res.render('collection/views/list', {
        page_name: 'collection-management',
        page_title: 'Collection List',
        user: req.user,
        status,
        data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getAll(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      const collections = await CollectionRepo.getAll(req);

      const data = {
        recordsTotal: collections.total,
        recordsFiltered: collections.total,
        data: collections.docs,
      };
      return {
        status: 200,
        data,
        message: 'Data fetched successfully.',
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async renderAddCollectionPage(req, res) {
    try {
      const deals = await this.getDealsForDropdown();
      res.render('collection/views/add', {
        page_name: 'collection-management',
        page_title: 'Add Collection',
        user: req.user,
        deals,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async insert(req, res) {
    try {
      req.body.title = req.body.title ? req.body.title.trim() : '';
      req.body.description = req.body.description ? req.body.description.trim() : '';

      if (_.isEmpty(req.body.title) || _.isEmpty(req.files)) {
        req.flash('error', 'Title and cover photo are required.');
        return res.redirect(namedRouter.urlFor('collection.add'));
      }

      if (req.files && req.files.length > 0) {
        req.body.coverImage = req.files[0].filename;
      }

      let deals = req.body.deals || [];
      if (!Array.isArray(deals)) {
        deals = deals ? [deals] : [];
      }
      req.body.deals = deals
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      const save = await CollectionRepo.save(req.body);
      if (!_.isEmpty(save) && save._id) {
        req.flash('success', 'Collection added successfully');
        res.redirect(namedRouter.urlFor('admin.collection.listing'));
      } else {
        req.flash('error', 'Unable to add collection');
        res.redirect(namedRouter.urlFor('collection.add'));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async renderEditpage(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        req.flash('error', 'Invalid collection identifier provided');
        return res.redirect(namedRouter.urlFor('admin.collection.listing'));
      }
      const collection = await CollectionRepo.getByField({
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
      });

      if (_.isEmpty(collection)) {
        req.flash('error', 'Collection not found');
        return res.redirect(namedRouter.urlFor('admin.collection.listing'));
      }

      const deals = await this.getDealsForDropdown();

      res.render('collection/views/edit', {
        page_name: 'collection-management',
        page_title: 'Edit Collection',
        user: req.user,
        response: collection,
        deals,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async update(req, res) {
    try {
      const collectionId = req.body.id;
      if (!mongoose.isValidObjectId(collectionId)) {
        req.flash('error', 'Invalid collection identifier provided');
        return res.redirect(namedRouter.urlFor('admin.collection.listing'));
      }

      req.body.title = req.body.title ? req.body.title.trim() : '';
      req.body.description = req.body.description ? req.body.description.trim() : '';

      const collection = await CollectionRepo.getById(collectionId);
      if (_.isEmpty(collection)) {
        req.flash('error', 'Collection not found');
        return res.redirect(namedRouter.urlFor('admin.collection.listing'));
      }

      let deals = req.body.deals || [];
      if (!Array.isArray(deals)) {
        deals = deals ? [deals] : [];
      }
      req.body.deals = deals
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (req.files && req.files.length > 0) {
        const newImage = req.files[0].filename;
        if (collection.coverImage) {
          const oldImagePath = path.join('./public/uploads/collections', collection.coverImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        req.body.coverImage = newImage;
      }

      const updateData = await CollectionRepo.updateById(req.body, collectionId);
      if (!_.isEmpty(updateData) && updateData._id) {
        req.flash('success', 'Collection updated successfully');
        res.redirect(namedRouter.urlFor('admin.collection.listing'));
      } else {
        req.flash('error', 'Unable to update collection');
        res.redirect(namedRouter.urlFor('collection.edit', { id: collectionId }));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getDealsForDropdown(limit = 1000) {
    const localDeals = await DealRepo.getAllByField({ isDeleted: false, status: 'Approved' });
    if (localDeals.length) {
      return localDeals;
    }

    try {
      const apiDeals = await this.fetchDealsFromApi(limit);
      if (apiDeals.length) {
        return apiDeals;
      }
    } catch (error) {
      // If the external API is unavailable, fall back to the local database.
    }

    return DealRepo.getAllByField({ isDeleted: false });
  }

  async fetchDealsFromApi(limit = 1000) {
    const { data: responseData } = await axios.get(`${SYSAVINGS_API_BASE_URL}/api/mergeJSON/paginated`, {
      params: { page: 1, limit },
    });

    const dealsFromApi = responseData?.data || responseData?.results || responseData;
    const apiDeals = Array.isArray(dealsFromApi) ? dealsFromApi : [];

    return apiDeals.map((item, index) => this.normalizeApiDeal(item, index));
  }

  normalizeApiDeal(item, index) {
    return {
      _id: item._id || item.id || item.Id || item.ID || `${index}`,
      deal_title: item.Name || item.title || item.deal_title || 'Untitled Deal',
    };
  }

  async statusChange(req, res) {
    try {
      const collection = await CollectionRepo.getById(req.params.id);
      if (!_.isEmpty(collection)) {
        const updatedStatus = collection.status === 'Active' ? 'Inactive' : 'Active';
        await CollectionRepo.updateById({ status: updatedStatus }, req.params.id);
        req.flash('success', 'Status has been changed successfully');
      }
      res.redirect(namedRouter.urlFor('admin.collection.listing'));
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async delete(req, res) {
    try {
      const collection = await CollectionRepo.getById(req.params.id);
      if (!_.isEmpty(collection)) {
        if (collection.coverImage) {
          const oldImagePath = path.join('./public/uploads/collections', collection.coverImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        const deleted = await CollectionRepo.updateById({ isDeleted: true }, collection._id);
        if (!_.isEmpty(deleted) && deleted._id) {
          req.flash('success', 'Collection deleted successfully');
        } else {
          req.flash('error', 'Unable to delete collection');
        }
      } else {
        req.flash('error', 'Collection not found');
      }
      res.redirect(namedRouter.urlFor('admin.collection.listing'));
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CollectionController();
