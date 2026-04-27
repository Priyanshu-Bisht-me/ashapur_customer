const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const { serializeProduct } = require("../utils/serializers");
const { sanitizeSearchValue } = require("../utils/helpers");

const listProducts = asyncHandler(async (req, res) => {
  const search = sanitizeSearchValue(req.query.q);
  const category = sanitizeSearchValue(req.query.category);
  const sort = sanitizeSearchValue(req.query.sort) || "featured";
  const query = { active: true };

  if (category && category !== "All") {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  let sortQuery = { createdAt: -1 };
  if (sort === "price-asc") {
    sortQuery = { price: 1 };
  } else if (sort === "price-desc") {
    sortQuery = { price: -1 };
  } else if (sort === "name") {
    sortQuery = { name: 1 };
  } else if (sort === "stock") {
    sortQuery = { stock: -1 };
  }

  const [products, categories] = await Promise.all([
    Product.find(query).sort(sortQuery).lean(),
    Product.distinct("category", { active: true })
  ]);

  return res.json({
    categories: ["All", ...categories.filter(Boolean).sort()],
    products: products.map(serializeProduct)
  });
});

const getProductDetail = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const [relatedProducts, subscriptionSummary] = await Promise.all([
    Product.find({
      active: true,
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(3)
      .lean(),
    Subscription.countDocuments({
      productId: product._id,
      status: "Active"
    })
  ]);

  return res.json({
    product: serializeProduct(product),
    relatedProducts: relatedProducts.map(serializeProduct),
    details: {
      popularityNote:
        subscriptionSummary > 0
          ? `${subscriptionSummary} active subscription(s)`
          : "Freshly stocked today",
      benefits: product.nutritionBadges || []
    }
  });
});

module.exports = {
  getProductDetail,
  listProducts
};
