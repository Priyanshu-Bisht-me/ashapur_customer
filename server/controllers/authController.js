const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const { buildAuthPayload } = require("../utils/auth");
const { serializeUser } = require("../utils/serializers");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeAddresses(addresses = [], fallbackName = "", fallbackPhone = "") {
  return (Array.isArray(addresses) ? addresses : [])
    .map((address, index) => ({
      label: address.label || (index === 0 ? "Home" : "Address"),
      recipientName: address.recipientName || fallbackName,
      phone: address.phone || fallbackPhone,
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: index === 0 ? true : Boolean(address.isDefault)
    }))
    .filter((address) => address.line1);
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, addresses } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();

  if (existingUser) {
    return res.status(409).json({ message: "An account already exists for this email" });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: "customer",
    phone: String(phone || "").trim(),
    addresses: normalizeAddresses(addresses, String(name).trim(), String(phone || "").trim())
  });

  return res.status(201).json(buildAuthPayload(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: normalizeEmail(email) });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json(buildAuthPayload(user));
});

const getCurrentSession = asyncHandler(async (req, res) => {
  return res.json({
    user: serializeUser(req.authUser)
  });
});

const seedAdmin = asyncHandler(async (req, res) => {
  const providedSeedKey = req.headers["x-seed-key"];

  if (!providedSeedKey || providedSeedKey !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: "Seed access denied" });
  }

  const existingAdmin = await User.findOne({ email: "admin@aasapure.com" });

  if (existingAdmin) {
    return res.json({
      created: false,
      user: serializeUser(existingAdmin)
    });
  }

  const admin = await User.create({
    name: "Admin",
    email: "admin@aasapure.com",
    passwordHash: await bcrypt.hash("admin123", 10),
    role: "admin"
  });

  return res.status(201).json({
    created: true,
    user: serializeUser(admin)
  });
});

module.exports = {
  getCurrentSession,
  login,
  seedAdmin,
  signup
};
