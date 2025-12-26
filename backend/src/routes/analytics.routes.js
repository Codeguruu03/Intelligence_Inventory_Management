const express = require("express");
const router = express.Router();
const { getTrends, getDailyTrends } = require("../controllers/analytics.controller");

// GET /api/analytics/trends - Weekly trends per product
router.get("/trends", getTrends);

// GET /api/analytics/daily-trends - Daily totals for time-series chart
router.get("/daily-trends", getDailyTrends);

module.exports = router;
