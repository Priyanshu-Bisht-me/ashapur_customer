import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  getCartTotal,
  removeCartItem,
  updateCartItemQuantity
} from "../cart/cartStorage";
import { useMemo, useState } from "react";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart());

  const total = useMemo(() => getCartTotal(cart), [cart]);

  function handleQuantityChange(productId, value) {
    setCart(updateCartItemQuantity(productId, value));
  }

  function handleRemove(productId) {
    setCart(removeCartItem(productId));
  }

  if (!cart.items.length) {
    return (
      <section className="cart-page">
        <div className="empty-block">
          <strong>Your cart is empty.</strong>
          <p>Add products from shop to continue checkout.</p>
          <Link to="/customer/shop" className="inline-pill-link">
            Go to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="page-intro">
        <h1>Your cart</h1>
        <p>Adjust quantities or remove items before checkout.</p>
      </div>

      <div className="cart-list">
        {cart.items.map((item) => (
          <article className="cart-row" key={item.productId}>
            <div>
              <strong>{item.productName}</strong>
              <p>{item.unit}</p>
            </div>

            <div className="cart-row__actions">
              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => handleQuantityChange(item.productId, event.target.value)}
                />
              </label>
              <span>Rs. {item.price * item.quantity}</span>
              <button type="button" onClick={() => handleRemove(item.productId)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="cart-summary-card">
        <strong>Total: Rs. {total}</strong>
        <div className="cart-summary-card__actions">
          <Link to="/customer/shop" className="inline-pill-link inline-pill-link--subtle">
            Continue shopping
          </Link>
          <button type="button" onClick={() => navigate("/customer/checkout")}>Proceed to checkout</button>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
