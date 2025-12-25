const Product = require("../models/product.model");
const { getRefillAdvice } = require("../services/refill.service");

exports.getRefillDecisions = async (req, res) => {
  try {
    const products = await Product.find();

    const decisions = products.map(product => {
      // Simple avg daily sales assumption (can improve later)
      const avgDailySales = product.stockQuantity > 0 ? 2 : 0;

      return {
        productId: product._id,
        name: product.name,
        stock: product.stockQuantity,
        decision: getRefillAdvice(product, avgDailySales)
      };
    });

    res.json(decisions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
