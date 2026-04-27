const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
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
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    addresses: {
      type: [addressSchema],
      default: []
    },
    rewardPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    preferences: {
      deliveryNotes: {
        type: String,
        trim: true,
        default: ""
      },
      newsletter: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

userSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
