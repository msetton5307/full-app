const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const mongoose = require('mongoose');

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

      const dealIds = (collection.deals || []).filter((id) => mongoose.isValidObjectId(id));

      const deals = await DealRepo.getAllByField({
        _id: { $in: dealIds },
        isDeleted: false,
        status: 'Approved',
      });

      return requestHandler.sendSuccess(res, 'Collection deals fetched successfully')(deals);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }
}

module.exports = new CollectionControllerApi();
