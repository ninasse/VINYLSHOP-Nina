const mongoose = require('mongoose');
const Schema = require("mongoose").Schema;

const schemaProduct = new Schema({
    artist: String,
    album: String,
    tracks: String,
    spotifyId: String,
    imgUrl: String,
    genre: [],
    price: Number,
    addedBy: {
        //ett objekt id från mongoose 
        type: mongoose.Schema.Types.Mixed,
        //referens från en user 
        ref: "User"
    }
})

const Product = mongoose.model("Product", schemaProduct)

module.exports = Product