function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || user.mobile || "",
    address: user.address || "",
    role: user.role || "customer",
    createdAt: user.createdAt
  };
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

module.exports = {
  sanitizeUser,
  formatDateLabel
};
