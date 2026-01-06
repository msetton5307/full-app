const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const mongoose = require('mongoose');
const axios = require('axios');

const SYSAVINGS_API_BASE_URL = 'https://api.sysavings.com';

const CollectionRepo = require('../collection/repositories/collection.repository');
const DealRepo = require('../deal/repositories/deal.repository');

class CollectionControllerApi {
  /**
   * Ensure controller methods are bound to the instance so `this` remains
   * available when used as route handlers.
   */
  constructor() {
    this.listing = this.listing.bind(this);
    this.deals = this.deals.bind(this);
  }

  buildCoverImageUrl(req, filename) {
    if (!filename) {
      return '';
    }

    const baseUrl = global.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/collections/${filename}`;
  }

  async listing(req, res) {
    try {
      const collections = await CollectionRepo.getAllByField({
        isDeleted: false,
        status: 'Active',
      });

      const formatted = collections.map((collection) => ({
        _id: collection._id,
        title: collection.title,
        description: collection.description,
        coverImage: collection.coverImage,
        coverImageUrl: this.buildCoverImageUrl(req, collection.coverImage),
        dealsCount: Array.isArray(collection.deals) ? collection.deals.length : 0,
      }));

      return requestHandler.sendSuccess(res, 'Collection listing fetched successfully')(formatted);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  async deals(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return requestHandler.throwError(400, 'Invalid collection identifier')();
      }

      const collection = await CollectionRepo.getById(id);
      if (!collection || collection.isDeleted || collection.status !== 'Active') {
        return requestHandler.throwError(404, 'Collection not found')();
      }

      const dealIds = Array.isArray(collection.deals) ? collection.deals : [];
      const objectIds = dealIds
        .map((dealId) => (mongoose.isValidObjectId(dealId) ? new mongoose.Types.ObjectId(dealId) : null))
        .filter(Boolean);
      const externalIds = dealIds
        .filter((dealId) => !mongoose.isValidObjectId(dealId))
        .map((dealId) => dealId && dealId.toString())
        .filter(Boolean);

      const localDeals = await DealRepo.getAllByField({
        _id: { $in: objectIds },
        isDeleted: false,
        status: 'Approved',
      });

      const externalDeals = await this.findExternalDeals(externalIds);
      const combinedDeals = [...localDeals, ...externalDeals];

      const dealLookup = new Map(combinedDeals.map((deal) => [deal?._id?.toString(), deal]));
      const orderedDeals = dealIds
        .map((dealId) => dealLookup.get(dealId?.toString()))
        .filter(Boolean);

      return requestHandler.sendSuccess(res, 'Collection deals fetched successfully')(orderedDeals);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  async findExternalDeals(dealIds = []) {
    if (!dealIds.length) {
      return [];
    }

    try {
      const apiDeals = await this.fetchDealsFromApi(Math.max(1000, dealIds.length));
      return apiDeals.filter((deal) => dealIds.includes(deal?._id?.toString()));
    } catch (error) {
      return [];
    }
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
    const buildImageUrl = (path) => {
      if (!path) return path;
      if (/^https?:\/\//i.test(path)) return path;
      return `${SYSAVINGS_API_BASE_URL}${path}`;
    };

    const dealTitle = item.Name || item.title || item.deal_title || 'Untitled Deal';
    const salePrice = item.Price1 || item.Price || item.price || item.deal_price || item.Price2 || '';
    const originalPrice = item.Price2 || item.originalPrice || '';
    const productLink = item.URL || item.Url || item.url || item.product_link || item.productLink || '';

    return {
      ...item,
      _id: item._id || item.id || item.Id || item.ID || `${index}`,
      deal_title: dealTitle,
      deal_price: salePrice,
      product_link: productLink,
      discount: item.Off || item.off || item.discount || '',
      image: buildImageUrl(item.Image || item.image || item.imageUrl),
      imageUrl: buildImageUrl(item.imageUrl || item.Image || item.image),
      Price1: item.Price1 || salePrice,
      Price2: item.Price2 || originalPrice,
      Url: productLink || item.Url,
      Name: dealTitle || item.Name,
      Company: item.Company || item.company || '',
      Mtype: item.Mtype || item.MType || item.type || '',
      Subtype: item.Subtype || item.subType || item.subtype || '',
    };
  }
}

module.exports = new CollectionControllerApi();
