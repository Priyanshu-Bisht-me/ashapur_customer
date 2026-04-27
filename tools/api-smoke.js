const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const User = require("../server/models/User");
const Product = require("../server/models/Product");
const Order = require("../server/models/Order");
const Subscription = require("../server/models/Subscription");

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${PORT}`;
const timestamp = Date.now();
const smokeUser = {
  name: "Smoke Customer",
  email: `smoke.${timestamp}@aasapure.local`,
  password: `Smoke_${timestamp}!`,
  phone: "9876543210"
};
const smokeProduct = {
  name: `Smoke Product ${timestamp}`,
  slug: `smoke-product-${timestamp}`,
  category: "Fresh Dairy",
  description: "Temporary product for API smoke validation.",
  imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80",
  price: 89,
  unit: "1 pack",
  stock: 11,
  active: true,
  nutritionBadges: ["Smoke Test"]
};

const results = [];
const cleanupState = {
  userId: "",
  productId: "",
  orderId: "",
  subscriptionId: ""
};

function record(step, status, detail = "") {
  results.push({ step, status, detail });
  process.stdout.write(`${status === "pass" ? "PASS" : "FAIL"}  ${step}${detail ? ` :: ${detail}` : ""}\n`);
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`);
  }

  return payload;
}

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);

  if (cleanupState.userId) {
    await Order.deleteMany({ userId: cleanupState.userId });
    await Subscription.deleteMany({ userId: cleanupState.userId });
    await User.deleteOne({ _id: cleanupState.userId });
  }

  if (cleanupState.productId) {
    await Subscription.deleteMany({ productId: cleanupState.productId });
    await Product.deleteOne({ _id: cleanupState.productId });
  }

  await mongoose.disconnect();
}

async function main() {
  try {
    const health = await request("/health");
    record("Server health", health.status === "ok" && health.mongoState === 1 ? "pass" : "fail", JSON.stringify(health));

    const seededAdmin = await request("/api/auth/seed-admin", {
      method: "POST",
      headers: { "x-seed-key": process.env.JWT_SECRET }
    });
    record("Seed admin", "pass", seededAdmin.created ? "created" : "already exists");

    const customerSignup = await request("/api/auth/signup", {
      method: "POST",
      body: {
        ...smokeUser,
        addresses: [
          {
            label: "Home",
            recipientName: smokeUser.name,
            phone: smokeUser.phone,
            line1: "12 Lake View Road",
            city: "Pune",
            state: "MH",
            pincode: "411001"
          }
        ]
      }
    });
    cleanupState.userId = customerSignup.user._id;
    record("Customer signup", "pass", customerSignup.user.email);

    const customerLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: smokeUser.email, password: smokeUser.password }
    });
    const customerToken = customerLogin.token;
    record("Customer login", "pass");

    const authMe = await request("/api/auth/me", { token: customerToken });
    record("Customer session", authMe.user.email === smokeUser.email ? "pass" : "fail");

    const dashboard = await request("/api/dashboard", { token: customerToken });
    record("Dashboard API", dashboard.user?.email === smokeUser.email ? "pass" : "fail");

    const products = await request("/api/products", { token: customerToken });
    record("Products list", products.products.length >= 6 ? "pass" : "fail", `${products.products.length} products`);
    const milk = products.products.find((item) => item.slug === "milk") || products.products[0];
    const secondaryProduct = products.products.find((item) => item.slug !== milk.slug) || milk;

    const searchPayload = await request("/api/products?q=milk&sort=price-asc", { token: customerToken });
    record("Products search/sort", searchPayload.products.length >= 1 ? "pass" : "fail");

    const detail = await request(`/api/products/${milk.slug}`, { token: customerToken });
    record("Product detail", detail.product?.slug === milk.slug ? "pass" : "fail");

    const profileBefore = await request("/api/profile", { token: customerToken });
    record("Profile fetch", profileBefore.profile?.email === smokeUser.email ? "pass" : "fail");

    const profileUpdate = await request("/api/profile", {
      method: "PATCH",
      token: customerToken,
      body: {
        name: "Smoke Customer Updated",
        phone: "9999990000",
        preferences: {
          deliveryNotes: "Ring once",
          newsletter: true
        },
        addresses: [
          {
            label: "Home",
            recipientName: "Smoke Customer Updated",
            phone: "9999990000",
            line1: "12 Lake View Road",
            line2: "Flat 9",
            city: "Pune",
            state: "MH",
            pincode: "411001",
            isDefault: true
          }
        ]
      }
    });
    record("Profile update", profileUpdate.profile?.name === "Smoke Customer Updated" ? "pass" : "fail");

    const rewardsBefore = await request("/api/rewards", { token: customerToken });
    record("Rewards fetch", Array.isArray(rewardsBefore.redeemables) ? "pass" : "fail");

    const createdSubscription = await request("/api/subscriptions", {
      method: "POST",
      token: customerToken,
      body: {
        productId: milk._id,
        quantity: 2,
        frequency: "Daily"
      }
    });
    cleanupState.subscriptionId = createdSubscription.subscription?._id || "";
    record("Create subscription", createdSubscription.subscription?.productId === milk._id ? "pass" : "fail");

    const subscriptions = await request("/api/subscriptions", { token: customerToken });
    record("List subscriptions", subscriptions.subscriptions.length >= 1 ? "pass" : "fail");

    const paused = await request(`/api/subscriptions/${createdSubscription.subscription._id}`, {
      method: "PATCH",
      token: customerToken,
      body: { status: "Paused" }
    });
    record("Pause subscription", paused.subscription?.status === "Paused" ? "pass" : "fail");

    const resumed = await request(`/api/subscriptions/${createdSubscription.subscription._id}`, {
      method: "PATCH",
      token: customerToken,
      body: { status: "Active", quantity: 3, frequency: "Weekly" }
    });
    record("Resume/edit subscription", resumed.subscription?.status === "Active" && resumed.subscription.quantity === 3 ? "pass" : "fail");

    const cancelled = await request(`/api/subscriptions/${createdSubscription.subscription._id}`, {
      method: "PATCH",
      token: customerToken,
      body: { status: "Cancelled" }
    });
    record("Cancel subscription", cancelled.subscription?.status === "Cancelled" ? "pass" : "fail");

    const checkout = await request("/api/cart/checkout", {
      method: "POST",
      token: customerToken,
      body: {
        items: [
          { productId: milk._id, quantity: 1 },
          { productId: secondaryProduct._id, quantity: 1 }
        ],
        paymentMethod: "UPI",
        slot: "7:00 AM - 9:00 AM",
        address: {
          label: "Home",
          recipientName: "Smoke Customer Updated",
          phone: "9999990000",
          line1: "45 River Street",
          line2: "Block B",
          city: "Pune",
          state: "MH",
          pincode: "411045"
        }
      }
    });
    cleanupState.orderId = checkout.order?._id || "";
    record("Checkout / place order", Boolean(checkout.order?._id) ? "pass" : "fail");

    const orders = await request("/api/orders", { token: customerToken });
    record("Orders history", orders.orders.length >= 1 ? "pass" : "fail");

    const orderDetail = await request(`/api/orders/${checkout.order._id}`, { token: customerToken });
    record("Order detail", orderDetail.order?._id === checkout.order._id ? "pass" : "fail");

    const rewardsAfter = await request("/api/rewards", { token: customerToken });
    record("Rewards after order", rewardsAfter.rewards.points >= rewardsBefore.rewards.points ? "pass" : "fail");

    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "admin@aasapure.com", password: "admin123" }
    });
    const adminToken = adminLogin.token;
    record("Admin login", adminLogin.user?.role === "admin" ? "pass" : "fail");

    const adminStats = await request("/api/admin/stats", { token: adminToken });
    record("Admin stats", typeof adminStats.stats?.orders === "number" ? "pass" : "fail");

    const adminOrders = await request("/api/admin/orders", { token: adminToken });
    record("Admin orders", adminOrders.orders.some((item) => item._id === checkout.order._id) ? "pass" : "fail");

    const patchedOrder = await request(`/api/admin/orders/${checkout.order._id}`, {
      method: "PATCH",
      token: adminToken,
      body: {
        status: "Packed",
        slot: "9:00 AM - 11:00 AM",
        rider: {
          name: "Smoke Rider",
          phone: "9000000001"
        }
      }
    });
    record("Admin update order", patchedOrder.order?.status === "Packed" ? "pass" : "fail");

    const adminProducts = await request("/api/admin/products", { token: adminToken });
    record("Admin products", adminProducts.products.length >= 6 ? "pass" : "fail");

    const createdProduct = await request("/api/admin/products", {
      method: "POST",
      token: adminToken,
      body: smokeProduct
    });
    cleanupState.productId = createdProduct.product?._id || "";
    record("Admin add product", createdProduct.product?.slug === smokeProduct.slug ? "pass" : "fail");

    const updatedProduct = await request(`/api/admin/products/${createdProduct.product._id}`, {
      method: "PATCH",
      token: adminToken,
      body: {
        name: `${smokeProduct.name} Updated`,
        stock: 5,
        active: false
      }
    });
    record("Admin edit/disable product", updatedProduct.product?.active === false && updatedProduct.product.stock === 5 ? "pass" : "fail");

    const enabledProduct = await request(`/api/admin/products/${createdProduct.product._id}`, {
      method: "PATCH",
      token: adminToken,
      body: {
        active: true
      }
    });
    record("Admin enable product", enabledProduct.product?.active === true ? "pass" : "fail");

    const adminCustomers = await request(`/api/admin/customers?q=${encodeURIComponent(smokeUser.email)}`, {
      token: adminToken
    });
    record("Admin customers", adminCustomers.customers.some((item) => item.email === smokeUser.email) ? "pass" : "fail");

    const adminSubscriptions = await request("/api/admin/subscriptions", { token: adminToken });
    record("Admin subscriptions", Array.isArray(adminSubscriptions.subscriptions) ? "pass" : "fail");

    const failed = results.filter((item) => item.status === "fail");
    if (failed.length) {
      throw new Error(`${failed.length} smoke checks failed`);
    }

    process.stdout.write(`\nAPI smoke passed: ${results.length} checks\n`);
  } finally {
    await cleanup().catch((error) => {
      process.stderr.write(`Cleanup failed: ${error.message}\n`);
    });
  }
}

main().catch((error) => {
  process.stderr.write(`\nSmoke suite failed: ${error.message}\n`);
  process.exitCode = 1;
});
