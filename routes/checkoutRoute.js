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
                quantity: 1
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
    /* const customer = {
        fName: req.body.fName,
        lName: req.body.lName,
        address: req.body.address,
        city: req.body.city,
        email: req.body.email
    } */
    const Order = await new OrderModel({
        customerId: req.body.userInfo._id,
        orderItems: req.body.userInfo.wishlist.map(i => ({ ...i }))
    }).save();
    //console.log(req.body.userInfo.wishlist)
    //console.log(Order)
    return res.redirect(ROUTE.order);
})

router.get(ROUTE.order, verifyToken, async (req, res) => {
    if (verifyToken) {
        const customer = await UserModel.findOne({
            _id: req.body.userInfo._id
        });
        const order = await OrderModel.findOne({
            customerId: req.body.userInfo._id
        }).populate('customerId', { _id: 1, email: 1, firstName: 1, lastName: 1, address: 1 });
        console.log(customer)

        customer.createOrder(order)

        res.redirect(ROUTE.toPayment);
    } else {
        res.redirect(url.format({
            pathname: ROUTE.error,
            query: {
                errmsg: 'Du måste logga in för att handla hos oss!'
            }
        }));
    }
})
router.get(ROUTE.toPayment, verifyToken, async (req, res) => {
    if (verifyToken) {
        const UserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
        console.log(UserInfo)
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: UserInfo.wishlist.map((product) => {
                return {
                    name: product.productId.album,
                    amount: product.productId.price * 100,
                    quantity: product.productId.quantity,
                    currency: 'sek'
                }
            }),
            success_url: ROUTE.confirmation,
            cancel_url: ROUTE.error
            /* success_url: req.protocol + "://" + req.get("Host") + ROUTE.confirmation,
            cancel_url: req.protocol + "://" + req.get("Host") + ROUTE.error */
        }).then((session) => {
            res.render(VIEW.toPayment, {
                sessionId: session.id,
                token: (req.cookies.jsonwebtoken !== undefined) ? true : false
            });
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

router.get(ROUTE.confirmation, verifyToken, async (req, res) => {

    //FIND ONE USER IN THE USER DB WITH _ID CORRESPONDING TO THE LOGGED IN USER _ID
    const showUserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
        .populate('orders.orderId')
    //FIND ONE ORDER WITH CUSTOMERID CORRESPONDING TO LOGGED IN USER
    const showOrderInfo = await OrderModel.findOne({ customerId: req.body.userInfo._id })
    //.populate('customerId')

    console.log(showOrderInfo)

    //console.log(req.body)
    res.render(VIEW.confirmation, {
        ROUTE,
        showUserInfo,
        showOrderInfo,
        token: (req.cookies.jsonwebtoken !== undefined) ? true : false
    })
})

module.exports = router;
