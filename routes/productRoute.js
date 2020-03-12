const express = require('express');
const router = express.Router();
const Product = require('../model/product');
const constant = require('../constant');
const url = require('url');

router.get(constant.ROUTE.index, (req, res) => {
    res.render(constant.VIEW.index, {});
})

router.get(constant.ROUTE.gallery, async (req, res) => {
    if (req.query.page === undefined) {
        res.redirect(url.format({
            pathname: constant.ROUTE.gallery,
            query: {
                "page": 1
            }
        }));
    }
    const productPerPage = 4;
    const page = +req.query.page;
    const productAmount = await Product.find().countDocuments();
    const pageAmount = Math.ceil(productAmount / productPerPage);
    if (Number.isInteger(page) && (page >= 1) && (page <= pageAmount)) {
        const productList = await Product.find().skip(productPerPage * (page - 1)).limit(productPerPage);
        res.render(constant.VIEW.gallery, {
            productList,
            productAmount,
            currentPage: page,
            isFirst: page <= 1,
            isSecond: page === 2,
            isLast: page === pageAmount,
            isSecondLast: page === (pageAmount - 1),
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: pageAmount,
            productListRoute: constant.ROUTE.gallery
        });
    } else {
        res.redirect(url.format({
            pathname: constant.ROUTE.error,
            query: {}
        }));
    }
    
})

router.get(constant.ROUTE.product, async (req, res) => {
    const oneProduct = await Product.findById({ _id: req.params.id });
    res.render(constant.VIEW.product, { oneProduct });
})

module.exports = router;