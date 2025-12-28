const settingsRepository = require("../modules/settings/repositories/settings.repository");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeWithPublishKey = require("stripe")(process.env.STRIPE_PUBLISHABLE_KEY)
// const helper = require('./helper.js');


class StripePayment {

    constructor() {

    }

    async customerCreate(params) {
        try {
            var customer = await stripe.customers.create({
                email: params.email,
                name: params.name,
                address: {
                    line1: (params.address ? params.address : ''),
                    country: 'US',
                }
            });
            return customer
        }
        catch (error) {
            return { "success": false, "message": e.message }
        }
    }

    async bankAccountCreate(params) {
        try {
            // Create a PaymentMethod for the bank account
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'us_bank_account', // Make sure to use the appropriate type (e.g., 'us_bank_account')
                us_bank_account: {
                    account_number: params.bank_account_number,
                    routing_number: params.bank_code,
                    account_holder_type: "individual"
                },
                billing_details: {
                    name: params.bank_holder_name,
                    address: {
                        line1: "NA",
                        city: "NA",
                        state: "NA",
                        postal_code: "NA",
                        country: "US"
                    }
                },
            });

            // Attach the payment method to the customer
            // const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, {
            //     customer: customerId,
            // });

            return paymentMethod
        } catch (err) {
            return { "success": false, "message": err.message }
        }
    }

    async attachPaymentMethodToCustomer(paymentId, customerId) {

        try {
            const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentId, {
                customer: customerId,
            });
            return attachedPaymentMethod
        }
        catch (err) {
            return { "success": false, "message": err.message }
        }
    }


    async createPaymentIntent(params, admin) {
        try {

            const settings = await settingsRepository.getByField({ isDeleted: false })
            const paymentIntent = await stripe.paymentIntents.create({
                amount: (settings.amountToPayCustomer) * 100,
                currency: 'usd',
                customer: admin.account.id,
                payment_method: admin.account.invoice_settings.default_payment_method,
                confirm: true,
                automatic_payment_methods: {
                    'enabled': true,
                    'allow_redirects': 'never'
                },
                transfer_data: {
                    destination: params
                }
            });
            if (_.isObject(paymentIntent) && paymentIntent.id) {
                return { "success": true, data: paymentIntent, "message": "paymentIntent has been created successfully" }
            } else {
                console.log(paymentIntent);
                return { "success": false, "message": "paymentIntent not create" }
            }


        } catch (error) {
            console.log("stripe payment intent error: ", error.message);
            return { "success": false, "message": error.message }
        }

    }


    async accountCreateByExpress(param) {
        try {

            // 	let stripeTokens = await stripe.tokens.create({
            // 	bank_account: {
            // 		country: param.country,
            // 		currency: param.currency,
            // 		account_holder_name: param.account_holder_name,
            // 		account_holder_type: 'individual',
            // 		routing_number: param.routing_number,
            // 		account_number: param.account_number,
            // 	},
            // });

            let stripeAccounts = await stripe.accounts.create({
                country: "US",
                type: "express",
                email: param.email,
                capabilities: {
                    transfers: { requested: true },
                    card_payments: { requested: true },
                },
                business_type: 'individual',
                // external_account: stripeTokens.id,
            });


            const accountLink = await stripe.accountLinks.create({
                account: stripeAccounts.id,
                refresh_url: process.env.FRONTEND_URL + "/bank-add-success",
                return_url: process.env.FRONTEND_URL + "/bank-add-success",
                type: 'account_onboarding',
            });
            return { "success": true, accountLink: accountLink, stripeAccounts: stripeAccounts };


        }
        catch (e) {
            console.log("stripe charge error: ", e.message)
            return { "success": false, "message": e.message }
        }
    }

    async accountCreateByExpressUpdate(param) {
        try {

            // console.log(param);
            const accountLink = await stripe.accountLinks.create({
                account: param.id,
                refresh_url: process.env.FRONTEND_URL + "/service-provider/dashboard/profile/",
                return_url: process.env.FRONTEND_URL + "/service-provider/dashboard/profile/",
                type: 'account_onboarding',
            });
            return { "success": true, accountLink: accountLink };

        }
        catch (e) {
            console.log("stripe charge error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }


    async accountDetails(param) {
        try {

            // console.log(param);

            const account = await stripe.accounts.retrieve(param);
            return { "success": true, account: account };

        }
        catch (e) {
            console.log("stripe charge error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async customerDetails(param) {
        try {

            console.log(param);

            const account = await stripe.customers.retrieve(param);
            return { "success": true, account: account };

        }
        catch (e) {
            console.log("stripe charge error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async addPlans(params) {
        try {

            const product = await stripe.products.create({
                name: params.plan_name,
            });
            if (_.isObject(product) && product.id) {
                const plan = await stripe.plans.create({
                    amount: params.plan_ammount * 100,
                    currency: 'usd',
                    interval: params.plan_type,
                    product: product.id,
                });
                if (_.isObject(plan) && plan.id) {
                    return { "success": true, data: plan, "message": "plan created successfully" }
                } else {
                    console.log(plan);
                    return { "success": false, "message": "plan not create" }
                }
            } else {
                console.log(product);
                return { "success": false, "message": "product not create" }
            }


        } catch (e) {
            console.log("stripe payment intent error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async addProductAndPlanPrice(params) {
        try {

            const product = await stripe.products.create({
                name: params.plan_name,
            });
            if (_.isObject(product) && product.id) {
                const price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: params.plan_ammount * 100,
                    currency: 'usd',
                    recurring: {
                        interval: params.plan_type,
                    },
                });
                if (_.isObject(price) && price.id) {
                    return { "success": true, data: price, "message": "price created successfully" }
                } else {
                    console.log(price);
                    return { "success": false, "message": "price not create" }
                }
            } else {
                console.log(product);
                return { "success": false, "message": "product not create" }
            }


        } catch (e) {
            console.log("stripe payment intent error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }


    async upadateProduct(params) {
        try {

            const product = await stripe.products.update(
                params.stripe_product_id,
                {
                    name: params.name
                }
            );

            if (_.isObject(product) && product.id) {
                return { "success": true, data: product, "message": "Product Upadte successfully" }
            } else {
                console.log(product);
                return { "success": false, "message": "product not create" }
            }

        } catch (e) {
            console.log("stripe payment intent error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async upadatePriceAndPlan(params) {
        try {

            console.log(params);
            const plan = await stripe.prices.update(
                params.stripe_price_id,
                {
                    unit_amount: params.unit_amount * 100,
                    recurring: {
                        interval: params.interval
                    },
                },
            );


            if (_.isObject(plan) && plan.id) {
                return { "success": true, data: plan, "message": "Plan Upadte successfully" }
            } else {
                console.log(plan);
                return { "success": false, "message": "Plan not create" }
            }

        } catch (e) {
            console.log("stripe payment intent error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async createCustomer(params) {
        try {

            let stripeCustomer = await stripe.customers.create({
                email: params.email,
                name: params.fullName,
                description: 'Customer Created for SySaving'
            });

            if (_.isObject(stripeCustomer) && stripeCustomer.id) {
                return { "success": true, data: stripeCustomer, "message": "stripe customer create successfully" }
            } else {
                console.log(stripeCustomer);
                return { "success": false, "message": "stripe customer not create" }
            }
        } catch (e) {
            console.log("stripe payment intent error: ", e.message);
            return { "success": false, "message": e.message }
        }
    }

    async directCardPayment(params) {
        try {

            let stripeTokens = await stripeWithPublishKey.tokens.create({
                card: {
                    number: params.card_number,
                    exp_month: params.exp_month,
                    exp_year: params.exp_year,
                    cvc: params.cvc
                },
            });


            let stripeCustomer = await stripe.customers.create({
                email: params.email,
                name: params.name,
                description: 'Customer Created for Moby Car24',
                source: stripeTokens.id
            });

            // console.log(stripeCustomer, "stripeCustomer");
            // let stripeCharge = await stripe.charges.create({
            // 	amount: params.paymentAmount,
            // 	currency: params.customerCurrencyCode,
            // 	customer: stripeCustomer.id,
            // });

            let subscriptionCreate = await stripe.subscriptions.create({
                customer: stripeCustomer.id,
                items: [
                    {
                        price: params.price_id
                    },
                ],
            });

            // console.log(subscriptionCreate);

            // console.log(stripeCharge, "stripeCharge");
            // if (!_.isEmpty(stripeCharge) && _.has(stripeCharge, 'captured') && stripeCharge.captured == true && stripeCharge.paid == true) {
            // 	return { "success": true, "stripeCharge": stripeCharge, 'stripeChargeId': stripeCharge.id, "balanceTransaction": stripeCharge.balance_transaction }
            // }

            if (!_.isEmpty(subscriptionCreate) && subscriptionCreate.id) {
                return { "success": true, "data": subscriptionCreate, }
            }
            else {
                return { "success": false, "message": "Unable to process the payment at this moment" }
            }

        } catch (e) {
            // console.log(e);
            console.log("stripe add payment  error: ", e.message);
            requestHandler.throwError(400, 'Bad Request', 'Card is not saved, somethng went wrong!')(e);
            // await helper.storeError({ "api_url": "stripe.addPaymentMethod", "error_msg": err.message })
            return { "success": false, "message": e.message }
        }
    }

    async getStripeAccountTransferStatus(stripe_account_id) {
        try {
            const account = await stripe.accounts.retrieve(stripe_account_id);

            // console.log("account",account);
            if (!_.isEmpty(account) && !_.isUndefined(account) && !_.isNull(account)) {
                if (_.has(account, 'capabilities') && _.isObject(account.capabilities) && _.has(account.capabilities, 'transfers') && _.has(account.capabilities, 'card_payments')) {
                    return {
                        "transfers": account.capabilities.transfers,
                        "card_payments": account.capabilities.card_payments
                    };
                }
                else {
                    return {
                        "transfers": "inactive",
                        "card_payments": "inactive",
                    };
                }

            }
            else {
                return {
                    "transfers": "inactive",
                    "card_payments": "inactive",
                };
            }
        }
        catch (e) {
            console.log("getStripeAccountTransferStatus error: (" + stripe_account_id + ")", e.message);
            return null;
        }
    }



    async newCreatePaymentIntent(param) {
        try {

            const paymentIntent = await stripe.paymentIntents.create({
                amount: param.paymentAmount,
                currency: param.customerCurrencyCode,
                metadata: param.metadata,
                payment_method_types: ['card'],
            });



            // console.log(paymentIntent);

            if (!_.isEmpty(paymentIntent) && _.has(paymentIntent, 'object') && paymentIntent.object == "payment_intent") {
                return { "success": true, 'paymentIntent': paymentIntent }
            }
            else {
                return { "success": false, "paymentIntent": {}, "message": "Unable to process the payment at this moment" }
            }
        }
        catch (e) {
            return { "success": false, "paymentIntent": {}, "message": e.message }
        }
    }



    async transferToStripeAccount(params) {
        try {

            // console.log(params, "paramsparamsparams?>>");

            const transfer = await stripe.transfers.create({
                amount: 500,
                currency: 'usd',
                // source_transaction: params.charge_id,
                destination: params
            });
            // console.log(transfer, "transfer>>>>>>>>>>>>>>>>>>");
            if (transfer && transfer.id) {
                return { success: true, data: transfer };
            } else {
                return { success: false, data: transfer.message };
            }
            // return transfer;
        }
        catch (e) {
            console.log("transferToStripeAccount err: ", e);
            return {};
        }
    }

    async payoutToCustomer(params) {
        try {
            const payout = await stripe.payouts.create({
                amount: 500,
                currency: 'usd',
            },
                {
                    stripeAccount: params
                });
            return payout;
        }
        catch (e) {
            return { "success": false, "message": e.message }
        }
    }

    async retrieveExternalAccount(params) {
        try {
            const externalAccounts = await stripe.accounts.listExternalAccounts(params.account.id, {
                object: 'bank_account',
            });
            return externalAccounts;
        }
        catch (e) {
            return { "success": false, "message": e.message }
        }
    }

    async createCharge(params, metadata, amount) {
        try {

            const charge = await stripe.charges.create({
                amount: amount * 100,
                currency: 'usd',
                source: 'tok_visa',
                metadata: metadata,
                transfer_data: {
                    destination: params, // The connected account ID
                }
            });
            if (charge) {
                return { "success": true, data: charge, "message": "Charge has been created successfully" }
            } else {
                console.log(charge);
                return { "success": false, "message": "charge not create" }
            }


        } catch (error) {
            console.log("stripe payment intent error: ", error.message);
            return { "success": false, "message": error.message }
        }

    }


}
module.exports = new StripePayment();
