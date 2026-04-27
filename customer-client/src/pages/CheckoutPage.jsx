import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkout } from "../api/orderApi";
import { getMeta } from "../api/productApi";
import { getProfile } from "../api/profileApi";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

const PAYMENT_METHODS = ["UPI", "Card", "Cash on Delivery"];

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [meta, setMeta] = useState({ deliverySlots: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [slot, setSlot] = useState("");
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    async function loadCheckoutData() {
      setLoading(true);
      setError("");

      try {
        const [profilePayload, metaPayload] = await Promise.all([getProfile(), getMeta()]);
        setProfile(profilePayload.profile);
        setMeta(metaPayload);
        const defaultAddress = profilePayload.profile.addresses.find((address) => address.isDefault);
        setSelectedAddressId(defaultAddress?._id || profilePayload.profile.addresses[0]?._id || "");
        setSlot(metaPayload.deliverySlots[0] || "");
        setNewAddress((current) => ({
          ...current,
          recipientName: profilePayload.profile.name || "",
          phone: profilePayload.profile.phone || ""
        }));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, []);

  const tax = useMemo(() => subtotal * 0.05, [subtotal]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add products to your cart before continuing."
        action={
          <Link to="/shop" className="button button--primary">
            Go to shop
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <LoaderBlock label="Preparing checkout..." />;
  }

  if (error && !profile) {
    return (
      <EmptyState
        title="Checkout unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        }
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const payload = await checkout({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        addressId: useNewAddress ? undefined : selectedAddressId,
        address: useNewAddress ? newAddress : undefined,
        paymentMethod,
        slot
      });
      clearCart();
      pushToast({ type: "success", message: "Order placed successfully." });
      navigate(`/orders/${payload.order._id}`);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Checkout"
        title="Confirm your order"
        description="Address, delivery slot, payment method, and summary in one straightforward flow."
      />

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="page-stack">
          <section className="panel">
            <div className="card-header">
              <div>
                <h2>Address</h2>
                <p>Select a saved address or add a new one</p>
              </div>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setUseNewAddress((current) => !current)}
              >
                {useNewAddress ? "Use saved address" : "Add new address"}
              </button>
            </div>

            {profile.addresses.length && !useNewAddress ? (
              <div className="selection-grid">
                {profile.addresses.map((address) => (
                  <button
                    key={address._id}
                    type="button"
                    className={`option-card ${selectedAddressId === address._id ? "option-card--active" : ""}`}
                    onClick={() => setSelectedAddressId(address._id)}
                  >
                    <strong>{address.label}</strong>
                    <p>{address.recipientName}</p>
                    <p>{address.fullAddress}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="address-form-grid">
                <label>
                  Label
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(event) => setNewAddress((current) => ({ ...current, label: event.target.value }))}
                  />
                </label>
                <label>
                  Recipient name
                  <input
                    type="text"
                    value={newAddress.recipientName}
                    onChange={(event) =>
                      setNewAddress((current) => ({ ...current, recipientName: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(event) => setNewAddress((current) => ({ ...current, phone: event.target.value }))}
                    required
                  />
                </label>
                <label className="form-grid__full">
                  Address line 1
                  <input
                    type="text"
                    value={newAddress.line1}
                    onChange={(event) => setNewAddress((current) => ({ ...current, line1: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Address line 2
                  <input
                    type="text"
                    value={newAddress.line2}
                    onChange={(event) => setNewAddress((current) => ({ ...current, line2: event.target.value }))}
                  />
                </label>
                <label>
                  City
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  State
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(event) => setNewAddress((current) => ({ ...current, state: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Pincode
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(event) => setNewAddress((current) => ({ ...current, pincode: event.target.value }))}
                    required
                  />
                </label>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="card-header">
              <div>
                <h2>Delivery slot</h2>
                <p>Choose your preferred time</p>
              </div>
            </div>
            <div className="option-grid">
              {meta.deliverySlots.map((slotOption) => (
                <button
                  key={slotOption}
                  type="button"
                  className={`option-card ${slot === slotOption ? "option-card--active" : ""}`}
                  onClick={() => setSlot(slotOption)}
                >
                  <strong>{slotOption}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="card-header">
              <div>
                <h2>Payment</h2>
                <p>Select a payment method</p>
              </div>
            </div>
            <div className="option-grid">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`option-card ${paymentMethod === method ? "option-card--active" : ""}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <strong>{method}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="summary-card">
          <div className="card-header">
            <div>
              <h2>Order summary</h2>
              <p>
                {items.length} item{items.length === 1 ? "" : "s"} ready to confirm
              </p>
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
                    <p>
                      {item.quantity} x {item.unit}
                    </p>
                  </div>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
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

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="button button--primary button--full" disabled={busy}>
            {busy ? "Placing order..." : "Confirm order"}
          </button>
        </aside>
      </form>
    </section>
  );
}

export default CheckoutPage;
