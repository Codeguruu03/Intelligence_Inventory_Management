const { getWeeklyTrends, getTotalDailyTrends } = require("../services/trend.service");

// Get weekly trends (total sold per product)
exports.getTrends = async (req, res) => {
    const trends = await getWeeklyTrends();
    res.json(trends);
};

// Get daily trends (for time-series chart)
exports.getDailyTrends = async (req, res) => {
    const dailyTrends = await getTotalDailyTrends();
    res.json(dailyTrends);
};
