const express = require("express");
const router = express.Router();
const { seedSales, clearSales } = require("../controllers/admin.controller");

// POST /api/admin/seed-sales - Seed sample sales data
router.post("/seed-sales", seedSales);

// DELETE /api/admin/clear-sales - Clear all sales data
router.delete("/clear-sales", clearSales);

module.exports = router;
