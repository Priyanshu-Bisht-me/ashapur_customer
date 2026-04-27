const ORDER_STATUSES = [
  "Placed",
  "Packed",
  "Assigned",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const TRACKING_STATUSES = ["Placed", "Packed", "Assigned", "Out for Delivery", "Delivered"];
const ACTIVE_ORDER_STATUSES = ["Placed", "Packed", "Assigned", "Out for Delivery"];
const SUBSCRIPTION_STATUSES = ["Active", "Paused", "Cancelled"];
const DELIVERY_SLOTS = [
  "7:00 AM - 9:00 AM",
  "9:00 AM - 11:00 AM",
  "5:00 PM - 7:00 PM"
];
const TAX_RATE = 0.05;

const SEEDED_PRODUCTS = [
  {
    name: "Milk",
    slug: "milk",
    category: "Fresh Dairy",
    description:
      "Morning-fresh cow milk with a smooth finish, perfect for tea, coffee, and daily family nutrition.",
    imageUrl:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",
    price: 60,
    unit: "1 litre",
    stock: 120,
    active: true,
    nutritionBadges: ["Calcium Rich", "Farm Fresh", "Daily Staple"]
  },
  {
    name: "Buffalo Milk",
    slug: "buffalo-milk",
    category: "Fresh Dairy",
    description:
      "Richer and creamier buffalo milk for households that want fuller body, stronger taste, and extra nourishment.",
    imageUrl:
      "https://images.pexels.com/photos/16748187/pexels-photo-16748187.jpeg?auto=compress&cs=tinysrgb&w=1200",
    price: 72,
    unit: "1 litre",
    stock: 84,
    active: true,
    nutritionBadges: ["High Protein", "Creamy Texture", "Premium Choice"]
  },
  {
    name: "Curd",
    slug: "curd",
    category: "Cultured Dairy",
    description:
      "Set fresh every day with a balanced tang, ideal for meals, raita, and probiotic daily routines.",
    imageUrl:
      "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=900&q=80",
    price: 45,
    unit: "500 g",
    stock: 90,
    active: true,
    nutritionBadges: ["Probiotic", "Kitchen Essential", "Fresh Batch"]
  },
  {
    name: "Paneer",
    slug: "paneer",
    category: "Protein",
    description:
      "Soft, clean, high-protein paneer cut fresh for everyday cooking, sandwiches, curries, and snacks.",
    imageUrl:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
    price: 98,
    unit: "200 g",
    stock: 58,
    active: true,
    nutritionBadges: ["High Protein", "Fresh Cut", "No Preservatives"]
  },
  {
    name: "Butter",
    slug: "butter",
    category: "Table Essentials",
    description:
      "Creamy table butter with a rich mouthfeel for toast, parathas, baking, and everyday indulgence.",
    imageUrl:
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=80",
    price: 112,
    unit: "200 g",
    stock: 46,
    active: true,
    nutritionBadges: ["Creamy", "Breakfast Ready", "Family Favourite"]
  },
  {
    name: "Ghee",
    slug: "ghee",
    category: "Premium Pantry",
    description:
      "Slow-crafted desi ghee with a warm aroma and golden finish, made for premium home cooking and rituals.",
    imageUrl:
      "https://images.unsplash.com/photo-1662047102608-a6f2e492411f?auto=format&fit=crop&w=1200&q=80",
    price: 320,
    unit: "500 ml",
    stock: 32,
    active: true,
    nutritionBadges: ["Bilona Style", "Rich Aroma", "Premium Pantry"]
  }
];

module.exports = {
  ACTIVE_ORDER_STATUSES,
  DELIVERY_SLOTS,
  ORDER_STATUSES,
  SEEDED_PRODUCTS,
  SUBSCRIPTION_STATUSES,
  TAX_RATE,
  TRACKING_STATUSES
};
