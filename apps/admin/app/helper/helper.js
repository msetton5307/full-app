
const userRepo = require('user/repositories/user.repository');
// const subscriptionRepo = require('../modules/subscription/repositories/subscription.repository');
const mongoose = require('mongoose');
const moment = require('moment');
const refreshTokenRepo = require("../modules/refreshToken/repositories/refresh.token.repository")
const jwt = require("jsonwebtoken")

class Helper {
	constructor() {
	}



	// async getSubscriptionInfo(user_id){
	// 	try{
	// 		let currentDateTime = moment().utc().format();
	// 		let query = {
	// 			"user_id": new mongoose.Types.ObjectId(user_id),
	// 			"current_period_start_date" : { $lte: new Date(currentDateTime) },
	// 			"current_period_end_date": { $gte: new Date(currentDateTime) },
	// 			"status" : "active"
	// 		}
	// 		let subscription = await subscriptionRepo.getSubscriptionDetails(query);
	// 		if(!_.isEmpty(subscription)){
	// 			return subscription[0];
	// 		}
	// 		else{
	// 			return null;
	// 		}
	// 	}
	// 	catch(e){
	// 		console.log(e.message);
	// 	}
	// }

	// async getReportPriceByDate(booking_info, booking_date){
	// 	let prices = [];


	// 	for(let k=0; k<booking_info.length; k++){
	// 		if(booking_info[k].service_price==0){
	// 			prices.push(0);
	// 		}else{
	// 			prices.push(booking_info[k].service_price);
	// 		}


	// 	}

	// 	return prices;
	// }

	async createRefreshToken(params) {
		try {
			let refresh_token = jwt.sign({
				params,
			}, process.env.REFRESH_TOKEN_SECRET, {
				expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
			});

			const expires = moment().add(process.env.REFRESH_TOKEN_EXPIRES_IN, 'days');

			let save_refresh_token = await refreshTokenRepo.save({ refresh_token, user_id: params.id, expiry_date: expires });

			if (!_.isEmpty(save_refresh_token) && save_refresh_token._id) {
				return refresh_token;
			} else {
				return false;
			}

		} catch (err) {
			console.log("Error on creating refresh token", err);
			return false;
		}
	}

	async updateRefreshToken(params, refresh_token_id) {
		try {
			let refresh_token = jwt.sign({
				params,
			}, process.env.REFRESH_TOKEN_SECRET, {
				expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
			});

			const expires = moment().add(process.env.REFRESH_TOKEN_EXPIRES_IN, 'days');

			let update_refresh_token = await refreshTokenRepo.updateById({ refresh_token, expiry_date: expires }, refresh_token_id);

			if (!_.isEmpty(update_refresh_token) && update_refresh_token._id) {
				return refresh_token;
			} else {
				return false;
			}

		} catch (err) {
			console.log("Error on creating refresh token", err);
			return false;
		}
	}

}
module.exports = new Helper();

