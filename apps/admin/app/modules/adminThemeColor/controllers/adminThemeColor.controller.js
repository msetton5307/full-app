const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const adminThemeColorRepo = require('adminThemeColor/repositories/adminThemeColor.repository');

class AdminThemeColor {
    constructor () {
        this.availAdminTheme();
    }

    /*  @Method: availAdminTheme
        @Description: admin theme color schema create/assign
    */
    async availAdminTheme () {
        try {
            let adminThemeAvail = await adminThemeColorRepo.getByField({isDeleted: false});
            if (adminThemeAvail) {
                adminThemeConfig = adminThemeAvail;
            } else {
                adminThemeColorRepo.save();
            }

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    /*  @Method: edit
        @Description: admin theme color schema edit view render
    */
    async edit (req, res) {
        try {
            let adminThemeAvail = await adminThemeColorRepo.getByField({isDeleted: false});
            res.render('adminThemeColor/views/edit.ejs', {
                page_name: 'adminThemeColor-management',
                page_title: 'Edit Theme Color',
                user: req.user,
                response: adminThemeAvail
            });
        } catch (e) {
            console.log(e);
            req.flash("error", e.message);
            res.redirect(namedRouter.urlFor('user.dashboard'));
        }
    };

    /*  @Method: update
        @Description: admin theme color schema update
    */
    async update (req, res) {
        try {
            // console.log(req.body);
            let adminThemeAvail = await adminThemeColorRepo.getByField({isDeleted: false});
            if (adminThemeAvail) {
                let update = await adminThemeColorRepo.updateById(req.body, adminThemeAvail._id);
                if (update && update._id) {
                    adminThemeConfig = update;
                    req.flash("success", "Admin Panel Theme Color Updated Successfully!");
                } else {
                    req.flash("error", "Something went wrong!");
                }
            } else {
                req.flash("error", "Something went wrong!");
            }

            res.redirect(namedRouter.urlFor("user.dashboard"));
        } catch (e) {
            console.log(e);
            req.flash("error", e.message);
            res.redirect(namedRouter.urlFor('user.dashboard'));
        }
    };
};

module.exports = new AdminThemeColor();