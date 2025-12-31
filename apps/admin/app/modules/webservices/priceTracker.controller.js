const priceTrackerRepo = require('../priceTracker/repositories/priceTracker.repository');
const notificationHelper = require('../../helper/notifications');
const notificationRepo = require('../notification/repositories/notification.repository');
const userRepo = require('../user/repositories/user.repository');
const dealRepo = require('../deal/repositories/deal.repository');

// response helper
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const requestHandler = new RequestHandler(logger);

class PriceTrackerController {
  getUserId(req) {
    return req.body?.userId || req.query?.userId || req.user?._id || null;
  }

  async list(req, res) {
    try {
      const userId = this.getUserId(req);
      if (!userId) {
        return requestHandler.throwError(400, 'User id is required')();
      }

      const data = await priceTrackerRepo.getAllByField({
        userId,
        isDeleted: false,
      });
      return requestHandler.sendSuccess(res, 'Price trackers fetched')(data || []);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  async create(req, res) {
    try {
      const userId = this.getUserId(req);
      if (!userId) {
        return requestHandler.throwError(400, 'User id is required')();
      }

      const keyword = req.body?.keyword?.trim();
      const category = req.body?.category?.trim();

      if (!keyword && !category) {
        return requestHandler.throwError(
          400,
          'At least a keyword or category is required',
        )();
      }

      const payload = {
        userId,
        keyword: keyword || '',
        category: category || '',
      };

      const created = await priceTrackerRepo.save(payload);
      return requestHandler.sendSuccess(res, 'Price tracker saved')(created);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  async remove(req, res) {
    try {
      const userId = this.getUserId(req);
      const trackerId = req.params?.id;

      if (!userId || !trackerId) {
        return requestHandler.throwError(400, 'Tracker id and user id required')();
      }

      const tracker = await priceTrackerRepo.getById(trackerId);
      if (!tracker || tracker.userId.toString() !== userId.toString()) {
        return requestHandler.throwError(404, 'Tracker not found')();
      }

      await priceTrackerRepo.updateById({isDeleted: true}, trackerId);
      return requestHandler.sendSuccess(res, 'Tracker removed successfully')({});
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  async processDealTriggers(deal) {
    try {
      const trackers = await priceTrackerRepo.getAllByField({isDeleted: false});
      if (!trackers || trackers.length === 0) {
        return;
      }

      const dealTitle = (deal?.deal_title || '').toLowerCase();
      const dealDescription = (deal?.description || '').toLowerCase();

      for (const tracker of trackers) {
        const keyword = (tracker.keyword || '').toLowerCase();
        const category = (tracker.category || '').toLowerCase();

        const keywordMatch =
          keyword &&
          (dealTitle.includes(keyword) || dealDescription.includes(keyword));
        const categoryMatch = category && dealTitle.includes(category);

        if (!keywordMatch && !categoryMatch) {
          continue;
        }

        const user = await userRepo.getById(tracker.userId);
        if (!user || user.isDeleted === true || user.notifications === false) {
          continue;
        }

        const latestDeal = await dealRepo.getDeal({
          params: {id: deal._id},
        });

        const notificationPayload = {
          notification_image: latestDeal?.dealImages?.[0]?.image || '',
          notification_title: 'New deal match',
          notification_description: `We found a new deal for ${
            tracker.keyword || tracker.category
          }`,
          notification_message: 'Approved',
          reference_deal_id: deal._id,
          target_user_id: tracker.userId,
        };

        await notificationRepo.save(notificationPayload);

        if (user.device_token) {
          await notificationHelper.pushNotification({
            token: user.device_token,
            notification: {
              title: notificationPayload.notification_title,
              body: notificationPayload.notification_description,
              image: notificationPayload.notification_image,
            },
            data: {
              dealId: deal._id.toString(),
            },
          });
        }
      }
    } catch (error) {
      logger.log(`Price tracker notification error: ${error?.message}`, 'error');
    }
  }
}

module.exports = new PriceTrackerController();
