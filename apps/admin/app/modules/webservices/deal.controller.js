const userModel = require("../user/models/user.model")
const dealRepo = require("../deal/repositories/deal.repository");
const roleRepo = require("../role/repositories/role.repository");
const userRepo = require("../user/repositories/user.repository")
const _ = require("lodash")
const validator = require("../../validators/deal")
const notification = require("../../helper/notifications")
const notificationRepo = require("../notification/repositories/notification.repository")
const mongoose = require("mongoose")
const fs = require('fs');
const settingsRepository = require("../settings/repositories/settings.repository");

// response helper
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const requestHandler = new RequestHandler(logger);
const axios = require("axios");
const SYSAVINGS_API_BASE_URL = 'https://api.sysavings.com';
// response helper

class DealControllerApi {
    async getDealList(req, res) {
        try {
            console.log(req.user);

            let allList = await dealRepo.getAllDeals(req);
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Deal List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Deal Listing Successfully')(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getDeal(req, res) {
        try {
            console.log("hiyyyyyy");

            let dealDetails = await dealRepo.getDeal(req);
            console.log(dealDetails, "ddddddddddddddd");

            if (_.isEmpty(dealDetails)) {
                return requestHandler.throwError(400, 'Deal does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Deal Retrieve Successfully')(dealDetails);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async recordDealView(req, res) {
        try {
            const { dealId } = req.body;

            if (!dealId) {
                return requestHandler.throwError(400, 'Deal id is required')();
            }

            const updatedDeal = await dealRepo.incrementClickCount(dealId);

            if (_.isEmpty(updatedDeal)) {
                return requestHandler.throwError(404, 'Deal does not exist')();
            }

            return requestHandler.sendSuccess(res, 'Deal view recorded')(updatedDeal);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async recordDealCtaClick(req, res) {
        try {
            const { dealId } = req.body;

            if (!dealId) {
                return requestHandler.throwError(400, 'Deal id is required')();
            }

            const updatedDeal = await dealRepo.incrementCtaClickCount(dealId);

            if (_.isEmpty(updatedDeal)) {
                return requestHandler.throwError(404, 'Deal does not exist')();
            }

            return requestHandler.sendSuccess(res, 'Deal CTA click recorded')(updatedDeal);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async reportExpiredDeal(req, res) {
        try {
            const { dealId } = req.body;

            if (!dealId) {
                return requestHandler.throwError(400, 'Deal id is required')();
            }

            const updatedDeal = await dealRepo.incrementExpiredReports(dealId);

            if (_.isEmpty(updatedDeal)) {
                return requestHandler.throwError(404, 'Deal does not exist')();
            }

            return requestHandler.sendSuccess(res, 'Deal reported as expired')(updatedDeal);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }


    async likeDeal(req, res) {
        try {
            let upsertLike = await dealRepo.saveOrUpdateLike(
                { dealId: req.body.dealId, userId: req.user._id },
                { isLike: req.body.isLike, isDislike: req.body.isDisLike, dealId: req.body.dealId, userId: req.user._id }
            );

            return _.isEmpty(upsertLike)
                ? requestHandler.throwError(400, 'Error in saving or updating Like')()
                : requestHandler.sendSuccess(res, 'Like Updated Successfully')(upsertLike);
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }


    async favoriteDeal(req, res) {
        try {
            const { dealId } = req.body;
            const userId = req.user._id;

            let existData = await dealRepo.getByFieldFavorite({ dealId, userId });

            let newFavoriteStatus = _.isNull(existData)
                ? { dealId, userId }
                : { isFavorite: existData.isFavorite ? false : true };

            let upsertLike = await dealRepo.saveOrUpdateFavorite({ dealId, userId }, newFavoriteStatus);
            console.log("upsertLike: ", upsertLike);

            if (_.isEmpty(upsertLike)) {
                return requestHandler.throwError(400, 'Error in saving or updating Favorite')();
            }

            return requestHandler.sendSuccess(res, 'Favorite Updated Successfully')(upsertLike);
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async addDeal(req, res) {
        try {

            console.log("hitttttt");

            const validationError = await validator.adddeal(req.body);
            // console.log(validationError);


            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            req.body.deal_title = req.body.deal_title.trim();
            req.body.deal_price = req.body.deal_price.trim();
            req.body.product_link = req.body.product_link.trim();
            req.body.description = req.body.description.trim();
            req.body.discount = req.body.discount.trim();
            req.body["userId"] = req.user._id;

            let image = {};
            let saveImage = []


            let isTitleExists = await dealRepo.getByField({
                deal_title: { $regex: req.body.deal_title, $options: "i" },
                isDeleted: false,
            });
            let isLinkExists = await dealRepo.getByField({
                product_link: req.body.product_link,
                isDeleted: false,
            });
            if (!_.isEmpty(isTitleExists)) {
                return requestHandler.throwError(409, 'Deal Title Already Exists')()
            }
            if (!_.isEmpty(isLinkExists)) {
                return requestHandler.throwError(409, 'Product Link Already Exists')()
            }

            let saveData = await dealRepo.save(req.body);
            if (!_.isEmpty(saveData) && saveData._id) {
                if (!_.isEmpty(req.files)) {
                    for (let obj of req.files) {
                        (image["image"] = obj.filename),
                            (image["deal_id"] = saveData._id);
                        saveImage.push(await dealRepo.saveImage(image));
                    }
                }
                console.log("saveImage", saveImage);

                let message =
                {
                    token: req.user.device_token,
                    notification:
                    {
                        image: `${saveImage[0].image}`,
                        title: `${saveData.deal_title}`,
                        body: `${saveData.status}`
                    }
                }
                let notification_save =
                {
                    notification_image: message.notification.image,
                    notification_title: message.notification.title,
                    notification_description: "Your Deal is being Pending for Approval",
                    notification_message: message.notification.body,
                    reference_deal_id: saveData._id,
                    target_user_id: req.user._id
                }
                console.log("notification_save: ", notification_save);
                let savedNotifications = await notificationRepo.save(notification_save);
                if (savedNotifications) {
                    let check = await notification.pushNotification(message);
                    // console.log(check, "yyyyyyy");

                }
                return requestHandler.sendSuccess(res, 'Deal Saved Successfully')([{ saveData }, { saveImage }]);
            }
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }
    async getFavouriteListByUser(req, res) {
        try {
            // console.log("hitttttt");

            // console.log(req.user);

            let allList = await dealRepo.getFavoritesByUser(req, res, { userId: req.user._id, isFavorite: true });
            // console.log(allList, "Aaaaaaa");


            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, `Favourite List for user ${req.user.fullName} does not exist`)()
            }
            return requestHandler.sendSuccess(res, `Favourite List For user ${req.user.fullName} Fetch Successfully`)(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getDealsByUser(req, res) {
        try {
            let allList;
            // console.log(req.user);


            if (_.isEmpty(req.user.personalized_category)) {
                // console.log("hitttttt");

                // let alldeals = await dealRepo.getAllDealsCustom(req);
                allList = await dealRepo.getDealsByUser(req, res, {});
                return requestHandler.sendSuccess(res, 'Deal Listing Successfully')(allList);
            }

            let personal_category = req.user.personalized_category.map(item => { return item.category });
            // console.log(personal_category, "pppppp");

            allList = await dealRepo.getDealsByUser(req, res, { categoryId: { $in: personal_category } });
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Deal List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Deal Listing Successfully')(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getCreatedDealsByUser(req, res) {
        try {

            let settings = await settingsRepository.getByField({});
            console.log(settings.amountToPayCustomer);

            let allList = await dealRepo.getDealsofUser(req, res, { userId: req.user._id });
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Deal List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Deal Listing Successfully')(allList, { amount: settings.amountToPayCustomer });
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async editDeal(req, res) {
        try {

            let id = req.body.id
            // console.log(req.body);
            // console.log(req.files);



            let image = {};
            let saveImage = []


            let isTitleExists = await dealRepo.getByField({
                deal_title: { $regex: req.body.deal_title, $options: "i" },
                isDeleted: false,
                _id: { $ne: id }
            });
            let isLinkExists = await dealRepo.getByField({
                product_link: req.body.product_link,
                isDeleted: false,
                _id: { $ne: id }
            });
            if (!_.isEmpty(isTitleExists)) {
                return requestHandler.throwError(409, 'Deal Title Already Exists')()
            }
            if (!_.isEmpty(isLinkExists)) {
                return requestHandler.throwError(409, 'Product Link Already Exists')()
            }

            if (!_.isEmpty(req.body.delete_image_ids)) {
                let existDealImages = await dealRepo.getAllByFieldImages({ _id: { $in: req.body.delete_image_ids } });
                if (!_.isEmpty(existDealImages)) {
                    for (let obj of existDealImages) {
                        if (fs.existsSync(`./public/uploads/DealImages/${obj.image}`)) {
                            fs.unlinkSync(`./public/uploads/DealImages/${obj.image}`)
                        }
                    }
                }
                await dealRepo.bulkDeleteImages({ _id: { $in: req.body.delete_image_ids } })
            }

            let saveData = await dealRepo.updateByField(req.body, { _id: id });
            if (!_.isEmpty(saveData)) {
                if (!_.isEmpty(req.files)) {
                    for (let obj of req.files) {
                        (image["image"] = obj.filename),
                            (image["deal_id"] = id);
                        saveImage.push(await dealRepo.saveImage(image));
                    }
                }
                return requestHandler.sendSuccess(res, 'Deal Updated Successfully')([{ saveData }, { saveImage }]);
            }
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async deleteDeal(req, res) {
        try {

            let existData = await dealRepo.getByField({ _id: req.params.id });
            if (_.isEmpty(existData)) {
                return requestHandler.throwError(404, 'Deal Does Not Exist')()
            }
            let deleteData = await dealRepo.updateById({ isDeleted: true }, req.params.id);
            if (!_.isEmpty(deleteData)) {
                let existDealImages = await dealRepo.getAllByFieldImages({ deal_id: req.params.id });
                if (!_.isEmpty(existDealImages)) {
                    for (let obj of existDealImages) {
                        if (fs.existsSync(`./public/uploads/DealImages/${obj.image}`)) {
                            fs.unlinkSync(`./public/uploads/DealImages/${obj.image}`)
                        }
                    }
                }
                await dealRepo.bulkDeleteImages({ deal_id: req.params.id });
            }
            return requestHandler.sendSuccess(res, 'Deal Deleted Successfully')(deleteData);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getDealByJSON(req, res) {
        try {
            const page = Number(req.body.page) || 1;
            const limit = Number(req.body.limit) || 10;
            const searchTerm = req.body.search && req.body.search.trim() !== "" ? req.body.search.trim() : null;

            const { data: responseData } = await axios.get(`${SYSAVINGS_API_BASE_URL}/api/mergeJSON/paginated`, {
                params: { page, limit }
            });

            const dealsFromApi = responseData?.data || responseData?.results || responseData;
            const deals = Array.isArray(dealsFromApi) ? dealsFromApi : [];
            const searchRegex = searchTerm ? new RegExp(searchTerm, 'i') : null;

            const filteredDeals = searchRegex ? deals.filter((item) => searchRegex.test(item.Name)) : deals;

            const buildImageUrl = (path) => {
                if (!path) return path;
                if (/^https?:\/\//i.test(path)) return path;
                return `${SYSAVINGS_API_BASE_URL}${path}`;
            };

            const dealsWithImages = filteredDeals.map((item, index) => {
                const dealTitle = item.Name || item.title || item.deal_title || '';
                const salePrice = item.Price1 || item.Price || item.price || item.deal_price || item.Price2 || '';
                const originalPrice = item.Price2 || item.originalPrice || '';
                const productLink = item.URL || item.Url || item.url || item.product_link || item.productLink || '';

                return {
                    ...item,
                    _id: item._id || item.id || item.Id || item.ID || `${page}-${index}`,
                    Name: dealTitle || item.Name,
                    Price: salePrice || item.Price,
                    Price1: item.Price1 || salePrice,
                    Price2: item.Price2 || originalPrice,
                    Off: item.Off || item.off || item.discount || '',
                    Url: productLink || item.Url,
                    Company: item.Company || item.company || '',
                    Mtype: item.Mtype || item.MType || item.type || '',
                    Subtype: item.Subtype || item.subType || item.subtype || '',
                    Image: buildImageUrl(item.Image),
                    image: buildImageUrl(item.image),
                    imageUrl: buildImageUrl(item.imageUrl)
                };
            });

            return requestHandler.sendSuccess(res, 'Deal Listing Fetched Successfully')({
                page,
                length: limit,
                data: dealsWithImages
            });

        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async notifyNewDeals(req, res) {
        try {

            // Fetch all users except the one with excluded role
            let allUsers = await userRepo.getAllByField({
                role: { $ne: new mongoose.Types.ObjectId('6745db357d3e30936cf0ef4e') },
                isDeleted: false
            });

            if (!allUsers.length) {
                return requestHandler.sendSuccess(res, 'No users to notify')();
            }

            const discount = req.body.Off ?? 25;
            const title = req.body.Name || "Special Offer";
            const messageText = `🔥 Get up to ${discount}% OFF. Shop now to grab the best offers on a variety of products, Deals are live NOW!`;
            const dealReference = mongoose.Types.ObjectId.isValid(req.body.id) ? req.body.id : null;

            for (let user of allUsers) {
                let data = {
                    target_user_id: user._id,
                    notification_title: req.body.id || title,
                    notification_message: messageText,
                    notification_description: "",
                    notification_image: req.body.Image || null,
                    isWeb: true,
                    ...(dealReference ? { reference_deal_id: dealReference } : {}),
                };

                let saved = await notificationRepo.save(data);

                if (user.device_token && user.notifications == true) {
                    let pushPayload = {
                        token: user.device_token,
                        notification: {
                            title: title,
                            body: messageText
                        }
                    };
                    await notification.pushNotification(pushPayload);
                }
            }

            return requestHandler.sendSuccess(res, 'Notifications sent successfully')();

        } catch (error) {
            console.error("Error in notifyNewDeals:", error);
            return requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = new DealControllerApi()
