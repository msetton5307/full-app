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
class HomePageSelectedController {
  constructor() { }

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
   * @Method getAll
   * @Description Get All Deal
   */
  async getAll(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      let deal = await DealRepo.getAll(req);
      console.log("deal: ", deal);

      let data = {
        recordsTotal: deal.total,
        recordsFiltered: deal.total,
        data: deal.docs,
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

}

module.exports = new DealController();
