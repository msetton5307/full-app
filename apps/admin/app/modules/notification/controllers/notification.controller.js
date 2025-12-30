const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const mongoose = require('mongoose');
const axios = require('axios');

const DealRepo = require('../../deal/repositories/deal.repository');
const notificationRepo = require('../repositories/notification.repository');
const userRepo = require('../../user/repositories/user.repository');
const notificationHelper = require('../../../helper/notifications');
const SYSAVINGS_API_BASE_URL = 'https://api.sysavings.com';
class NotificationController {
  constructor() {
    this.compose = this.compose.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.getDealsForDropdown = this.getDealsForDropdown.bind(this);
    this.getDealDetails = this.getDealDetails.bind(this);
    this.findDealFromApi = this.findDealFromApi.bind(this);
    this.fetchDealsFromApi = this.fetchDealsFromApi.bind(this);
    this.normalizeApiDeal = this.normalizeApiDeal.bind(this);
    this.buildImageUrl = this.buildImageUrl.bind(this);
  }
  async compose(req, res) {
    try {
      const deals = await this.getDealsForDropdown();

      res.render('notification/views/send', {
        page_name: 'notification-management',
        page_title: 'Send Notification',
        user: req.user,
        deals,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDealsForDropdown() {
    try {
      const normalizedDeals = await this.fetchDealsFromApi();

      if (normalizedDeals.length) {
        return normalizedDeals;
      }
    } catch (error) {
      // Fall back to DB deals if the external API is unavailable.
    }

    // Include every deal that is available in deal management (even if the
    // isDeleted flag is missing/null) so the notification dropdown always
    // shows the full list.
    return DealRepo.getAllByField({ isDeleted: { $ne: true } });
  }

  async getDealDetails(dealId) {
    let deal = null;

    if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
      deal = await DealRepo.getByField({ _id: new mongoose.Types.ObjectId(dealId), isDeleted: false });
      if (deal) {
        return deal;
      }
    }

    const apiDeal = await this.findDealFromApi(dealId);

    if (apiDeal) {
      return apiDeal;
    }

    return null;
  }

  async findDealFromApi(dealId) {
    if (!dealId) {
      return null;
    }

    try {
      const deals = await this.fetchDealsFromApi();
      return deals.find((item) => String(item._id) === String(dealId)) || null;
    } catch (error) {
      return null;
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
    return {
      _id: item._id || item.id || item.Id || item.ID || `${index}`,
      deal_title: item.Name || item.title || item.deal_title || 'Untitled Deal',
      notification_image: this.buildImageUrl(item.Image || item.image || item.imageUrl),
    };
  }

  buildImageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${SYSAVINGS_API_BASE_URL}${path}`;
  }

  async broadcast(req, res) {
    try {
      const { deal_id: dealId, title, message } = req.body;

      console.log('[NotificationController.broadcast] Incoming request payload:', {
        body: req.body,
        userId: req.user?._id?.toString?.() || null,
      });

      if (!title || !message) {
        req.flash('error', 'Title and message are required.');
        return res.redirect(namedRouter.urlFor('admin.notification.compose'));
      }

      const deal = dealId ? await this.getDealDetails(dealId) : null;

      if (dealId && !deal) {
        req.flash('error', 'Selected deal not found or inactive.');
        return res.redirect(namedRouter.urlFor('admin.notification.compose'));
      }

      const dealImages = deal?.
        _id && mongoose.Types.ObjectId.isValid(deal._id)
        ? await DealRepo.getAllByFieldImages({ deal_id: deal._id })
        : [];
      const notificationImage = this.buildImageUrl(dealImages?.[0]?.image || deal?.notification_image || '');

      console.log('[NotificationController.broadcast] Prepared deal data for notification:', {
        dealId: deal?._id?.toString?.() || null,
        notificationImage,
      });

      const users = await userRepo.getAllByField({ isDeleted: false, status: 'Active' });

      console.log('[NotificationController.broadcast] Users fetched for notification:', {
        count: users?.length || 0,
      });

      if (!users || !users.length) {
        req.flash('error', 'No users found to notify.');
        return res.redirect(namedRouter.urlFor('admin.notification.compose'));
      }

      for (const targetUser of users) {
        const notificationData = {
          ...(deal?._id && mongoose.Types.ObjectId.isValid(deal._id) ? { reference_deal_id: deal._id } : {}),
          target_user_id: targetUser._id,
          notification_title: title,
          notification_message: message,
          notification_description: deal ? `Deal: ${deal.deal_title || 'Selected deal'}` : '',
          notification_image: notificationImage,
          isWeb: true,
        };

        console.log('[NotificationController.broadcast] Saving notification for user:', {
          userId: String(targetUser._id),
          notificationData,
        });

        await notificationRepo.save(notificationData);

        if (targetUser.device_token && targetUser.notifications === true) {
          const pushData = {};

          if (deal?._id) {
            pushData.dealId = String(deal._id);
          }

          const pushPayload = {
            token: targetUser.device_token,
            notification: {
              title,
              body: message,
              image: notificationImage,
            },
            data: pushData,
          };

          console.log('[NotificationController.broadcast] Sending push notification:', {
            userId: String(targetUser._id),
            payload: pushPayload,
          });

          await notificationHelper.pushNotification(pushPayload);
        } else {
          console.log('[NotificationController.broadcast] Skipping push notification:', {
            userId: String(targetUser._id),
            hasDeviceToken: !!targetUser.device_token,
            notificationsEnabled: targetUser.notifications === true,
          });
        }
      }

      req.flash('success', 'Notification sent successfully.');
      res.redirect(namedRouter.urlFor('admin.notification.compose'));
    } catch (error) {
      console.error('[NotificationController.broadcast] Unable to send notification due to error:', error);
      req.flash('error', 'Unable to send notification. Please try again.');
      res.redirect(namedRouter.urlFor('admin.notification.compose'));
    }
  }
}

module.exports = new NotificationController();
