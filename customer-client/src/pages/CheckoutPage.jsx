import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCustomerOrder } from "../api/customerApi";
import { getSession } from "../auth/authStorage";
import { clearCart, getCart, getCartTotal } from "../cart/cartStorage";

const PAYMENT_OPTIONS = ["Cash on Delivery", "UPI", "Card"];

function CheckoutPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [cart] = useState(getCart());
  const [address, setAddress] = useState(session?.address || "");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => getCartTotal(cart), [cart]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const order = await createCustomerOrder({
        userId: session?._id,
        items: cart.items,
        address,
        paymentMethod
      });

      clearCart();
      navigate("/customer/orders", {
        state: {
          placedOrderNumber: order.orderNumber
        }
      });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!cart.items.length) {
    return (
      <section className="checkout-page">
        <div className="empty-block">
          <strong>No items in cart.</strong>
          <p>Add products before placing an order.</p>
          <Link to="/customer/shop" className="inline-pill-link">
            Go to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="page-intro">
        <h1>Checkout</h1>
        <p>Confirm delivery details and place your order.</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label>
          Delivery address
          <textarea
            name="address"
            rows="3"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter delivery address"
            required
          />
        </label>

        <label>
          Payment method
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            required
          >
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="checkout-summary">
          <strong>{cart.items.length} item(s)</strong>
          <span>Total payable: Rs. {total}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Placing order..." : "Place order"}
        </button>
      </form>
    </section>
  );
}

export default CheckoutPage;
