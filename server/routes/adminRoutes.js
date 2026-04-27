const express = require("express");
const {
  createAdminProduct,
  getAdminCustomers,
  getAdminOrders,
  getAdminProducts,
  getAdminStats,
  getAdminSubscriptions,
  patchAdminOrder,
  updateAdminProduct
} = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/customers", getAdminCustomers);
router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.patch("/products/:id", updateAdminProduct);
router.get("/orders", getAdminOrders);
router.patch("/orders/:id", patchAdminOrder);
router.get("/subscriptions", getAdminSubscriptions);

module.exports = router;
