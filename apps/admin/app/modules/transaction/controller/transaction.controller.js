const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const transactionRepo=require("../repository/transaction.repository")
const _ = require("lodash")

class TransactionController {
    constructor() { }

    async list(req, res) {
        try {
            let status = "";
            if (req.query.status) {
                status = req.query.status;
            }

            let data = await transactionRepo.getStats(req);
            res.render("transaction/views/list", {
                page_name: "transaction-management",
                page_title: "Transaction List",
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
          let deal = await transactionRepo.getAllTranasctions(req);
          // console.log(deal, 'dealllllll');
    
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

module.exports= new TransactionController();