const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: Number,
    soldAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", salesSchema);
