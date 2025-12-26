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
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        console.log('[getTotalDailyTrends] Querying sales since:', last7Days.toISOString());

        // First check if any sales exist
        const totalCount = await Sale.countDocuments({});
        console.log('[getTotalDailyTrends] Total sales in collection:', totalCount);

        const recentCount = await Sale.countDocuments({ soldAt: { $gte: last7Days } });
        console.log('[getTotalDailyTrends] Sales in last 7 days:', recentCount);

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

        console.log('[getTotalDailyTrends] Result:', JSON.stringify(dailyTotals));
        return dailyTotals;
    } catch (error) {
        console.error('[getTotalDailyTrends] Error:', error.message);
        return [];
    }
};
