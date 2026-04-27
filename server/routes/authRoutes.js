const express = require("express");
const { getCurrentSession, login, seedAdmin, signup } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentSession);
router.post("/seed-admin", seedAdmin);

module.exports = router;
