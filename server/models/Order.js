const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orderNumber: {
      type: String,
      trim: true,
      default: ""
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        productName: {
          type: String,
          trim: true,
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        },
        price: {
          type: Number,
          default: 0
        },
        unit: {
          type: String,
          trim: true,
          default: ""
        }
      }
    ],
    totalAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      trim: true,
      default: "Placed"
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Cash on Delivery"
    },
    deliveryDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: "orders"
  }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
