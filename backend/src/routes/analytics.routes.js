const express = require("express");
const router = express.Router();
const {
    getTrends,
    getDailyTrends,
    getFinancialInsights,
    getDeadStock,
    getStockoutPredictions,
    getDamagedReport,
    markAsDamaged,
    writeOffDamaged
} = require("../controllers/analytics.controller");

// GET /api/analytics/trends - Weekly trends per product
router.get("/trends", getTrends);

// GET /api/analytics/daily-trends - Daily totals for time-series chart
router.get("/daily-trends", getDailyTrends);

// GET /api/analytics/financial - Financial insights
router.get("/financial", getFinancialInsights);

// GET /api/analytics/dead-stock - Dead stock report
router.get("/dead-stock", getDeadStock);

// GET /api/analytics/stockout - Stockout predictions
router.get("/stockout", getStockoutPredictions);

// GET /api/analytics/damaged - Damaged inventory report
router.get("/damaged", getDamagedReport);

// POST /api/analytics/mark-damaged - Mark product units as damaged
router.post("/mark-damaged", markAsDamaged);

// DELETE /api/analytics/write-off-damaged/:productId - Write off damaged units
router.delete("/write-off-damaged/:productId", writeOffDamaged);

module.exports = router;
