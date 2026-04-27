import { useEffect, useMemo, useState } from "react";

const CART_KEY = "aasapure-cart";
const CART_EVENT = "aasapure-cart-change";

function emitCartChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_EVENT));
  }
}

function normalizeCart(rawCart) {
  const items = Array.isArray(rawCart?.items) ? rawCart.items : [];

  return {
    items: items
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug || "",
        imageUrl: item.imageUrl || "",
        category: item.category || "",
        unit: item.unit || "",
        price: Number(item.price || 0),
        quantity: Math.max(1, Number(item.quantity || 1))
      }))
      .filter((item) => item.productId && item.name)
  };
}

export function readCart() {
  const raw = localStorage.getItem(CART_KEY);

  if (!raw) {
    return { items: [] };
  }

  try {
    return normalizeCart(JSON.parse(raw));
  } catch (error) {
    localStorage.removeItem(CART_KEY);
    return { items: [] };
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
  emitCartChange();
}

export function addCartItem(product, quantity = 1) {
  const next = readCart();
  const qty = Math.max(1, Number(quantity || 1));
  const index = next.items.findIndex((item) => item.productId === product.productId);

  if (index >= 0) {
    next.items[index].quantity += qty;
  } else {
    next.items.push({
      productId: product.productId,
      name: product.name,
      slug: product.slug || "",
      imageUrl: product.imageUrl || "",
      category: product.category || "",
      unit: product.unit || "",
      price: Number(product.price || 0),
      quantity: qty
    });
  }

  writeCart(next);
}

export function updateCartItem(productId, quantity) {
  const next = readCart();
  next.items = next.items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.max(1, Number(quantity || 1)) }
      : item
  );
  writeCart(next);
}

export function removeCartItem(productId) {
  const next = readCart();
  next.items = next.items.filter((item) => item.productId !== productId);
  writeCart(next);
}

export function clearStoredCart() {
  writeCart({ items: [] });
}

export function reorderCartItems(items = []) {
  const next = readCart();

  items.forEach((item) => {
    const index = next.items.findIndex((entry) => entry.productId === item.productId);

    if (index >= 0) {
      next.items[index].quantity += Math.max(1, Number(item.quantity || 1));
    } else {
      next.items.push({
        productId: item.productId,
        name: item.name,
        slug: item.slug || "",
        imageUrl: item.imageUrl || "",
        category: item.category || "",
        unit: item.unit || "",
        price: Number(item.price || 0),
        quantity: Math.max(1, Number(item.quantity || 1))
      });
    }
  });

  writeCart(next);
}

export function useCart() {
  const [cart, setCart] = useState(readCart());

  useEffect(() => {
    const sync = () => setCart(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function addItem(product, quantity = 1) {
    addCartItem(product, quantity);
  }

  function updateItem(productId, quantity) {
    updateCartItem(productId, quantity);
  }

  function removeItem(productId) {
    removeCartItem(productId);
  }

  function clearCart() {
    clearStoredCart();
  }

  function reorderItems(items = []) {
    reorderCartItems(items);
  }

  const totals = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      count,
      subtotal
    };
  }, [cart]);

  return {
    cart,
    items: cart.items,
    count: totals.count,
    subtotal: totals.subtotal,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    reorderItems
  };
}
