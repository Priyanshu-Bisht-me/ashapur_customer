const mongoose = require("mongoose");

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
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    mobile: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      trim: true,
      default: "customer"
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
