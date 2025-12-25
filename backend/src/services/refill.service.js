exports.getRefillAdvice = (product, avgDailySales) => {
  if (product.stockQuantity < product.minStockLevel) {
    return {
      decision: "REFILL_NOW",
      reason: "Stock below minimum threshold"
    };
  }

  if (avgDailySales === 0) {
    return {
      decision: "STOP_REORDER",
      reason: "No sales detected recently"
    };
  }

  return {
    decision: "HOLD",
    reason: "Stock level is healthy"
  };
};
