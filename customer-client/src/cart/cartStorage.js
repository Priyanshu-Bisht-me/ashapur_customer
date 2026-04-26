const CART_STORAGE_KEY = "aasapureCustomerCart";

function parseCart(value) {
  if (!value) {
    return { items: [] };
  }

  try {
    const parsed = JSON.parse(value);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];

    return {
      items: items
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: Number(item.price) || 0,
          unit: item.unit || "",
          quantity: Math.max(1, Number(item.quantity) || 1)
        }))
        .filter((item) => item.productName)
    };
  } catch (error) {
    return { items: [] };
  }
}

export function getCart() {
  return parseCart(localStorage.getItem(CART_STORAGE_KEY));
}

export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(parseCart(JSON.stringify(cart))));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const qty = Math.max(1, Number(quantity) || 1);
  const index = cart.items.findIndex((item) => item.productId === product.productId);

  if (index >= 0) {
    cart.items[index].quantity += qty;
  } else {
    cart.items.push({
      productId: product.productId,
      productName: product.productName,
      price: Number(product.price) || 0,
      unit: product.unit || "",
      quantity: qty
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const qty = Math.max(1, Number(quantity) || 1);

  cart.items = cart.items.map((item) =>
    item.productId === productId ? { ...item, quantity: qty } : item
  );

  saveCart(cart);
  return cart;
}

export function removeCartItem(productId) {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart({ items: [] });
}

export function getCartTotal(cart = getCart()) {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(cart = getCart()) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
