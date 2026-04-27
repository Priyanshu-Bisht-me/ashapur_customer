import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../api/orderApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { pushToast } from "../utils/toastBus";

function OrdersPage() {
  const navigate = useNavigate();
  const { reorderItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const payload = await getOrders();
      setOrders(payload.orders);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function handleReorder(order) {
    reorderItems(order.items);
    pushToast({ type: "success", message: "Order added back to cart." });
    navigate("/cart");
  }

  if (loading) {
    return <LoaderBlock label="Loading orders..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load orders"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={loadOrders}>
            Retry
          </button>
        }
      />
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your completed checkouts will show here."
        action={
          <Link to="/shop" className="button button--primary">
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Order history"
        title="Your orders"
        description="Recent orders with quick reorder."
      />

      <div className="orders-list">
        {orders.map((order) => (
          <article key={order._id} className="order-card">
            <div className="order-row__head">
              <div>
                <h3>{order.orderNumber}</h3>
                <p>{order.createdAtLabel}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="pill-row">
              {order.items.map((item) => (
                <span key={`${order._id}-${item.productId}`} className="pill">
                  {item.name} x {item.quantity}
                </span>
              ))}
            </div>

            <div className="split-actions">
              <strong className="price-highlight">{formatCurrency(order.total)}</strong>
              <div className="inline-actions">
                <Link to={`/orders/${order._id}`} className="button button--ghost">
                  View details
                </Link>
                <button type="button" className="button button--secondary" onClick={() => handleReorder(order)}>
                  Reorder
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OrdersPage;
