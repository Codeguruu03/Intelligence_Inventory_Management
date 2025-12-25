const express = require("express");
const router = express.Router();
const { getTrends } = require("../controllers/analytics.controller");

router.get("/trends", getTrends);

module.exports = router;
