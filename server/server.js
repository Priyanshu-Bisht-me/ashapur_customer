const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const { bootstrapDatabase } = require("./utils/bootstrap");
const { DELIVERY_SLOTS, ORDER_STATUSES } = require("./utils/constants");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable.");
}

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongoState: mongoose.connection.readyState
  });
});

app.get("/api/meta", (req, res) => {
  res.json({
    orderStatuses: ORDER_STATUSES,
    deliverySlots: DELIVERY_SLOTS
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", profileRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
  await bootstrapDatabase();
  console.log("Database bootstrap complete");
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
