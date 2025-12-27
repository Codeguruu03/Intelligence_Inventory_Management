const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    sku: String,
    category: String,
    stockQuantity: Number,
    costPrice: Number,
    sellingPrice: Number,
    minStockLevel: Number,
    damagedQuantity: { type: Number, default: 0 },
    damageHistory: [{
      quantity: Number,
      reason: String,
      date: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
