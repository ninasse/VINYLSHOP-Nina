const express = require('express');
const router = express.Router();
const { ROUTE, VIEW } = require('../constant');

router.get(ROUTE.error, (req, res) => {
    res.status(404).render(VIEW.error, {
        ROUTE,
        errmsg: req.query.errmsg || '404. Sidan finns inte!',
        token: (req.cookies.jsonwebtoken !== undefined) ? true : false
    });
})

module.exports = router;
