const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const bankRepo = require("../../modules/bank/repository/bank.repository")
const stripe = require("../../helper/stripe");
const _ = require("lodash");
const userRepository = require("../user/repositories/user.repository");
const transactionRepo = require("../transaction/repository/transaction.repository")
const settingsRepo = require("../settings/repositories/settings.repository")
const mongoose = require("mongoose");
const moment = require("moment");
const DealRepo = require("../deal/repositories/deal.repository");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class BankControllerApi {

    constructor() { }

    async addExpressAccount(req, res) {
        try {
            let express_Account = await stripe.accountCreateByExpress(req.user.email);
            console.log(express_Account, "exxxxxxx");

            if (!_.isEmpty(express_Account)) {
                await userRepository.updateById({ stripe_account_id: express_Account.stripeAccounts.id, isBankAccount: true }, req.user._id)
                return requestHandler.sendSuccess(res, 'Account created for Express Successfully')(express_Account);
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    // async paymentIntent(req, res) {
    //     try {
    //         console.log("hittttt");

    //         // let deal = await DealRepo.getByField({ _id: req.params.id });
    //         // let user = await userRepository.getByField({ _id: deal.userId });
    //         // // console.log(payment, "payyyyyyyyyyyy");
    //         // const adminCustomer = await stripe.customerDetails(req.user.stripe_account_id)
    //         // let payment = await stripe.createPaymentIntent(user.stripe_account_id, adminCustomer);
    //         // // console.log(adminCustomer, "payyyyyyyyyyyy");
    //         // if (!_.isEmpty(payment)) {
    //         //     await DealRepo.updateById({ isPaymentDone: true }, req.params.id)
    //         //     req.flash("success", "Money Sent Successfully!");
    //         //     res.redirect(namedRouter.urlFor("admin.payment.listing"));
    //         // } else {
    //         //     req.flash("error", "Deal Not Added Successfully!");
    //         //     res.redirect(namedRouter.urlFor("admin.payment.listing"));
    //         // }
    //         // // return requestHandler.sendSuccess(res, 'Payment created Successfully')(payment);
    //     }
    //     catch (err) {
    //         return requestHandler.sendError(req, res, err);
    //     }
    // }

    async retrieveBankDetails(req, res) {
        try {
            let retrieveStripe = await stripe.accountDetails(req.user.stripe_account_id);
            console.log(retrieveStripe.account, "Ssssssss");

            // let retrieveBankDetails = await bankRepo.getByField({ user_id: req.user._id });
            // if (_.isNull(retrieveBankDetails)) {
            //     return requestHandler.throwError(404, 'Bank Account does not exist in this Account')()
            // }
            // return requestHandler.sendSuccess(res, 'Bank Account Deatils retrieve Succesfully')(retrieveBankDetails);

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async webhook(req, res) {
        try {
            let stripeResponses = req.body;

            // console.log(user, "eeeeeee");

            switch (stripeResponses.type) {
                case "account.external_account.created":
                    {
                        let user = await userRepository.getByField({ "stripe_account_id": stripeResponses.account });
                        let account = stripeResponses.data.object;
                        // let accountId = account.account;
                        // let externalAccount = await stripe.retrieveExternalAccount(accountId);
                        if (!_.isNull(account)) {
                            await bankRepo.save(
                                {
                                    user_id: user._id,
                                    bank_name: account.bank_name,
                                    account_number: account.last4,
                                    bank_code: account.routing_number,
                                    stripe_account_id: stripeResponses.account
                                }
                            )
                        }
                        await userRepository.updateById({ isBankAccount: true }, user._id);
                        return requestHandler.sendSuccess(res, 'Account created for Express Successfully')(account);
                    }

                default:
                    return requestHandler.sendError(req, res, 'Unhandled Event');
            }
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async webhookAccount(req, res) {
        try {
            let stripeResponses = req.body;

            // console.log(user, "eeeeeee");

            switch (stripeResponses.type) {

                case "charge.succeeded":
                    {
                        let account = stripeResponses.data.object
                        let ref_user = await userRepository.getByField({ "stripe_account_id": account.destination });
                        if (!_.isEmpty(stripeResponses)) {
                            let transactions = await transactionRepo.save([
                                {
                                    user_id: "6745dca87d3e30936cf379ac",
                                    ref_user_id: ref_user._id,
                                    payment_intent_id: account.payment_intent,
                                    tansDate: moment.unix(account.created).toISOString(),
                                    trans_id: account.transfer,
                                    trans_status: account.status,
                                    user_amount: account.amount_captured,
                                    admin_amount: account.amount,
                                    stripe_customer_id: account.destination,
                                    stripe_charge_id: account.id,
                                    trans_mode: "Debit",
                                    last_card_four_digit: account.payment_method_details.card.last4,
                                    exp_month: account.payment_method_details.card.exp_month,
                                    exp_year: account.payment_method_details.card.exp_year
                                },
                                {
                                    user_id: ref_user._id,
                                    ref_user_id: "6745dca87d3e30936cf379ac",
                                    payment_intent_id: account.payment_intent,
                                    tansDate: moment.unix(account.created).toISOString(),
                                    trans_id: account.transfer,
                                    trans_status: account.status,
                                    user_amount: account.amount_captured,
                                    admin_amount: account.amount,
                                    stripe_customer_id: account.destination,
                                    stripe_charge_id: account.id,
                                    trans_mode: "Credit",
                                    last_card_four_digit: account.payment_method_details.card.last4,
                                    exp_month: account.payment_method_details.card.exp_month,
                                    exp_year: account.payment_method_details.card.exp_year
                                }
                            ])
                            return requestHandler.sendSuccess(res, 'Transaction saved Successfully')(transactions);
                        }
                    }
                default:
                    return requestHandler.sendError(req, res, 'Unhandled Event');
            }
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async transfer(req, res) {
        const transfer = await stripe.transferToStripeAccount(req.user.stripe_account_id);
        console.log(transfer, "transferrrrrrrr");
        const payout = await stripe.payoutToCustomer(req.user.stripe_account_id);
        console.log(payout, "payouttttttttt");


    }

}


module.exports = new BankControllerApi()