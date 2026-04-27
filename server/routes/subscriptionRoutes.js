const express = require("express");
const {
  createSubscription,
  getSubscriptions,
  updateSubscription
} = require("../controllers/subscriptionController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/subscriptions", requireAuth, requireRole("customer"), getSubscriptions);
router.post("/subscriptions", requireAuth, requireRole("customer"), createSubscription);
router.patch("/subscriptions/:id", requireAuth, requireRole("customer"), updateSubscription);

module.exports = router;
