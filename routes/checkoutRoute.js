const express = require('express');
const router = express.Router();
const { ROUTE, VIEW } = require('../constant');
const UserModel = require("../model/user")
const OrderModel = require("../model/order")
const verifyToken = require("./verifyToken")

router.get(ROUTE.checkout, verifyToken, async (req, res) => {
    if (verifyToken) {
        const showUserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
            .populate('wishlist.productId', {
                artist: 1,
                album: 1,
                price: 1
            })
        res.status(202).render(VIEW.checkout, { ROUTE, showUserInfo, token: (req.cookies.jsonwebtoken !== undefined) ? true : false })
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
        orderEmail: req.body.email
    }).save();

    res.redirect(ROUTE.confirmation);
})

router.get(ROUTE.confirmation, verifyToken, async (req, res) => {

    //FIND ONE ORDER WITH ORDEREMAIL CORRESPONDING TO LOGGED IN USER EMAIL
    const showOrderInfo = await OrderModel.findOne({ orderEmail: req.body.userInfo.email })
        .populate('user');


    const showUserInfo = await UserModel.findOne({ _id: req.body.userInfo._id })
        .populate('orders.orderId')
    showUserInfo.createOrder(showOrderInfo)
    //showOrderInfo.createOrderCustomer(showUserInfo)
    console.log(showOrderInfo)
    //console.log(showUserInfo)
    res.render(VIEW.confirmation, {
        ROUTE,
        showUserInfo,
        showOrderInfo,
        token: (req.cookies.jsonwebtoken !== undefined) ? true : false
    })
})

module.exports = router;
