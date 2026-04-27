const mongoose = require("mongoose");

const addressSnapshotSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: "Home"
    },
    recipientName: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    line1: {
      type: String,
      trim: true,
      default: ""
    },
    line2: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      default: ""
    },
    state: {
      type: String,
      trim: true,
      default: ""
    },
    pincode: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    slug: {
      type: String,
      trim: true,
      default: ""
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    },
    unit: {
      type: String,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    lineTotal: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      trim: true,
      required: true
    },
    at: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    subtotal: {
      type: Number,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      min: 0,
      default: 0
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Cash on Delivery"
    },
    address: {
      type: addressSnapshotSchema,
      default: {}
    },
    slot: {
      type: String,
      trim: true,
      default: "7:00 AM - 9:00 AM"
    },
    status: {
      type: String,
      enum: ["Placed", "Packed", "Assigned", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
      index: true
    },
    rider: {
      name: {
        type: String,
        trim: true,
        default: ""
      },
      phone: {
        type: String,
        trim: true,
        default: ""
      }
    },
    timeline: {
      type: [timelineEventSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "orders"
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
