const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    valueUnitary: {
        type: Number,
        required: true
    },
    id_user: {
        type: String,
        required: true
    }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;