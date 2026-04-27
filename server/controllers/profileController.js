const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const User = require("../models/User");
const { serializeUser } = require("../utils/serializers");

function normalizeAddresses(addresses = [], fallbackName = "", fallbackPhone = "") {
  const list = (Array.isArray(addresses) ? addresses : [])
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

  if (!list.length) {
    return [];
  }

  if (!list.some((item) => item.isDefault)) {
    list[0].isDefault = true;
  }

  return list;
}

function buildRewards(points, orders = []) {
  const tier = points >= 1200 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
  const nextTierTarget = points >= 1200 ? 1200 : points >= 500 ? 1200 : 500;

  return {
    points,
    tier,
    nextTierTarget,
    progress:
      nextTierTarget === 1200 && points >= 1200
        ? 100
        : Math.min(100, Math.round((points / nextTierTarget) * 100)),
    history: orders.map((order) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      pointsEarned: Math.floor(Number(order.total || 0) / 10),
      createdAt: order.createdAt
    }))
  };
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.authUser._id).lean();

  return res.json({
    profile: serializeUser(user)
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addresses, preferences } = req.body;
  const user = await User.findById(req.authUser._id);

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  if (typeof phone === "string") {
    user.phone = phone.trim();
  }

  if (addresses) {
    user.addresses = normalizeAddresses(addresses, user.name, user.phone);
  }

  if (preferences && typeof preferences === "object") {
    user.preferences = {
      deliveryNotes: preferences.deliveryNotes || "",
      newsletter: Boolean(preferences.newsletter)
    };
  }

  await user.save();

  return res.json({
    profile: serializeUser(user)
  });
});

const getRewards = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    userId: req.authUser._id,
    status: { $ne: "Cancelled" }
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return res.json({
    rewards: buildRewards(Number(req.authUser.rewardPoints || 0), orders),
    redeemables: [
      { title: "Free 500 ml milk pack", pointsRequired: 150 },
      { title: "Priority delivery slot", pointsRequired: 350 },
      { title: "Premium pantry hamper", pointsRequired: 900 }
    ]
  });
});

module.exports = {
  getProfile,
  getRewards,
  updateProfile
};
