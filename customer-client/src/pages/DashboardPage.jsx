import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import { getCustomerDashboard } from "../api/customerApi";
import { getSession } from "../auth/authStorage";

function DashboardPage() {
  const session = getSession();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getCustomerDashboard(session._id);
        setDashboard(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [session?._id]);

  if (isLoading) {
    return <div className="dashboard-state">Loading customer dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-state dashboard-state--error">{error}</div>;
  }

  const todayDelivery = dashboard?.todayDelivery;
  const activeSubscriptions = dashboard?.activeSubscriptions || [];
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <span className="hero-panel__eyebrow">Welcome back</span>
          <h1>{dashboard?.user?.name || session?.name}</h1>
          <p>
            Your customer space keeps deliveries, routine subscriptions and order
            history in one focused place.
          </p>
        </div>
        <div className="hero-panel__badge">
          <strong>{activeSubscriptions.length}</strong>
          <span>Active subscriptions</span>
        </div>
      </section>

      <div className="dashboard-grid dashboard-grid--primary">
        <DashboardCard title="Today's delivery" action={todayDelivery?.status || "Not scheduled"} accent="highlight">
          {todayDelivery ? (
            <div className="delivery-stack">
              <strong>{todayDelivery.title}</strong>
              <p>{todayDelivery.description}</p>
              <small>
                ETA: {todayDelivery.deliveryWindow} | Total: Rs. {todayDelivery.totalAmount}
              </small>
            </div>
          ) : (
            <div className="empty-block">
              <strong>No delivery scheduled for today.</strong>
              <p>New orders and subscription deliveries will appear here.</p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Active subscriptions"
          action={`${activeSubscriptions.length} live`}
        >
          <div className="stack-list">
            {activeSubscriptions.length ? (
              activeSubscriptions.map((subscription) => (
                <div key={subscription._id} className="stack-list__row">
                  <div>
                    <strong>{subscription.productName}</strong>
                    <p>
                      {subscription.quantity} unit(s) | {subscription.frequency}
                    </p>
                  </div>
                  <span>{subscription.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-block">
                <strong>No active subscriptions yet.</strong>
                <p>Once you start one, the next delivery date will show here.</p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Quick actions">
        <div className="quick-actions">
          <button type="button" onClick={() => navigate("/customer/shop")}>Browse products</button>
          <button type="button" onClick={() => navigate("/customer/orders")}>Track deliveries</button>
          <button type="button" onClick={() => navigate("/customer/checkout")}>Checkout now</button>
          <button type="button" onClick={() => navigate("/customer/cart")}>View cart</button>
        </div>
      </DashboardCard>

      <DashboardCard title="Recent orders" action={`${recentOrders.length} shown`}>
        {recentOrders.length ? (
          <div className="orders-table">
            <div className="orders-table__head">
              <span>Order</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
            </div>
            {recentOrders.map((order) => (
              <div key={order._id} className="orders-table__row">
                <span>{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                <span>{order.deliveryDateLabel}</span>
                <span>Rs. {order.totalAmount}</span>
                <span>{order.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-block">
            <strong>No recent orders yet.</strong>
            <p>Orders will appear here as soon as the customer starts buying.</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

export default DashboardPage;
