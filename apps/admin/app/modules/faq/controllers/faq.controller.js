const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const querystring = require('querystring');
const fs = require('fs');
const FAQRepo = require('faq/repositories/faq.repository');
const mongoose = require('mongoose');
class FaqManagementController {
  constructor() { }

  /**
   * @Method list
   * @Description To Show The FAQ Listing Page
  */
  async list(req, res) {
    try {
      let status = '';
      if (req.query.status) {
        status = req.query.status;
      }

      let data = await FAQRepo.getStats(req);
      res.render('faq/views/list', {
        page_name: 'faq-management',
        page_title: 'FAQ List',
        user: req.user,
        status,
        data
      })
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method getAll
   * @Description Get All FAQ
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
      let faq = await FAQRepo.getAll(req);
      let data = {
        "recordsTotal": faq.total,
        "recordsFiltered": faq.total,
        "data": faq.docs
      };
      return {
        status: 200,
        data: data,
        message: `Data fetched successfully.`
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  /** 
  * @Method renderAddFaqPage 
  * @Description to render add FAQ page 
  */

  async renderAddFaqPage(req, res) {
    try {
      res.render('faq/views/add', {
        page_name: 'faq-management',
        page_title: 'Add FAQ',
        user: req.user,
      })

    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method insert
   * @Description To Insert FAQ Management Data To Collection
  */
  async insert(req, res) {
    try {
      let status = '';
      if (req.query.status) {
        status = req.query.status;
      }
      req.body.question = req.body.question.trim();
      req.body.answer = req.body.answer.trim();

      if (_.isEmpty(req.body.question) || _.isEmpty(req.body.answer)) {
        req.flash('error', 'Field Should Not Be Empty!');
        res.redirect(namedRouter.urlFor('admin.faq.listing'));
      } else {
        let isQuestionExists = await FAQRepo.getByField({ 'question': { $regex: req.body.question.trim(), $options: "i" }, isDeleted: false });
        if (!_.isEmpty(isQuestionExists)) {
          req.flash('error', 'FAQ Question Already Exists!');
          res.redirect(namedRouter.urlFor('admin.faq.listing'));
        } else {
          let saveData = await FAQRepo.save(req.body);
          if (!_.isEmpty(saveData) && saveData._id) {
            req.flash('success', 'FAQ Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.faq.listing'));
          } else {
            req.flash('error', 'FAQ Not Added Successfully!');
            res.redirect(namedRouter.urlFor('admin.faq.listing'));
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
   * @Description to render faq edit page 
   */
  async renderEditpage(req, res) {
    try {
      const getData = await FAQRepo.getByField({ _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false });
      res.render('faq/views/edit', {
        page_name: 'faq-management',
        page_title: 'Edit FAQ',
        user: req.user,
        response: getData
      })
    } catch (err) {
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
      req.body.question = req.body.question.trim();
      req.body.answer = req.body.answer.trim();
      if (_.isEmpty(req.body.question) || _.isEmpty(req.body.answer)) {
        req.flash('error', 'Field Should Not Be Empty!');
        res.redirect(namedRouter.urlFor('admin.faq.listing'));
      } else {
        const faqId = new mongoose.Types.ObjectId(req.body.id);
        let isQuestionExists = await FAQRepo.getByField({ 'question': { $regex: req.body.question.trim(), $options: "i" }, _id: { $ne: faqId }, isDeleted: false });
        if (!_.isEmpty(isQuestionExists)) {
          req.flash('error', 'Question Already Exists!');
          res.redirect(namedRouter.urlFor('admin.faq.listing', { id: faqId }));
        } else {
          let faqManagementDataUpdate = await FAQRepo.updateById(req.body, faqId)
          if (!_.isEmpty(faqManagementDataUpdate) && faqManagementDataUpdate._id) {
            req.flash('success', "FAQ Updated Successfully");
            res.redirect(namedRouter.urlFor('admin.faq.listing'));
          } else {
            req.flash('error', "FAQ Failed To Update!");
            res.redirect(namedRouter.urlFor('admin.faq.listing'));
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
      let data = await FAQRepo.getById(req.params.id);
      if (!_.isEmpty(data)) {
        let dataStatus = data.status == "Active" ? "Inactive" : "Active";
        await FAQRepo.updateById({ status: dataStatus }, req.params.id);

        req.flash("success", "Status Has Been Changed Successfully");
        res.redirect(namedRouter.urlFor("admin.faq.listing"));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  /**
   * @Method delete
   * @Description Delete Data
  */
  async delete(req, res) {
    try {
      let faqData = await FAQRepo.getById(req.params.id);
      if (!_.isEmpty(faqData)) {
        let deleteFAQ = await FAQRepo.updateById({ "isDeleted": true }, faqData._id)
        if (!_.isEmpty(deleteFAQ) && deleteFAQ._id) {
          req.flash('success', 'FAQ Deleted Successfully');
          res.redirect(namedRouter.urlFor('admin.faq.listing'));
        } else {
          req.flash('error', "Sorry FAQ Not Deleted");
          res.redirect(namedRouter.urlFor('admin.faq.listing'));
        }
      } else {
        req.flash('error', "Sorry FAQ not found");
        res.redirect(namedRouter.urlFor('admin.faq.listing'));
      }
    } catch (err) {
      throw err;
    }
  };

  async detail(req, res) {
    try {
      if (mongoose.isValidObjectId(req.params.id)) {
        let data = await FAQRepo.getByIdCustom(req.params.id);
        res.render('faq/views/detail.ejs', {
          page_name: 'faq-management',
          page_title: 'FAQ Details',
          data,
          user: req.user,
        });
      } else {
        req.flash('success', "FAQ Data Not Found!");
        return res.redirect(namedRouter.urlFor('admin.faq.listing'));
      }
    } catch (e) {
      return { status: 500, data: [], message: e.message };
    }
  }
}

module.exports = new FaqManagementController();