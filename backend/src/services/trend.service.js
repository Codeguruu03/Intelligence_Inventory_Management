const Sale = require("../models/sales.model");

exports.getWeeklyTrends = async () => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  return Sale.aggregate([
    { $match: { soldAt: { $gte: last7Days } } },
    {
      $group: {
        _id: "$productId",
        totalSold: { $sum: "$quantity" }
      }
    },
    { $sort: { totalSold: -1 } }
  ]);
};
