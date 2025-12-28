const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const keywordRepo = require("../repositories/keywords.repository");
const mongoose = require("mongoose");
const CategoryRepository = require("../../category/repositories/category.repository");
class KeywordController {
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

      let data = await keywordRepo.getStats(req);
      res.render("keywords/views/list", {
        page_name: "keyword-management",
        page_title: "Keyword List",
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
      let deal = await keywordRepo.getAll(req);
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

  /**
   * @Method renderAddFaqPage
   * @Description to render add Deal page
   */

  async renderAddKeywordPage(req, res) {
    const category = await CategoryRepository.getAllByField({
      parentId: { $eq: null },
      isDeleted: false,
    });
    // const subCategory = await CategoryRepository.getAllByField({
    //   parentId: { $ne: null },
    //   isDeleted: false,
    // });
    try {
      res.render("keywords/views/add", {
        page_name: "keyword-management",
        page_title: "Add Keyword",
        user: req.user,
        category:category
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
      // console.log(req.body);
      // console.log(req.files);
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }
      console.log(req.body);
      
      req.body.keyword = req.body.keyword.trim();

      if (
        _.isEmpty(req.body.keyword) ||
        _.isEmpty(req.body.category_id)
      ) {
        req.flash("error", "Field Should Not Be Empty!");
        res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      } else {
        let isKeywordExists = await keywordRepo.getByField({
          keyword: req.body.keyword,
          category_id:req.body.category_id,
          isDeleted: false,
        });
        if (!_.isEmpty(isKeywordExists)) {
          req.flash("error", "Keyword Already Exists!");
          res.redirect(namedRouter.urlFor("keyword.add"));
        } else {
          let saveData = await keywordRepo.save(req.body);
          if (!_.isEmpty(saveData) && saveData._id) {
            req.flash("success", "Keyword Added Successfully!");
            res.redirect(namedRouter.urlFor("admin.keyword.listing"));
          } else {
            req.flash("error", "Keyword Not Added Successfully!");
            res.redirect(namedRouter.urlFor("keyword.add"));
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
      if (!mongoose.isValidObjectId(req.params.id)) {
        req.flash("error", "Invalid keyword identifier provided");
        return res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      }

      const getData = await keywordRepo.getByField({
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
      });

      if (_.isEmpty(getData)) {
        req.flash("error", "Keyword not found");
        return res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      }

      const category = await CategoryRepository.getAllByField({
        parentId: { $eq: null },
        isDeleted: false,
      });

      console.log(getData,"getDataaaaa");
      // console.log(category,"catetetet");
      // console.log(subCategory,"subbbbbbbbbb");

      res.render("keywords/views/edit", {
        page_name: "keyword-management",
        page_title: "Edit Deal",
        user: req.user,
        response: getData,
        category,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

//   async findKeyword(req, res) {
//     try {
//       let category_id = new mongoose.Types.ObjectId(req.params.id);
//       const data = await CategoryRepository.getAllByField({
//         parentId: category_id,
//       });
//       console.log("data: ", data);
//       res.json(data);
//     } catch (error) {
//       console.log(err);
//       throw err;
//     }
//   }

  /**
   * @Method update
   * @Description To Update Data
   */
  async update(req, res) {
    try {

      req.body.keyword = req.body.keyword.trim();
      req.body.category_id = req.body.category_id.trim();

      // console.log(req.body);
      // console.log(req.files);


      if (_.isEmpty(req.body.keyword) || _.isEmpty(req.body.category_id)) {
        req.flash('error', 'Field Should Not Be Empty!');
        res.redirect(namedRouter.urlFor('admin.keyword.listing'));
      } else {
        let isKeywordExists = await keywordRepo.getByField({ 'keyword': req.body.keyword, categoryId:req.body.category_id, isDeleted: false });
        if (!_.isEmpty(isKeywordExists)) {
          req.flash('error', 'Keyword Already Exists in Same Category');
          res.redirect(namedRouter.urlFor('admin.keyword.listing'));
        }
        else {

          let updateData = await keywordRepo.updateById(req.body, req.body.id);
          if (!_.isEmpty(updateData) && updateData._id) {
            req.flash('success', 'Keyword Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.keyword.listing'));
          } else {
            req.flash('error', 'Keyword Not Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.keyword.listing'));
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
      let data = await keywordRepo.getById(req.params.id);
      if (!_.isEmpty(data)) {
        let dataStatus = data.status == "Active" ? "Inactive" : "Active";
        await keywordRepo.updateById({ status: dataStatus }, req.params.id);

        req.flash("success", "Status Has Been Changed Successfully");
        res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      }
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
      let dealData = await keywordRepo.getById(req.params.id);

      if (!_.isEmpty(dealData)) {
        let deleteDeal = await keywordRepo.updateById(
          { isDeleted: true },
          dealData._id
        );
        if (!_.isEmpty(deleteDeal) && deleteDeal._id) {
          req.flash("success", "Keyword Deleted Successfully");
          res.redirect(namedRouter.urlFor("admin.keyword.listing"));
        } else {
          req.flash("error", "Sorry Deal Not Deleted");
          res.redirect(namedRouter.urlFor("admin.keyword.listing"));
        }
      } else {
        req.flash("error", "Sorry Deal not found");
        res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      }
    } catch (err) {
      throw err;
    }
  }

  async detail(req, res) {
    try {
      if (mongoose.isValidObjectId(req.params.id)) {
        let data = await keywordRepo.getByIdCustom(req.params.id);
        res.render("keywords/views/detail.ejs", {
          page_name: "keyword-management",
          page_title: "Keyword Details",
          data,
          user: req.user,
        });
      } else {
        req.flash("success", "Keyword Data Not Found!");
        return res.redirect(namedRouter.urlFor("admin.keyword.listing"));
      }
    } catch (e) {
      return { status: 500, data: [], message: e.message };
    }
  }
}

module.exports = new KeywordController();
