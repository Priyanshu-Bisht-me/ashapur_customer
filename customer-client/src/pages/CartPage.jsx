import { Link, useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import QuantityStepper from "../components/QuantityStepper";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";

function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, updateItem, removeItem } = useCart();
  const deliveryFee = subtotal > 0 ? 0 : 0;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + tax;

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products from the shop to continue."
        action={
          <Link to="/shop" className="button button--primary">
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Shopping cart"
        title="Review your cart"
        description="Adjust quantities, remove items, and keep the checkout path simple."
      />

      <div className="cart-layout">
        <div className="panel">
          <div className="card-header">
            <div>
              <h2>Selected items</h2>
              <p>{items.length} product{items.length === 1 ? "" : "s"} selected</p>
            </div>
          </div>

          <div className="list-stack">
            {items.map((item) => (
              <article key={item.productId} className="cart-row">
                <div className="cart-row__info">
                  <ProductImage
                    src={getProductImage(item)}
                    alt={item.name}
                    className="cart-thumb"
                    imgClassName="media-frame__image"
                    fallbackLabel={item.name}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.unit}</p>
                  </div>
                </div>
                <div className="cart-row__actions">
                  <QuantityStepper value={item.quantity} onChange={(value) => updateItem(item.productId, value)} />
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  <button type="button" className="button button--link" onClick={() => removeItem(item.productId)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="summary-card">
          <div className="card-header">
            <div>
              <h2>Totals</h2>
              <p>Simple summary before checkout</p>
            </div>
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            <div className="summary-lines__total">
              <span>Total</span>
              <strong className="summary-total">{formatCurrency(grandTotal)}</strong>
            </div>
          </div>

          <p className="helper-text">Delivery is included for this academic project flow.</p>

          <div className="summary-card__actions">
            <Link to="/shop" className="button button--ghost">
              Continue shopping
            </Link>
            <button type="button" className="button button--primary" onClick={() => navigate("/checkout")}>
              Checkout
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
