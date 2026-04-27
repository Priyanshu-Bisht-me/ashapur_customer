import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrder } from "../api/orderApi";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

const TRACKING_STEPS = ["Placed", "Packed", "Assigned", "Out for Delivery", "Delivered"];

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reorderItems } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      const payload = await getOrder(id);
      setOrder(payload.order);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) {
    return <LoaderBlock label="Loading order..." />;
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error || "We couldn't load this order."}
        action={
          <Link to="/orders" className="button button--primary">
            Back to orders
          </Link>
        }
      />
    );
  }

  function handleReorder() {
    reorderItems(order.items);
    pushToast({ type: "success", message: "Order added back to cart." });
    navigate("/cart");
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Order tracking"
        title={order.orderNumber}
        description={`Placed on ${order.createdAtLabel}`}
        meta={<StatusBadge status={order.status} />}
      />

      <div className="detail-layout">
        <div className="timeline-card">
          <div className="card-header">
            <div>
              <h2>Tracking timeline</h2>
              <p>
                {order.status === "Delivered" ? "Delivered successfully." : `Estimated delivery window: ${order.slot}`}
              </p>
            </div>
          </div>

          <ol className="timeline">
            {TRACKING_STEPS.map((step) => {
              const matched = order.timeline.find((item) => item.status === step);
              const tone = matched ? (order.status === step ? "timeline-step__marker--active" : "timeline-step__marker--done") : "";

              return (
                <li key={step} className="timeline-step">
                  <span className={`timeline-step__marker ${tone}`.trim()} />
                  <div className="timeline-step__content">
                    <strong>{step}</strong>
                    <p>{matched?.note || "Waiting for update"}</p>
                    <span className="helper-text">{matched?.atLabel || "Pending"}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          {order.rider?.name ? (
            <div className="panel">
              <strong>Delivery rider</strong>
              <p>{order.rider.name}</p>
              <p>{order.rider.phone}</p>
            </div>
          ) : null}
        </div>

        <aside className="summary-card">
          <div className="card-header">
            <div>
              <h2>Order summary</h2>
              <p>{order.address.fullAddress}</p>
            </div>
          </div>

          <div className="list-stack">
            {order.items.map((item) => (
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
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </article>
            ))}
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(order.subtotal)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{formatCurrency(order.tax)}</strong>
            </div>
            <div className="summary-lines__total">
              <span>Total</span>
              <strong className="summary-total">{formatCurrency(order.total)}</strong>
            </div>
          </div>

          <div className="summary-card__actions">
            <button type="button" className="button button--ghost" onClick={() => navigate("/orders")}>
              Back
            </button>
            <button type="button" className="button button--primary" onClick={handleReorder}>
              Reorder
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default OrderDetailPage;
