const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { ORDER_STATUSES, TAX_RATE } = require("../utils/constants");
const { buildOrderNumber, clampQuantity } = require("../utils/helpers");
const { serializeAddress, serializeOrder } = require("../utils/serializers");

function buildTimeline(status, note = "") {
  return [
    {
      status,
      at: new Date(),
      note
    }
  ];
}

async function syncRewardPoints(userId) {
  const totals = await Order.aggregate([
    {
      $match: {
        userId,
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: null,
        points: {
          $sum: {
            $floor: {
              $divide: ["$total", 10]
            }
          }
        }
      }
    }
  ]);

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        rewardPoints: totals[0]?.points || 0
      }
    }
  );
}

const checkout = asyncHandler(async (req, res) => {
  const { items, addressId, address, slot, paymentMethod } = req.body;

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Add at least one item to continue" });
  }

  const user = await User.findById(req.authUser._id);
  const selectedAddress =
    (addressId && user.addresses.id(addressId)) ||
    null;

  let addressSnapshot = selectedAddress
    ? serializeAddress(selectedAddress)
    : null;

  if (!addressSnapshot && address?.line1) {
    addressSnapshot = serializeAddress({
      ...address,
      recipientName: address.recipientName || user.name,
      phone: address.phone || user.phone,
      isDefault: Boolean(address.isDefault)
    });

    user.addresses.push({
      ...addressSnapshot,
      isDefault: user.addresses.length === 0
    });
    await user.save();
  }

  if (!addressSnapshot?.line1) {
    return res.status(400).json({ message: "Select or add a delivery address" });
  }

  const requestedItems = items
    .map((item) => ({
      productId: item.productId,
      quantity: clampQuantity(item.quantity)
    }))
    .filter((item) => item.productId);

  const products = await Product.find({
    _id: { $in: requestedItems.map((item) => item.productId) },
    active: true
  }).lean();

  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const orderItems = [];

  for (const item of requestedItems) {
    const product = productMap.get(String(item.productId));

    if (!product) {
      return res.status(400).json({ message: "One or more products are unavailable" });
    }

    if (product.stock < item.quantity) {
      return res
        .status(400)
        .json({ message: `${product.name} has only ${product.stock} item(s) in stock` });
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unit: product.unit,
      price: product.price,
      lineTotal: Number((product.price * item.quantity).toFixed(2))
    });
  }

  const subtotal = Number(
    orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const order = await Order.create({
    userId: user._id,
    orderNumber: buildOrderNumber(),
    items: orderItems,
    subtotal,
    tax,
    total,
    paymentMethod: paymentMethod || "Cash on Delivery",
    address: addressSnapshot,
    slot: slot || "7:00 AM - 9:00 AM",
    status: "Placed",
    timeline: buildTimeline("Placed", "Order confirmed and queued for fulfilment.")
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      )
    )
  );

  await syncRewardPoints(user._id);

  return res.status(201).json({
    order: serializeOrder(order)
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.authUser._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    orders: orders.map(serializeOrder)
  });
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.authUser._id
  }).lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({
    order: serializeOrder(order)
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, rider } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Unsupported order status" });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  if (rider && typeof rider === "object") {
    order.rider = {
      name: rider.name || order.rider?.name || "",
      phone: rider.phone || order.rider?.phone || ""
    };
  }

  order.timeline.push({
    status,
    at: new Date(),
    note: req.body.note || ""
  });

  await order.save();
  await syncRewardPoints(order.userId);

  return res.json({
    order: serializeOrder(order)
  });
});

module.exports = {
  checkout,
  getOrderDetail,
  getOrders,
  updateOrderStatus
};
