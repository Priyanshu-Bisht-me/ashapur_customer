const express = require("express");
const {
  checkout,
  getOrderDetail,
  getOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/cart/checkout", requireAuth, requireRole("customer"), checkout);
router.get("/orders", requireAuth, requireRole("customer"), getOrders);
router.get("/orders/:id", requireAuth, requireRole("customer"), getOrderDetail);
router.patch("/orders/:id/status", requireAuth, requireRole("admin"), updateOrderStatus);

module.exports = router;
