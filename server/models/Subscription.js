const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productName: {
      type: String,
      trim: true,
      default: ""
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    unit: {
      type: String,
      trim: true,
      default: ""
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly"],
      default: "Daily"
    },
    nextDeliveryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Cancelled"],
      default: "Active",
      index: true
    }
  },
  {
    timestamps: true,
    collection: "subscriptions"
  }
);

subscriptionSchema.index({ userId: 1, status: 1, nextDeliveryDate: 1 });

module.exports =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
