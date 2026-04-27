const PRODUCT_IMAGE_MAP = {
  milk:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80",
  "buffalo-milk":
    "https://images.pexels.com/photos/16748187/pexels-photo-16748187.jpeg?auto=compress&cs=tinysrgb&w=1200",
  curd:
    "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=80",
  paneer:
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
  butter:
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=80",
  ghee:
    "https://images.unsplash.com/photo-1662047102608-a6f2e492411f?auto=format&fit=crop&w=1200&q=80"
};

const CATEGORY_IMAGE_MAP = {
  "Fresh Dairy":
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80",
  "Cultured Dairy":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
  Protein:
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
  "Table Essentials":
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=80",
  "Premium Pantry":
    "https://images.unsplash.com/photo-1662047102608-a6f2e492411f?auto=format&fit=crop&w=1200&q=80"
};

export const AUTH_IMAGES = {
  customer:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1400&q=80",
  signup:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1400&q=80",
  admin:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1400&q=80"
};

export const PAGE_IMAGES = {
  dashboard:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1400&q=80",
  shop:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1400&q=80",
  subscriptions:
    "https://images.unsplash.com/photo-1627483298428-1807fe32d6cc?auto=format&fit=crop&w=1400&q=80",
  rewards:
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1400&q=80",
  profile:
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80",
  admin:
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1400&q=80"
};

export function getCategoryImage(category = "") {
  return CATEGORY_IMAGE_MAP[category] || CATEGORY_IMAGE_MAP["Fresh Dairy"];
}

export function getProductImage(product = {}) {
  return (
    product.imageUrl ||
    PRODUCT_IMAGE_MAP[product.slug] ||
    PRODUCT_IMAGE_MAP[String(product.name || "").toLowerCase().replace(/\s+/g, "-")] ||
    getCategoryImage(product.category)
  );
}
