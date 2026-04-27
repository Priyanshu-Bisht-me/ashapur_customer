const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const {
  ORDER_STATUSES,
  SEEDED_PRODUCTS,
  SUBSCRIPTION_STATUSES,
  TAX_RATE
} = require("./constants");
const {
  buildOrderNumber,
  clampQuantity,
  getNextDeliveryDate,
  slugify
} = require("./helpers");

const BROKEN_PRODUCT_IMAGES = new Set([
  "https://images.unsplash.com/photo-1517448931760-9bf4414148c5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1615485737651-2d5bbf7b8bb8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589985270958-2d6a0b1819fa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625944524160-5f14eaec0bcb?auto=format&fit=crop&w=900&q=80"
]);

function buildAddressFromLegacy(user) {
  const rawAddress = String(user.address || "").trim();

  if (!rawAddress) {
    return [];
  }

  return [
    {
      label: "Home",
      recipientName: user.name || "",
      phone: user.phone || user.mobile || "",
      line1: rawAddress,
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: true
    }
  ];
}

async function migrateUsers() {
  const users = await User.find({}).lean();

  for (const user of users) {
    const nextUpdate = {};
    const unset = {};

    if (!Array.isArray(user.addresses)) {
      nextUpdate.addresses = buildAddressFromLegacy(user);
    }

    if (typeof user.rewardPoints !== "number") {
      nextUpdate.rewardPoints = 0;
    }

    if (!user.preferences || typeof user.preferences !== "object") {
      nextUpdate.preferences = {
        deliveryNotes: "",
        newsletter: false
      };
    }

    if (!user.passwordHash && user.password) {
      nextUpdate.passwordHash = await bcrypt.hash(user.password, 10);
      unset.password = "";
    }

    if (user.mobile) {
      unset.mobile = "";
      if (!user.phone) {
        nextUpdate.phone = user.mobile;
      }
    }

    if (Object.keys(nextUpdate).length || Object.keys(unset).length) {
      await User.updateOne(
        { _id: user._id },
        {
          ...(Object.keys(nextUpdate).length ? { $set: nextUpdate } : {}),
          ...(Object.keys(unset).length ? { $unset: unset } : {})
        }
      );
    }
  }
}

async function upsertSeedProducts() {
  for (const product of SEEDED_PRODUCTS) {
    await Product.updateOne(
      { name: product.name },
      {
        $setOnInsert: {
          ...product
        }
      },
      { upsert: true }
    );
  }
}

async function migrateProducts() {
  const products = await Product.find({}).lean();

  for (const product of products) {
    const catalogProduct = SEEDED_PRODUCTS.find((item) => item.name === product.name);
    const nextImageUrl =
      !product.imageUrl || BROKEN_PRODUCT_IMAGES.has(product.imageUrl)
        ? catalogProduct?.imageUrl || product.image || ""
        : product.imageUrl;
    const nextUpdate = {
      slug: product.slug || slugify(product.name),
      description: product.description || catalogProduct?.description || "",
      imageUrl: nextImageUrl,
      unit: product.unit || catalogProduct?.unit || "1 unit",
      category: product.category || catalogProduct?.category || "Fresh Dairy"
    };

    if (typeof product.active !== "boolean") {
      nextUpdate.active = typeof product.isActive === "boolean" ? product.isActive : true;
    }

    if (typeof product.stock !== "number") {
      nextUpdate.stock = Number(product.stock || 0);
    }

    if (!Array.isArray(product.nutritionBadges)) {
      nextUpdate.nutritionBadges = catalogProduct?.nutritionBadges || [];
    }

    await Product.updateOne(
      { _id: product._id },
      {
        $set: nextUpdate,
        $unset: {
          image: "",
          isActive: ""
        }
      }
    );
  }
}

function normalizeLegacyAddress(addressValue, userName = "", phone = "") {
  if (addressValue && typeof addressValue === "object") {
    return {
      label: addressValue.label || "Home",
      recipientName: addressValue.recipientName || userName || "",
      phone: addressValue.phone || phone || "",
      line1: addressValue.line1 || addressValue.fullAddress || addressValue.address || "",
      line2: addressValue.line2 || "",
      city: addressValue.city || "",
      state: addressValue.state || "",
      pincode: addressValue.pincode || "",
      isDefault: Boolean(addressValue.isDefault)
    };
  }

  return {
    label: "Home",
    recipientName: userName || "",
    phone: phone || "",
    line1: String(addressValue || ""),
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: true
  };
}

async function migrateOrders() {
  const products = await Product.find({}).lean();
  const productMap = new Map(products.map((item) => [String(item._id), item]));
  const orders = await mongoose.connection.collection("orders").find({}).toArray();

  for (const order of orders) {
    const userId = order.userId || order.customerId || order.user;
    if (!userId) {
      continue;
    }

    const user = await User.findById(userId).lean();
    const items = (order.items || []).map((item) => {
      const matchedProduct =
        productMap.get(String(item.productId || "")) ||
        products.find((product) => product.name === item.name || product.name === item.productName);
      const quantity = clampQuantity(item.quantity);
      const price = Number(item.price || matchedProduct?.price || 0);

      return {
        productId: matchedProduct?._id || item.productId,
        name: item.name || item.productName || matchedProduct?.name || "Product",
        slug: item.slug || matchedProduct?.slug || slugify(item.name || item.productName || "product"),
        imageUrl: item.imageUrl || item.image || matchedProduct?.imageUrl || "",
        quantity,
        unit: item.unit || matchedProduct?.unit || "",
        price,
        lineTotal: Number(item.lineTotal || price * quantity)
      };
    });

    const subtotal =
      Number(order.subtotal) ||
      Number(order.totalAmount) ||
      items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = Number(order.tax) || Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number(order.total) || Number((subtotal + tax).toFixed(2));
    const normalizedStatus = ORDER_STATUSES.includes(order.status) ? order.status : "Placed";

    const timeline = Array.isArray(order.timeline) && order.timeline.length
      ? order.timeline
      : [
          {
            status: normalizedStatus,
            at: order.createdAt || new Date(),
            note: normalizedStatus === "Placed" ? "Order confirmed." : ""
          }
        ];

    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          userId,
          orderNumber: order.orderNumber || buildOrderNumber(),
          items,
          subtotal,
          tax,
          total,
          paymentMethod: order.paymentMethod || "Cash on Delivery",
          address: normalizeLegacyAddress(order.address, user?.name || "", user?.phone || ""),
          slot: order.slot || "7:00 AM - 9:00 AM",
          status: normalizedStatus,
          rider: order.rider || { name: "", phone: "" },
          timeline
        },
        $unset: {
          customerId: "",
          user: "",
          totalAmount: ""
        }
      }
    );
  }
}

async function migrateSubscriptions() {
  const products = await Product.find({}).lean();
  const subscriptions = await mongoose.connection.collection("subscriptions").find({}).toArray();

  for (const subscription of subscriptions) {
    const product =
      products.find((item) => String(item._id) === String(subscription.productId || "")) ||
      products.find((item) => item.name === subscription.productName || item.name === subscription.planName) ||
      products[0];

    if (!product) {
      continue;
    }

    await Subscription.updateOne(
      { _id: subscription._id },
      {
        $set: {
          userId: subscription.userId || subscription.customerId || subscription.user,
          productId: product._id,
          productName: product.name,
          imageUrl: subscription.imageUrl || product.imageUrl || "",
          unit: subscription.unit || product.unit || "",
          quantity: clampQuantity(subscription.quantity),
          frequency: subscription.frequency === "Weekly" ? "Weekly" : "Daily",
          nextDeliveryDate: subscription.nextDeliveryDate || getNextDeliveryDate(subscription.frequency),
          status: SUBSCRIPTION_STATUSES.includes(subscription.status)
            ? subscription.status
            : "Active"
        },
        $unset: {
          customerId: "",
          user: "",
          planName: ""
        }
      }
    );
  }
}

async function ensureRewardPoints() {
  const rewards = await Order.aggregate([
    {
      $match: {
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: "$userId",
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

  const rewardMap = new Map(rewards.map((item) => [String(item._id), Number(item.points || 0)]));
  const users = await User.find({}).select("_id rewardPoints").lean();

  for (const user of users) {
    const points = rewardMap.get(String(user._id)) || 0;
    if (user.rewardPoints !== points) {
      await User.updateOne({ _id: user._id }, { $set: { rewardPoints: points } });
    }
  }
}

async function bootstrapDatabase() {
  await migrateUsers();
  await migrateProducts();
  await upsertSeedProducts();
  await migrateOrders();
  await migrateSubscriptions();
  await ensureRewardPoints();
}

module.exports = {
  bootstrapDatabase
};
