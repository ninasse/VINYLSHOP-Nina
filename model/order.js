const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const schemaOrder = new Schema({
    orderEmail: String,
    orderDate: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

/* schemaOrder.methods.createOrderCustomer = function (user) {
    this.customer.push({ customerId: user._id })
    return this.save();
} */
/* schemaOrder.methods.createOrderUser = function (user) {
    this.user.push({ userId: userId._id });
} */

const Order = mongoose.model("Order", schemaOrder)

module.exports = Order
