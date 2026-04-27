const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireRole("customer"), getDashboard);

module.exports = router;
