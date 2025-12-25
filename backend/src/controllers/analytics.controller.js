const { getWeeklyTrends } = require("../services/trend.service");

exports.getTrends = async (req, res) => {
  const trends = await getWeeklyTrends();
  res.json(trends);
};
