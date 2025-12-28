const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const mongoose = require('mongoose');

class UserInterface {
    async feather (req, res) {
        try {
            res.render('userInterface/views/feather.ejs', {
                page_name: 'userInterface-feather',
                page_title: 'Feather Icons',
                user: req.user,
            });
        } catch (error) {
            return res.status(500).send({ message: error.message });
        }
    };
};

module.exports = new UserInterface();