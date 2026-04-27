function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNextDeliveryDate(frequency) {
  const days = frequency === "Weekly" ? 7 : 1;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(0)}`;
}

function buildOrderNumber() {
  return `AA-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
}

function clampQuantity(value) {
  return Math.max(1, Number(value) || 1);
}

function sanitizeSearchValue(value) {
  return String(value || "").trim();
}

module.exports = {
  buildOrderNumber,
  clampQuantity,
  formatCurrency,
  formatDateLabel,
  getNextDeliveryDate,
  sanitizeSearchValue,
  slugify
};
