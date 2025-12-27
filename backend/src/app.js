const express = require("express");
const cors = require("cors");

const inventoryRoutes = require("./routes/inventory.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const refillRoutes = require("./routes/refill.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/refill", refillRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Inventory Intelligence API is running 🚀");
});

module.exports = app;
