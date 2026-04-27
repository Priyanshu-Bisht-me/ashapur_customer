const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const { ACTIVE_ORDER_STATUSES } = require("../utils/constants");
const { serializeOrder, serializeProduct, serializeSubscription, serializeUser } = require("../utils/serializers");

function buildTier(points) {
  if (points >= 1200) {
    return "Gold";
  }

  if (points >= 500) {
    return "Silver";
  }

  return "Bronze";
}

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.authUser._id;

  const [recentOrders, activeSubscriptions, pendingOrders, featuredProducts] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).limit(4).lean(),
    Subscription.find({ userId, status: "Active" }).sort({ nextDeliveryDate: 1 }).limit(4).lean(),
    Order.find({ userId, status: { $in: ACTIVE_ORDER_STATUSES } }).sort({ createdAt: -1 }).limit(3).lean(),
    Product.find({ active: true }).sort({ stock: -1, createdAt: -1 }).limit(3).lean()
  ]);

  const spendSummary = await Order.aggregate([
    {
      $match: {
        userId: req.authUser._id,
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" }
      }
    }
  ]);

  const spend = spendSummary[0] || { totalOrders: 0, totalSpent: 0 };
  const points = Number(req.authUser.rewardPoints || 0);

  return res.json({
    user: serializeUser(req.authUser),
    todayDelivery: pendingOrders[0] ? serializeOrder(pendingOrders[0]) : null,
    activeSubscriptions: activeSubscriptions.map(serializeSubscription),
    recentOrders: recentOrders.map(serializeOrder),
    pendingDeliveries: pendingOrders.map(serializeOrder),
    quickReorder: recentOrders[0] ? serializeOrder(recentOrders[0]) : null,
    spendSummary: {
      totalOrders: spend.totalOrders,
      totalSpent: spend.totalSpent,
      averageOrderValue: spend.totalOrders ? Math.round(spend.totalSpent / spend.totalOrders) : 0
    },
    rewards: {
      points,
      tier: buildTier(points),
      nextTierTarget: points >= 1200 ? 1200 : points >= 500 ? 1200 : 500
    },
    featuredProducts: featuredProducts.map(serializeProduct)
  });
});

module.exports = {
  getDashboard
};
