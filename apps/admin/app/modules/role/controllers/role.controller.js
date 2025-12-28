const roleRepo = require('role/repositories/role.repository');
const userRepo = require('user/repositories/user.repository');
const fs = require('fs');
const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const slug = require('slug');

class roleController {
    constructor() { }

    /* @Method: list
    // @Description: To get all the promocodes from DB
    */
    async list(req, res) {
        try {
            res.render('role/views/list.ejs', {
                page_name: 'role-management',
                page_title: 'Roles List',
                user: req.user
            });
        } catch (e) {
            return res.status(500).send({ message: e.message });
        }
    };

    /* @Method: getAll
   // @Description: To get all the promocodes from DB, this will called from list
   */
    async getAll(req, res) {
        try {
            let keyword = req.body.query ? req.body.query.generalSearch : '';
            let role = await roleRepo.getAll({ keyword }, req.body.pagination.page || 1);
            if (_.has(req.body, 'sort')) {
                var sortOrder = req.body.sort.sort;
                var sortField = req.body.sort.field;
            } else {
                var sortOrder = -1;
                var sortField = 'roleDisplayName';
            }
            let meta = { "page": req.body.pagination.page, "pages": role.pages, "perpage": req.body.pagination.perpage, "total": role.total, "sort": sortOrder, "field": sortField };
            return { status: 200, meta: meta, data: role.docs, message: `Data fetched succesfully.` };
        } catch (e) {

            return { status: 500, data: [], message: e.message };
        }
    }

    /* @Method: create
    // @Description: To get all the promocodes from DB
    */
    async create(req, res) {
        try {
            res.render('role/views/add.ejs', {
                page_name: 'role-management',
                page_title: 'Create Role',
                user: req.user
            });
        } catch (e) {
            return res.status(500).send({ message: e.message });
        }
    };

    /* @Method: store
    // @Description: To create role
    */
    async store(req, res) {
        try {
            req.body.rolegroup = 'backend';
            const role_exist = await roleRepo.getByField({ 'roleDisplayName': { '$regex': req.body.roleDisplayName, '$options': 'i' } });
            if (_.isEmpty(role_exist)) {
                req.body.role = slug(req.body.roleDisplayName, { lower: true, replacement: '_' });
                let save = await roleRepo.save(req.body);
                req.flash('success', "Role added successfully.");
                res.redirect(namedRouter.urlFor("role.list"));
            } else {
                req.flash("error", "Role already exists with same name");
                res.redirect(namedRouter.urlFor("role.create"));
            }
        } catch (e) {
            return { status: 500, data: [], message: e.message };
        }
    };

    /* @Method: edit
    // @Description: To edit role
    */
    async edit(req, res) {
        try {
            let role = await roleRepo.getById(req.params.id);
            res.render('role/views/edit.ejs', {
                page_name: 'role-management',
                page_title: 'Edit Role',
                user: req.user,
                response: role
            });
        } catch (e) {
            return res.status(500).send({ message: e.message });
        }
    };

    /* @Method: update
    // @Description: To update role
    */
    async update(req, res) {
        try {
            let role_exist = await roleRepo.getByField({ roleDisplayName: req.body.roleDisplayName, _id: { $ne: req.body.roleId } });
            if (_.isEmpty(role_exist)) {
                let findRole = await roleRepo.getById(req.body.roleId);
                if (!_.isEmpty(findRole)) {
                    let save = await roleRepo.updateById(req.body, req.body.roleId);
                    req.flash('success', "Role updated successfully.");
                    res.redirect(namedRouter.urlFor('role.list'));
                } else {
                    req.flash('error', "Role not found.");
                    res.redirect(namedRouter.urlFor('role.list'));
                }
            } else {
                req.flash("error", "Role already exists with same name");
                res.redirect(namedRouter.urlFor("role.list"));
            }
        } catch (e) {
            return { status: 500, data: [], message: e.message };
        }
    };

    /* @Method: delete
    // @Description: To delete role
    */
    async delete(req, res) {
        try {
            let role_exist = await roleRepo.getById(req.params.id);
            if (!_.isEmpty(role_exist)) {
                let roleDelete = await roleRepo.delete(role_exist._id);
                if (roleDelete) {
                    await userRepo.bulkDelete({ role: role_exist._id });
                    req.flash('success', 'Role Deleted Successfully');
                    res.redirect(namedRouter.urlFor('role.list'));
                } else {
                    req.flash("error", "Something went wrong!");
                    res.redirect(namedRouter.urlFor("role.list"));
                }
            } else {
                req.flash("error", "Role not found!");
                res.redirect(namedRouter.urlFor("role.list"));
            }
        } catch (e) {
            return { status: 500, data: [], message: e.message };
        }
    };

}

module.exports = new roleController();