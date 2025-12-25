const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    sku: String,
    category: String,
    stockQuantity: Number,
    costPrice: Number,
    sellingPrice: Number,
    minStockLevel: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
