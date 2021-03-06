const express = require('express');
const router = express.Router();
const { ROUTE, VIEW } = require('../constant');
const UserModel = require("../model/user")
const OrderModel = require("../model/order")
const verifyToken = require("./verifyToken")
const config = require('../config/config');
const stripe = require("stripe")(config.stripe.stripeKey)

router.get(ROUTE.checkout, verifyToken, async (req, res) => {
    if (verifyToken) {
        const showUserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
            .populate('wishlist.productId', {
                artist: 1,
                album: 1,
                price: 1,
            })

        return res.status(202).render(VIEW.checkout, {
            ROUTE, showUserInfo,
            token: (req.cookies.jsonwebtoken !== undefined) ? true : false
        })
    } else {
        return res.status(202).render(VIEW.checkout, {
            ROUTE,
            showUserInfo: "empty cart",
            token: (req.cookies.jsonwebtoken !== undefined) ? true : false
        })
    }
})

router.post(ROUTE.checkout, verifyToken, async (req, res) => {

    const Order = await new OrderModel({
        customerId: req.body.userInfo._id,
        orderItems: Array.from(req.body.userInfo.wishlist)
        //orderItems: req.body.userInfo.wishlist.map(i => ({ productId: i.productId }))
    }).save();

    res.cookie('order', Order._id)
    console.log(req.body.userInfo.wishlist)
    console.log(Order)

    const customer = await UserModel.findOne({ _id: req.body.userInfo._id })
    customer.createOrder(Order)

    res.redirect(ROUTE.confirmation);
})

router.get(ROUTE.confirmation, verifyToken, async (req, res) => {

    const showUserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
        .populate('orders.orderId').populate("wishlist.productId")

    const showOrderInfo = await OrderModel.findOne({ _id: req.cookies.order })

    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: showUserInfo.wishlist.map((product) => {
            return {
                name: product.productId.album,
                amount: product.productId.price * 100,
                quantity: 1,
                currency: 'sek'
            }
        }),
        customer_email: showUserInfo.email,
        success_url: req.protocol + "://" + req.get("Host") + ROUTE.paymentConf,
        cancel_url: req.protocol + "://" + req.get("Host") + ROUTE.error
    }).then((session) => {
        res.render(VIEW.confirmation, {
            sessionId: session.id,
            showUserInfo,
            showOrderInfo,
            token: (req.cookies.jsonwebtoken !== undefined) ? true : false
        });
    })
})

router.get(ROUTE.paymentConf, verifyToken, async (req, res) => {
    if (verifyToken) {
        const customer = await UserModel.findOne({
            _id: req.body.userInfo._id
        }).updateOne({ wishlist: [] })
        const order = await OrderModel.findOne({
            _id: req.cookies.order
        }).populate('customerId', { _id: 1, email: 1, firstName: 1, lastName: 1, address: 1 });

        return res.render(VIEW.paymentConf, {
            ROUTE,
            customer,
            order,
            token: (req.cookies.jsonwebtoken !== undefined) ? true : false
        })
    } else {
        res.redirect(url.format({
            pathname: ROUTE.error,
            query: {
                errmsg: 'Du måste logga in för att handla hos oss!'
            }
        }));
    }
})

module.exports = router;
