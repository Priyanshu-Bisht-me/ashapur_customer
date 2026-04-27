const { formatDateLabel } = require("./helpers");

function serializeAddress(address = {}) {
  return {
    _id: address._id,
    label: address.label || "Home",
    recipientName: address.recipientName || "",
    phone: address.phone || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    isDefault: Boolean(address.isDefault),
    fullAddress: [address.line1, address.line2, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ")
  };
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    rewardPoints: Number(user.rewardPoints || 0),
    addresses: Array.isArray(user.addresses) ? user.addresses.map(serializeAddress) : [],
    preferences: {
      deliveryNotes: user.preferences?.deliveryNotes || "",
      newsletter: Boolean(user.preferences?.newsletter)
    },
    createdAt: user.createdAt
  };
}

function serializeProduct(product) {
  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    price: Number(product.price || 0),
    unit: product.unit || "",
    stock: Number(product.stock || 0),
    active: Boolean(product.active),
    nutritionBadges: Array.isArray(product.nutritionBadges) ? product.nutritionBadges : []
  };
}

function serializeOrder(order) {
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    total: Number(order.total || 0),
    paymentMethod: order.paymentMethod || "Cash on Delivery",
    slot: order.slot || "",
    createdAt: order.createdAt,
    createdAtLabel: formatDateLabel(order.createdAt),
    address: serializeAddress(order.address || {}),
    rider: {
      name: order.rider?.name || "",
      phone: order.rider?.phone || ""
    },
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug || "",
      imageUrl: item.imageUrl || "",
      quantity: Number(item.quantity || 0),
      unit: item.unit || "",
      price: Number(item.price || 0),
      lineTotal: Number(item.lineTotal || 0)
    })),
    timeline: (order.timeline || []).map((item) => ({
      status: item.status,
      note: item.note || "",
      at: item.at,
      atLabel: formatDateLabel(item.at)
    }))
  };
}

function serializeSubscription(subscription) {
  return {
    _id: subscription._id,
    userId: subscription.userId,
    productId: subscription.productId,
    productName: subscription.productName || "",
    imageUrl: subscription.imageUrl || "",
    unit: subscription.unit || "",
    quantity: Number(subscription.quantity || 1),
    frequency: subscription.frequency || "Daily",
    nextDeliveryDate: subscription.nextDeliveryDate,
    nextDeliveryDateLabel: formatDateLabel(subscription.nextDeliveryDate),
    status: subscription.status || "Active"
  };
}

module.exports = {
  serializeAddress,
  serializeOrder,
  serializeProduct,
  serializeSubscription,
  serializeUser
};
