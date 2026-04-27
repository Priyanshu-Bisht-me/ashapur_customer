const express = require("express");
const { getProfile, getRewards, updateProfile } = require("../controllers/profileController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", requireAuth, requireRole("customer"), getProfile);
router.patch("/profile", requireAuth, requireRole("customer"), updateProfile);
router.get("/rewards", requireAuth, requireRole("customer"), getRewards);

module.exports = router;
