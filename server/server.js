const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Subscription = require("./models/Subscription");
const { formatDateLabel, sanitizeUser } = require("./utils/formatters");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:admin%40123@cluster0.glrzlwx.mongodb.net/aasapure?retryWrites=true&w=majority";
const DELIVERY_STATUSES = ["Placed", "Packed", "Assigned", "Out for Delivery", "Delivered"];
const SEEDED_PRODUCTS = [
  {
    name: "Milk",
    description: "Fresh full-cream milk.",
    price: 60,
    unit: "1 L"
  },
  {
    name: "Curd",
    description: "Thick and fresh curd.",
    price: 45,
    unit: "500 g"
  },
  {
    name: "Paneer",
    description: "Soft paneer made daily.",
    price: 95,
    unit: "200 g"
  },
  {
    name: "Butter",
    description: "Creamy table butter.",
    price: 110,
    unit: "200 g"
  },
  {
    name: "Ghee",
    description: "Pure cow ghee.",
    price: 320,
    unit: "500 ml"
  },
  {
    name: "Lassi",
    description: "Chilled sweet lassi.",
    price: 35,
    unit: "250 ml"
  }
];

app.use(cors());
app.use(express.json());

async function seedProducts() {
  await Promise.all(
    SEEDED_PRODUCTS.map((product) =>
      Product.updateOne(
        { name: product.name },
        {
          $setOnInsert: {
            ...product,
            isActive: true
          }
        },
        { upsert: true }
      )
    )
  );
}

function normalizeOrderStatus(status) {
  return DELIVERY_STATUSES.includes(status) ? status : "Placed";
}

function buildTrackingSteps(currentStatus) {
  const currentIndex = DELIVERY_STATUSES.indexOf(currentStatus);

  return DELIVERY_STATUSES.map((status, index) => ({
    status,
    isCompleted: index <= currentIndex,
    isCurrent: index === currentIndex
  }));
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Atlas Connected");
    await seedProducts();
    console.log("Product seed check complete");
  })
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function registerUser(req, res, roleOverride) {
  try {
    const { name, email, password, phone, mobile, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || mobile || "",
      mobile: mobile || phone || "",
      address: address || "",
      role: roleOverride || role || "customer"
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user" });
  }
}

async function loginUser(req, res, roleRequired) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      password
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const effectiveRole = user.role || "customer";

    if (roleRequired && effectiveRole !== roleRequired) {
      return res.status(403).json({ message: "Access denied for this role" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to login" });
  }
}

app.post("/register", (req, res) => registerUser(req, res));
app.post("/login", (req, res) => loginUser(req, res));

app.post("/api/customer/signup", (req, res) => registerUser(req, res, "customer"));
app.post("/api/customer/login", (req, res) => loginUser(req, res, "customer"));

app.get("/api/customer/products", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ name: 1 }).lean();

    return res.json(
      products.map((product) => ({
        _id: product._id,
        name: product.name,
        description: product.description || "",
        price: product.price || 0,
        unit: product.unit || ""
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Unable to load products" });
  }
});

app.post("/api/customer/orders", async (req, res) => {
  try {
    const { userId, items, address, paymentMethod } = req.body;

    if (!userId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "User and cart items are required" });
    }

    if (!address || !paymentMethod) {
      return res.status(400).json({ message: "Address and payment method are required" });
    }

    const customer = await User.findById(userId).lean();

    if (!customer || (customer.role || "customer") !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    const normalizedItems = items
      .map((item) => ({
        productId: item.productId,
        productName: (item.productName || "").trim(),
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Math.max(0, Number(item.price) || 0),
        unit: (item.unit || "").trim()
      }))
      .filter((item) => item.productName);

    if (!normalizedItems.length) {
      return res.status(400).json({ message: "At least one valid item is required" });
    }

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: userId,
      orderNumber: `ORD-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`,
      items: normalizedItems,
      totalAmount,
      status: "Placed",
      address: address.trim(),
      paymentMethod: paymentMethod.trim(),
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return res.status(201).json({
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      address: order.address,
      paymentMethod: order.paymentMethod,
      deliveryDateLabel: formatDateLabel(order.deliveryDate)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to place order" });
  }
});

app.get("/api/customer/orders/track/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = normalizeOrderStatus(order.status);

    return res.json({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: currentStatus,
      deliveryDateLabel: formatDateLabel(order.deliveryDate),
      trackingSteps: buildTrackingSteps(currentStatus),
      updatedAt: order.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load tracking details" });
  }
});

app.get("/api/customer/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await User.findById(userId).lean();

    if (!customer || (customer.role || "customer") !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1, deliveryDate: -1 })
      .lean();

    return res.json(
      orders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount || 0,
        status: normalizeOrderStatus(order.status),
        address: order.address || "",
        paymentMethod: order.paymentMethod || "Cash on Delivery",
        createdAt: order.createdAt,
        deliveryDateLabel: formatDateLabel(order.deliveryDate),
        items: (order.items || []).map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit || ""
        }))
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Unable to load orders" });
  }
});

app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch profile" });
  }
});

app.get("/api/customer/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || (user.role || "customer") !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    const activeSubscriptions = await Subscription.find({
      user: userId,
      status: { $in: ["Active", "active"] }
    })
      .sort({ nextDeliveryDate: 1, createdAt: -1 })
      .limit(4)
      .lean();

    const recentOrders = await Order.find({ user: userId })
      .sort({ deliveryDate: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayOrder =
      recentOrders.find((order) => {
        if (!order.deliveryDate) {
          return false;
        }

        const deliveryDate = new Date(order.deliveryDate);
        return deliveryDate >= startOfDay && deliveryDate < endOfDay;
      }) ||
      (await Order.findOne({
        user: userId,
        deliveryDate: { $gte: startOfDay, $lt: endOfDay }
      })
        .sort({ deliveryDate: 1 })
        .lean());

    const formattedOrders = recentOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount || 0,
      status: order.status || "Placed",
      deliveryDateLabel: formatDateLabel(order.deliveryDate)
    }));

    const dashboard = {
      user: sanitizeUser(user),
      todayDelivery: todayOrder
        ? {
            title:
              todayOrder.items?.map((item) => item.productName).join(", ") || "Scheduled order",
            description: "Fresh items are lined up for today.",
            deliveryWindow: formatDateLabel(todayOrder.deliveryDate),
            totalAmount: todayOrder.totalAmount || 0,
            status: todayOrder.status || "Placed"
          }
        : null,
      activeSubscriptions: activeSubscriptions.map((subscription) => ({
        _id: subscription._id,
        productName: subscription.productName,
        quantity: subscription.quantity || 1,
        frequency: subscription.frequency || "Daily",
        status: subscription.status || "Active",
        nextDeliveryDate: subscription.nextDeliveryDate
          ? formatDateLabel(subscription.nextDeliveryDate)
          : "Not scheduled"
      })),
      recentOrders: formattedOrders
    };

    return res.json(dashboard);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load dashboard" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
