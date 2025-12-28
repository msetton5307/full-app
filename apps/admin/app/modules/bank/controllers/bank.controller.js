const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const userRepo = require("../../user/repositories/user.repository")
const _ = require("lodash")

class BankController{



}

module.exports=new BankController()