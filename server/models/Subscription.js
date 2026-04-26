const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    frequency: {
      type: String,
      trim: true,
      default: "Daily"
    },
    status: {
      type: String,
      trim: true,
      default: "Active"
    },
    nextDeliveryDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: "subscriptions"
  }
);

module.exports =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
