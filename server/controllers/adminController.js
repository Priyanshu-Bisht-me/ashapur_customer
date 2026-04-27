const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { ACTIVE_ORDER_STATUSES, ORDER_STATUSES, SUBSCRIPTION_STATUSES, TAX_RATE } = require("../utils/constants");
const { clampQuantity, sanitizeSearchValue, slugify } = require("../utils/helpers");
const { serializeOrder, serializeProduct, serializeSubscription, serializeUser } = require("../utils/serializers");

const getAdminStats = asyncHandler(async (req, res) => {
  const [customers, products, activeProducts, orders, activeSubscriptions, revenueAgg, orderStatusAgg] =
    await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Order.countDocuments(),
      Subscription.countDocuments({ status: "Active" }),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } }
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

  return res.json({
    stats: {
      customers,
      products,
      activeProducts,
      orders,
      activeSubscriptions,
      pendingOrders: orderStatusAgg
        .filter((item) => ACTIVE_ORDER_STATUSES.includes(item._id))
        .reduce((sum, item) => sum + item.count, 0),
      revenue: revenueAgg[0]?.revenue || 0,
      orderBreakdown: orderStatusAgg
    }
  });
});

const getAdminCustomers = asyncHandler(async (req, res) => {
  const search = sanitizeSearchValue(req.query.q);
  const query = { role: "customer" };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const customers = await User.find(query).sort({ createdAt: -1 }).lean();
  const orderCounts = await Order.aggregate([
    {
      $match: {
        userId: { $in: customers.map((item) => item._id) }
      }
    },
    {
      $group: {
        _id: "$userId",
        count: { $sum: 1 }
      }
    }
  ]);
  const countMap = new Map(orderCounts.map((item) => [String(item._id), item.count]));

  return res.json({
    customers: customers.map((customer) => ({
      ...serializeUser(customer),
      ordersCount: countMap.get(String(customer._id)) || 0
    }))
  });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const search = sanitizeSearchValue(req.query.q);
  const activeFilter = sanitizeSearchValue(req.query.active);
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  if (activeFilter === "true") {
    query.active = true;
  } else if (activeFilter === "false") {
    query.active = false;
  }

  const products = await Product.find(query).sort({ createdAt: -1 }).lean();

  return res.json({
    products: products.map(serializeProduct)
  });
});

const createAdminProduct = asyncHandler(async (req, res) => {
  const payload = req.body;
  const name = String(payload.name || "").trim();

  if (!name) {
    return res.status(400).json({ message: "Product name is required" });
  }

  const slug = slugify(payload.slug || name);
  const existingSlug = await Product.findOne({ slug }).lean();

  if (existingSlug) {
    return res.status(409).json({ message: "A product already exists with this slug" });
  }

  const product = await Product.create({
    name,
    slug,
    category: String(payload.category || "Fresh Dairy").trim(),
    description: String(payload.description || "").trim(),
    imageUrl: String(payload.imageUrl || "").trim(),
    price: Number(payload.price || 0),
    unit: String(payload.unit || "1 unit").trim(),
    stock: Math.max(0, Number(payload.stock || 0)),
    active: payload.active !== false,
    nutritionBadges: Array.isArray(payload.nutritionBadges) ? payload.nutritionBadges : []
  });

  return res.status(201).json({
    product: serializeProduct(product)
  });
});

const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const payload = req.body;

  if (typeof payload.name === "string" && payload.name.trim()) {
    product.name = payload.name.trim();
  }
  if (typeof payload.slug === "string" && payload.slug.trim()) {
    product.slug = slugify(payload.slug);
  }
  if (typeof payload.category === "string" && payload.category.trim()) {
    product.category = payload.category.trim();
  }
  if (typeof payload.description === "string") {
    product.description = payload.description.trim();
  }
  if (typeof payload.imageUrl === "string") {
    product.imageUrl = payload.imageUrl.trim();
  }
  if (payload.price !== undefined) {
    product.price = Number(payload.price || 0);
  }
  if (typeof payload.unit === "string" && payload.unit.trim()) {
    product.unit = payload.unit.trim();
  }
  if (payload.stock !== undefined) {
    product.stock = Math.max(0, Number(payload.stock || 0));
  }
  if (typeof payload.active === "boolean") {
    product.active = payload.active;
  }
  if (Array.isArray(payload.nutritionBadges)) {
    product.nutritionBadges = payload.nutritionBadges;
  }

  await product.save();

  return res.json({
    product: serializeProduct(product)
  });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const status = sanitizeSearchValue(req.query.status);
  const search = sanitizeSearchValue(req.query.q);
  const query = {};

  if (status && ORDER_STATUSES.includes(status)) {
    query.status = status;
  }

  let orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate("userId", "name email phone")
    .lean();

  if (search) {
    const lowered = search.toLowerCase();
    orders = orders.filter((order) =>
      [order.orderNumber, order.userId?.name, order.userId?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(lowered)
    );
  }

  return res.json({
    orders: orders.map((order) => ({
      ...serializeOrder(order),
      customer: order.userId ? serializeUser(order.userId) : null
    }))
  });
});

const patchAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "name email phone");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (req.body.status && ORDER_STATUSES.includes(req.body.status)) {
    order.status = req.body.status;
    order.timeline.push({
      status: req.body.status,
      at: new Date(),
      note: req.body.note || ""
    });
  }

  if (req.body.rider && typeof req.body.rider === "object") {
    order.rider = {
      name: req.body.rider.name || "",
      phone: req.body.rider.phone || ""
    };
  }

  if (req.body.slot) {
    order.slot = req.body.slot;
  }

  await order.save();

  return res.json({
    order: {
      ...serializeOrder(order),
      customer: order.userId ? serializeUser(order.userId) : null
    }
  });
});

const getAdminSubscriptions = asyncHandler(async (req, res) => {
  const status = sanitizeSearchValue(req.query.status);
  const query = {};

  if (status && SUBSCRIPTION_STATUSES.includes(status)) {
    query.status = status;
  }

  const subscriptions = await Subscription.find(query)
    .sort({ createdAt: -1 })
    .populate("userId", "name email phone")
    .populate("productId", "name slug")
    .lean();

  return res.json({
    subscriptions: subscriptions.map((subscription) => ({
      ...serializeSubscription(subscription),
      customer: subscription.userId ? serializeUser(subscription.userId) : null,
      product: subscription.productId
        ? {
            _id: subscription.productId._id,
            name: subscription.productId.name,
            slug: subscription.productId.slug
          }
        : null
    }))
  });
});

module.exports = {
  createAdminProduct,
  getAdminCustomers,
  getAdminOrders,
  getAdminProducts,
  getAdminStats,
  getAdminSubscriptions,
  patchAdminOrder,
  updateAdminProduct
};
