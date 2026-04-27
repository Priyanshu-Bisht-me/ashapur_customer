export function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(0)}`;
}

export function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

export function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

export function getInitials(value = "") {
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "AA";
  }

  return parts.map((part) => part[0].toUpperCase()).join("");
}

export function getTierColor(tier) {
  if (tier === "Gold") {
    return "status-badge--gold";
  }
  if (tier === "Silver") {
    return "status-badge--silver";
  }
  return "status-badge--bronze";
}
