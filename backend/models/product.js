const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
  },
  costPrice: {
    type: Number,
    required: true,
    min: [0, "Cost price cannot be negative"],
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: [0, "Selling price cannot be negative"],
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);