const mongoose = require('mongoose');
const Schema = require("mongoose").Schema;

const schemaOrder = new Schema({
    orderId: Number,
    orderDate: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const Order = mongoose.model("Order", schemaOrder)

module.exports = Order
