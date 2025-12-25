const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  updateStock,
  deleteProduct
} = require("../controllers/inventory.controller");

router.post("/", addProduct);
router.get("/", getAllProducts);
router.patch("/:id/stock", updateStock);
router.delete("/:id", deleteProduct);

module.exports = router;
