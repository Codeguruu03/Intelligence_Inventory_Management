const { getWeeklyTrends, getTotalDailyTrends } = require("../services/trend.service");
const { getFinancialInsights } = require("../services/financial.service");
const { getDeadStock } = require("../services/deadstock.service");
const { getStockoutPredictions } = require("../services/stockout.service");
const { getDamagedReport, markAsDamaged, writeOffDamaged } = require("../services/damage.service");

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

// Get financial insights
exports.getFinancialInsights = async (req, res) => {
    const insights = await getFinancialInsights();
    res.json(insights);
};

// Get dead stock report
exports.getDeadStock = async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const deadStock = await getDeadStock(days);
    res.json(deadStock);
};

// Get stockout predictions
exports.getStockoutPredictions = async (req, res) => {
    const predictions = await getStockoutPredictions();
    res.json(predictions);
};

// Get damaged inventory report
exports.getDamagedReport = async (req, res) => {
    const report = await getDamagedReport();
    res.json(report);
};

// Mark product as damaged
exports.markAsDamaged = async (req, res) => {
    const { productId, quantity, reason } = req.body;
    try {
        const product = await markAsDamaged(productId, quantity, reason);
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Write off damaged inventory
exports.writeOffDamaged = async (req, res) => {
    const { productId } = req.params;
    try {
        const result = await writeOffDamaged(productId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

