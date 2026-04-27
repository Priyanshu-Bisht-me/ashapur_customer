const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      trim: true,
      default: "1 unit"
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    nutritionBadges: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "products"
  }
);

productSchema.index({ active: 1, category: 1, name: 1 });

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);
