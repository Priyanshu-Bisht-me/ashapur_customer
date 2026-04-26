import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCustomerOrders } from "../api/customerApi";
import { getSession } from "../auth/authStorage";

function OrdersPage() {
  const session = getSession();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await getCustomerOrders(session?._id);
        setOrders(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [session?._id]);

  if (isLoading) {
    return <div className="dashboard-state">Loading order history...</div>;
  }

  if (error) {
    return <div className="dashboard-state dashboard-state--error">{error}</div>;
  }

  return (
    <section className="orders-page">
      <div className="page-intro">
        <h1>Order history</h1>
        <p>Track all customer orders from newest to oldest.</p>
      </div>

      {location.state?.placedOrderNumber ? (
        <p className="orders-success-banner">
          Order placed successfully: {location.state.placedOrderNumber}
        </p>
      ) : null}

      {orders.length ? (
        <div className="orders-history-list">
          {orders.map((order) => (
            <article key={order._id} className="orders-history-card">
              <div className="orders-history-card__head">
                <div>
                  <strong>{order.orderNumber || order._id}</strong>
                  <p>{order.deliveryDateLabel}</p>
                </div>
                <span className="order-status-chip">{order.status}</span>
              </div>

              <ul>
                {order.items.map((item, index) => (
                  <li key={`${order._id}-${index}`}>
                    {item.productName} x {item.quantity} - Rs. {item.price * item.quantity}
                  </li>
                ))}
              </ul>

              <div className="orders-history-card__footer">
                <span>Total: Rs. {order.totalAmount}</span>
                <span>Payment: {order.paymentMethod}</span>
                <Link to={`/customer/track/${order._id}`} className="inline-pill-link">
                  Track order
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-block">
          <strong>No orders yet.</strong>
          <p>Your placed orders will appear here.</p>
          <Link to="/customer/shop" className="inline-pill-link">
            Start shopping
          </Link>
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
