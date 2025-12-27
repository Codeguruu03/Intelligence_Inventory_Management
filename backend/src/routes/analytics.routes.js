const express = require("express");
const router = express.Router();
const { getTrends, getDailyTrends, getFinancialInsights, getDeadStock, getStockoutPredictions } = require("../controllers/analytics.controller");

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

module.exports = router;
