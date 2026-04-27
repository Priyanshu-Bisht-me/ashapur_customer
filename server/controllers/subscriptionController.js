const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const { SUBSCRIPTION_STATUSES } = require("../utils/constants");
const { clampQuantity, getNextDeliveryDate } = require("../utils/helpers");
const { serializeSubscription } = require("../utils/serializers");

const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ userId: req.authUser._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    subscriptions: subscriptions.map(serializeSubscription)
  });
});

const createSubscription = asyncHandler(async (req, res) => {
  const { productId, quantity, frequency } = req.body;

  const product = await Product.findOne({ _id: productId, active: true });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let subscription = await Subscription.findOne({
    userId: req.authUser._id,
    productId: product._id,
    frequency: frequency === "Weekly" ? "Weekly" : "Daily",
    status: { $ne: "Cancelled" }
  });

  if (subscription) {
    subscription.quantity = clampQuantity(quantity);
    subscription.status = "Active";
    subscription.nextDeliveryDate = getNextDeliveryDate(subscription.frequency);
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      userId: req.authUser._id,
      productId: product._id,
      productName: product.name,
      imageUrl: product.imageUrl,
      unit: product.unit,
      quantity: clampQuantity(quantity),
      frequency: frequency === "Weekly" ? "Weekly" : "Daily",
      nextDeliveryDate: getNextDeliveryDate(frequency),
      status: "Active"
    });
  }

  return res.status(201).json({
    subscription: serializeSubscription(subscription)
  });
});

const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    userId: req.authUser._id
  });

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  const nextStatus = req.body.status;
  if (nextStatus && !SUBSCRIPTION_STATUSES.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid subscription status" });
  }

  if (req.body.quantity !== undefined) {
    subscription.quantity = clampQuantity(req.body.quantity);
  }

  if (req.body.frequency) {
    subscription.frequency = req.body.frequency === "Weekly" ? "Weekly" : "Daily";
  }

  if (nextStatus) {
    subscription.status = nextStatus;
  }

  subscription.nextDeliveryDate =
    subscription.status === "Active" ? getNextDeliveryDate(subscription.frequency) : null;

  await subscription.save();

  return res.json({
    subscription: serializeSubscription(subscription)
  });
});

module.exports = {
  createSubscription,
  getSubscriptions,
  updateSubscription
};
