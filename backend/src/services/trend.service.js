const Sale = require("../models/sales.model");

// Get weekly trends - total sold per product in last 7 days
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

// Get daily sales trends - sales per day for last 7 days (for chart)
exports.getDailyTrends = async () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyData = await Sale.aggregate([
        { $match: { soldAt: { $gte: last7Days } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$soldAt" } },
                    productId: "$productId"
                },
                totalSold: { $sum: "$quantity" }
            }
        },
        { $sort: { "_id.date": 1 } }
    ]);

    return dailyData;
};

// Get total daily sales across all products (for overall trend line)
exports.getTotalDailyTrends = async () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyTotals = await Sale.aggregate([
        { $match: { soldAt: { $gte: last7Days } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$soldAt" } },
                totalSold: { $sum: "$quantity" },
                salesCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return dailyTotals;
};
