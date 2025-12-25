const express = require("express");
const router = express.Router();
const { getRefillDecisions } = require("../controllers/refill.controller");

router.get("/", getRefillDecisions);

module.exports = router;
