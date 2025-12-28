const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const DealRepo = require("../repositories/deal.repository");
const userRepo = require("../../user/repositories/user.repository")
const settingsRepo = require("../../settings/repositories/settings.repository")
const notification = require("../../../helper/notifications")
const notificationRepo = require("../../notification/repositories/notification.repository")
const mongoose = require("mongoose");
const stripe = require("../../../helper/stripe")
const CategoryRepository = require("../../category/repositories/category.repository");
const _ = require("lodash")
const axios = require("axios");
const SYSAVINGS_API_BASE_URL = 'https://api.sysavings.com';
const amazonHelper = require("../../../helper/amazon");
class DealController {
  constructor() {
    this.postDealFromAmazon = this.postDealFromAmazon.bind(this);
  }

  /**
   * @Method list
   * @Description To Show The Deal Listing Page
   */
  async list(req, res) {
    try {
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }

      let data = await DealRepo.getStats(req);
      res.render("deal/views/list", {
        page_name: "deal-management",
        page_title: "Deal List",
        user: req.user,
        status,
        data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
 * @Method list
 * @Description To Show The Deal Listing Page
 */
  async paymentList(req, res) {
    try {
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }

      let data = await DealRepo.getPaymentStats(req);
      res.render("deal/views/payment", {
        page_name: "payment-management",
        page_title: "Deal Payment List",
        user: req.user,
        status,
        data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
  * @Method addCharge
  * @Description Transfer Money To Customer
  */

  // async addPaymentIntent(req, res) {
  //   try {
  //     // console.log("hitttttttttt");
  //     // console.log(req.params.id,"reqqqqqqqqqqqq");
  //     let existDeal = await DealRepo.getById(req.params.id);
  //     // console.log(existDeal,"exiiiiiiiiiiiii");

  //     let existUser = await userRepo.getById(existDeal.userId);
  //     // console.log(existUser,"sssssssss");

  //     let settings = await settingsRepo.getByField({});
  //     // console.log(settings,"sssssss");

  //     let retrieveAccount = await stripe.accountDetails(existUser.stripe_account_id);
  //     console.log(retrieveAccount,"Rrrrrrrr");
  //     let metadata =
  //     {
  //       name: retrieveAccount.account.business_profile.name
  //     }
  //     let express_Account = await stripe.createCharge(existUser.stripe_account_id, metadata, settings.amountToPayCustomer)
  //     // // console.log(express_Account, "exxxxxxx");

  //     if (!_.isEmpty(express_Account)) {
  //       await DealRepo.updateById({ isPaymentDone: true }, req.params.id)
  //       req.flash("success", "Money Sent Successfully!");
  //       res.redirect(namedRouter.urlFor("admin.payment.listing"));
  //     } else {
  //       req.flash("error", "Deal Not Added Successfully!");
  //       res.redirect(namedRouter.urlFor("admin.payment.listing"));
  //     }
  //   }
  //   catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  // }

  async addPaymentIntent(req, res) {
    try {
      let deal = await DealRepo.getByField({ _id: req.params.id });
      let user = await userRepo.getByField({ _id: deal.userId });
      // console.log(payment, "payyyyyyyyyyyy");
      const adminCustomer = await stripe.customerDetails(req.user.stripe_account_id)
      let payment = await stripe.createPaymentIntent(user.stripe_account_id, adminCustomer);
      // console.log(adminCustomer, "payyyyyyyyyyyy");
      if (!_.isEmpty(payment)) {
        await DealRepo.updateById({ isPaymentDone: true }, req.params.id)
        req.flash("success", "Money Sent Successfully!");
        res.redirect(namedRouter.urlFor("admin.payment.listing"));
      } else {
        req.flash("error", "Money Not Send Successfully!");
        res.redirect(namedRouter.urlFor("admin.payment.listing"));
      }
      // return requestHandler.sendSuccess(res, 'Payment created Successfully')(payment);
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method getAll
   * @Description Get All Deal
   */
  async getAll(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      start = Number.isNaN(start) ? 0 : start;
      length = Number.isNaN(length) ? 10 : length;
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      const searchTerm = req.body.search && req.body.search.value ? req.body.search.value.trim() : '';

      const { data: responseData } = await axios.get(`${SYSAVINGS_API_BASE_URL}/api/mergeJSON/paginated`, {
        params: { page: currentPage, limit: length }
      });

      const dealsFromApi = responseData?.data || responseData?.results || responseData;
      const deals = Array.isArray(dealsFromApi) ? dealsFromApi : [];
      const searchRegex = searchTerm ? new RegExp(searchTerm, 'i') : null;

      const buildImageUrl = (path) => {
        if (!path) return path;
        if (/^https?:\/\//i.test(path)) return path;
        return `${SYSAVINGS_API_BASE_URL}${path}`;
      };

      const normalizedDeals = deals.map((item, index) => {
        const dealTitle = item.Name || item.title || item.deal_title || '';
        const salePrice = item.Price1 || item.Price || item.price || item.deal_price || item.Price2 || '';
        const originalPrice = item.Price2 || item.originalPrice || '';
        const productLink = item.URL || item.Url || item.url || item.product_link || item.productLink || '';

        return {
          _id: item._id || item.id || item.Id || item.ID || `${currentPage}-${index}`,
          deal_title: dealTitle,
          deal_price: salePrice,
          sale_price: salePrice,
          original_price: originalPrice,
          discount_text: item.Off || item.off || item.discount || '',
          product_link: productLink,
          company: item.Company || item.company || '',
          mtype: item.Mtype || item.MType || item.type || '',
          subtype: item.Subtype || item.subType || item.subtype || '',
          status: item.status || 'Approved',
          Image: buildImageUrl(item.Image),
          image: buildImageUrl(item.image),
          imageUrl: buildImageUrl(item.imageUrl)
        };
      });

      const filteredDeals = searchRegex ? normalizedDeals.filter((item) => searchRegex.test(item.deal_title)) : normalizedDeals;

      const totalRecords = Number(responseData?.total || responseData?.totalCount || responseData?.count || deals.length);

      let data = {
        recordsTotal: totalRecords,
        recordsFiltered: searchRegex ? filteredDeals.length : totalRecords,
        data: filteredDeals,
      };
      return {
        status: 200,
        data: data,
        message: `Data fetched successfully.`,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method renderAddFaqPage
   * @Description to render add Deal page
   */

  async renderPostDealPage(req, res) {
    try {
      res.render("deal/views/post-deal", {
        page_name: "post-deal",
        page_title: "Post Deal",
        user: req.user,
        dealInfo: null,
        errorMessage: null,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  formatCreatedAtEastern() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    return `${parts.weekday} ${parts.month} ${parts.day} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second} GMT-5`;
  }

  formatPriceStringToNumber(value) {
    if (_.isNil(value)) {
      return null;
    }

    const numericValue = Number.parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  formatUsdPrice(amount) {
    return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "";
  }

  calculatePercentOff(currentPrice, oldPrice, fallbackOff = null) {
    if (Number.isFinite(oldPrice) && Number.isFinite(currentPrice) && oldPrice > currentPrice) {
      return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    }

    const parsedFallback = Number.parseFloat(fallbackOff);
    return Number.isFinite(parsedFallback) ? Math.round(parsedFallback) : fallbackOff || null;
  }

  async postDealFromAmazon(req, res) {
    try {
      const { amazonUrl } = req.body;
      const asin = await amazonHelper.extractAsinFromUrl(amazonUrl);

      if (!asin) {
        req.flash("error", "Unable to extract ASIN from the provided link.");
        return res.render("deal/views/post-deal", {
          page_name: "post-deal",
          page_title: "Post Deal",
          user: req.user,
          dealInfo: null,
          errorMessage: "Please provide a valid Amazon product link.",
        });
      }

      const itemDetails = await amazonHelper.fetchItemDetailsByAsin(asin);
      const createdAt = this.formatCreatedAtEastern();
      const currentPriceNumber = this.formatPriceStringToNumber(itemDetails?.price1);
      const oldPriceNumber = this.formatPriceStringToNumber(itemDetails?.price2);

      let currentPrice = currentPriceNumber;
      let oldPrice = oldPriceNumber;

      if (Number.isFinite(oldPrice) && Number.isFinite(currentPrice) && oldPrice < currentPrice) {
        [currentPrice, oldPrice] = [oldPrice, currentPrice];
      }

      const formattedPrice1 = this.formatUsdPrice(currentPrice);
      const formattedPrice2 = this.formatUsdPrice(oldPrice);
      const percentOff = this.calculatePercentOff(currentPrice, oldPrice, itemDetails?.off);
      const webhookPayload = {
        Company: "Amazon",
        Image: itemDetails?.image || "",
        Mtype: "Electronics and Technology",
        Name: itemDetails?.title || "",
        Off: typeof percentOff === "number" ? percentOff : percentOff || "",
        Price1: formattedPrice1,
        Price2: formattedPrice2,
        Subtype: "Televisions",
        Url: itemDetails?.url || amazonUrl,
        createdAt,
        id: asin,
      };

      console.log("[Post Deal] Webhook payload would be:");
      console.log(JSON.stringify(webhookPayload, null, 2));

      req.flash("success", "Deal prepared. Check server logs for the webhook payload.");
      return res.render("deal/views/post-deal", {
        page_name: "post-deal",
        page_title: "Post Deal",
        user: req.user,
        dealInfo: webhookPayload,
        errorMessage: null,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async renderAddDealPage(req, res) {
    const category = await CategoryRepository.getAllByField({
      parentId: { $eq: null },
      isDeleted: false,
    });
    const subCategory = await CategoryRepository.getAllByField({
      parentId: { $ne: null },
      isDeleted: false,
    });
    try {
      res.render("deal/views/add", {
        page_name: "deal-management",
        page_title: "Add Deal",
        user: req.user,
        category,
        subCategory,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method insert
   * @Description To Insert Deal Management Data To Collection
   */
  async insert(req, res) {
    try {
      console.log(req.body);
      console.log(req.files);
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }
      req.body.deal_title = req.body.deal_title.trim();
      req.body.deal_price = req.body.deal_price.trim();
      req.body.product_link = req.body.product_link.trim();
      req.body.description = req.body.description.trim();
      req.body["status"] = "Approved"

      let image = {};

      if (
        _.isEmpty(req.body.deal_title) ||
        _.isEmpty(req.body.deal_price) ||
        _.isEmpty(req.body.product_link) ||
        _.isEmpty(req.body.description)
      ) {
        req.flash("error", "Field Should Not Be Empty!");
        res.redirect(namedRouter.urlFor("admin.deal.listing"));
      } else {
        let isTitleExists = await DealRepo.getByField({
          deal_title: { $regex: req.body.deal_title.trim(), $options: "i" },
          isDeleted: false,
        });
        let isLinkExists = await DealRepo.getByField({
          product_link: { $regex: req.body.product_link.trim(), $options: "i" },
          isDeleted: false,
        });
        if (!_.isEmpty(isTitleExists)) {
          req.flash("error", "Deal Title Already Exists!");
          res.redirect(namedRouter.urlFor("deal.add"));
        } else if (!_.isEmpty(isLinkExists)) {
          req.flash("error", "Product Link Already Exists!");
          res.redirect(namedRouter.urlFor("deal.add"));
        } else {
          let saveData = await DealRepo.save(req.body);
          if (!_.isEmpty(saveData) && saveData._id) {
            if (!_.isEmpty(req.files)) {
              for (let obj of req.files) {
                (image["image"] = obj.filename),
                  (image["deal_id"] = saveData._id);
                console.log(image);

                await DealRepo.saveImage(image);
              }
            }
            req.flash("success", "Deal Added Successfully!");
            res.redirect(namedRouter.urlFor("admin.deal.listing"));
          } else {
            req.flash("error", "Deal Not Added Successfully!");
            res.redirect(namedRouter.urlFor("deal.add"));
          }
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  /**
   * @Method renderEditpage
   * @Description to render deal edit page
   */
  async renderEditpage(req, res) {
    try {
      const getData = await DealRepo.getByField({
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
      });
      const getImageData = await DealRepo.getAllByFieldImages({
        deal_id: new mongoose.Types.ObjectId(req.params.id),
      });
      const category = await CategoryRepository.getAllByField({
        parentId: { $eq: null },
        isDeleted: false,
      });
      const subCategory = await CategoryRepository.getAllByField({
        parentId: { $ne: null },
        isDeleted: false,
      });
      console.log(getData, "getDataaaaa");
      // console.log(category,"catetetet");
      // console.log(subCategory,"subbbbbbbbbb");

      res.render("deal/views/edit", {
        page_name: "deal-management",
        page_title: "Edit Deal",
        user: req.user,
        response: getData,
        responseimage: getImageData,
        category,
        subCategory,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findCategory(req, res) {
    try {
      let category_id = new mongoose.Types.ObjectId(req.params.id);
      const data = await CategoryRepository.getAllByField({
        parentId: category_id,
      });
      console.log("data: ", data);
      res.json(data);
    } catch (error) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method update
   * @Description To Update Data
   */
  async update(req, res) {
    try {

      console.log(req.body);

      req.body.deal_title = req.body.deal_title.trim();
      req.body.deal_price = req.body.deal_price.trim();
      req.body.product_link = req.body.product_link.trim();
      req.body.description = req.body.description.trim();
      // console.log(new mongoose.Types.ObjectId(req.body.id), "idddd");
      if (!_.has(req.body, "isFeature")) {
        req.body["isFeature"] = false
      }

      // console.log(req.body);
      // console.log(req.files);

      let image = {}


      if (_.isEmpty(req.body.deal_title) || _.isEmpty(req.body.deal_price) || _.isEmpty(req.body.product_link) || _.isEmpty(req.body.description)) {
        req.flash('error', 'Field Should Not Be Empty!');
        res.redirect(namedRouter.urlFor('admin.deal.listing'));
      } else {
        let isTitleExists = await DealRepo.getByField({ 'deal_title': req.body.deal_title, isDeleted: false, _id: { $ne: new mongoose.Types.ObjectId(req.body.id) } });

        let isLinkExists = await DealRepo.getByField({ 'product_link': req.body.product_link, isDeleted: false, _id: { $ne: new mongoose.Types.ObjectId(req.body.id) } });
        if (!_.isEmpty(isTitleExists)) {
          req.flash('error', 'Deal Title Already Exists!');
          res.redirect(namedRouter.urlFor('admin.deal.listing'));
        }
        else if (!_.isEmpty(isLinkExists)) {
          req.flash('error', 'Product Link Already Exists!');
          res.redirect(namedRouter.urlFor('admin.deal.listing'));
        }
        else {

          let updateData = await DealRepo.updateById(req.body, req.body.id);
          if (!_.isEmpty(updateData) && updateData._id) {
            if (!_.isEmpty(req.files)) {
              for (let obj of req.files) {
                image["image"] = obj.filename,
                  image["deal_id"] = updateData._id
                console.log(image);

                await DealRepo.saveImage(image)
              }
            }
            req.flash('success', 'Deal Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.deal.listing'));
          } else {
            req.flash('error', 'Deal Not Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.deal.listing'));
          }
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method statusChange
   * @Description To Change The Status
   */
  async statusChange(req, res) {
    try {
      // let data = await DealRepo.getById(req.params.status);
      // console.log(data.status);

      // if (!_.isEmpty(data)) {
      //   let dataStatus = data.status == "Approved" ? "Rejected" : "Approved";
      await DealRepo.updateById({ status: req.params.status }, req.params.id);
      let existDeal = await DealRepo.getById(req.params.id);
      console.log("existDeal: ", existDeal);
      let existDealImages = await DealRepo.getAllByFieldImages({ deal_id: req.params.id });

      let existUser = await userRepo.getById(existDeal.userId);

        let message =
        {
          token: existUser.device_token,
          notification:
          {
            image: `${existDealImages[0].image}`,
            title: `${existDeal.deal_title}`,
            body: `${existDeal.status}`
          }
        }
        let notification_save =
        {
          notification_image: message.notification.image,
          notification_title: message.notification.title,
          notification_message: message.notification.body,
          notification_description: "Here is Your Deal Status You Posted",
          reference_deal_id: existDeal._id,
          target_user_id: existUser._id
        }

        let savedNotifications = await notificationRepo.save(notification_save);
        if (savedNotifications && existUser?.notification == true) {
          await notification.pushNotification(message);
        }

      req.flash("success", "Status Has Been Changed Successfully");
      res.redirect(namedRouter.urlFor("admin.deal.listing"));
      // }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method delete
   * @Description Delete Data
   */
  async delete(req, res) {
    try {
      let dealData = await DealRepo.getById(req.params.id);
      let dealImageData = await DealRepo.getAllByFieldImages({
        deal_id: req.params.id,
      });
      if (!_.isEmpty(dealData)) {
        let deleteDeal = await DealRepo.updateById(
          { isDeleted: true },
          dealData._id
        );
        if (!_.isEmpty(deleteDeal) && deleteDeal._id) {
          if (!_.isEmpty(dealImageData)) {
            await DealRepo.bulkDeleteImages({ deal_id: req.params.id });
            if (!fs.existsSync("./public/uploads/DealImages")) {
              fs.mkdirSync("./public/uploads/DealImages");
            }
            for (let obj of dealImageData) {
              fs.unlinkSync(
                path.join("public", "uploads", "DealImages", `${obj.image}`)
              );
            }
          }
          req.flash("success", "Deal Deleted Successfully");
          res.redirect(namedRouter.urlFor("admin.deal.listing"));
        } else {
          req.flash("error", "Sorry Deal Not Deleted");
          res.redirect(namedRouter.urlFor("admin.deal.listing"));
        }
      } else {
        req.flash("error", "Sorry Deal not found");
        res.redirect(namedRouter.urlFor("admin.deal.listing"));
      }
    } catch (err) {
      throw err;
    }
  }

  async detail(req, res) {
    try {
      if (mongoose.isValidObjectId(req.params.id)) {
        let data = await DealRepo.getByIdCustom(req.params.id);
        res.render("deal/views/detail.ejs", {
          page_name: "deal-management",
          page_title: "Deal Details",
          data,
          user: req.user,
        });
      } else {
        req.flash("success", "Deal Data Not Found!");
        return res.redirect(namedRouter.urlFor("admin.deal.listing"));
      }
    } catch (e) {
      return { status: 500, data: [], message: e.message };
    }
  }

  /**
 * @Method getAll
 * @Description Get All Deal
 */
  async getAllApproevdDeals(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      let deal = await DealRepo.getAllApprovedDeals(req);
      // console.log(deal, 'dealllllll');

      let data = {
        recordsTotal: deal.total,
        recordsFiltered: deal.total,
        data: deal.docs,
      };
      return {
        status: 200,
        data: data,
        message: `Approved Deals Data fetched successfully.`,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

}

module.exports = new DealController();
