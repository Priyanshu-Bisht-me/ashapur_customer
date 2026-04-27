const express = require("express");
const { getProductDetail, listProducts } = require("../controllers/productController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listProducts);
router.get("/:slug", requireAuth, getProductDetail);

module.exports = router;
