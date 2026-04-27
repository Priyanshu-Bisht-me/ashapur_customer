import { useEffect, useMemo, useState } from "react";
import { getAdminOrders, getAdminProducts, getAdminStats } from "../api/adminApi";
import AppStatCard from "../components/AppStatCard";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [statsPayload, ordersPayload, productsPayload] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
        getAdminProducts()
      ]);
      setStats(statsPayload.stats);
      setOrders(ordersPayload.orders);
      setProducts(productsPayload.products);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= 20).slice(0, 6),
    [products]
  );

  if (loading) {
    return <LoaderBlock label="Loading admin dashboard..." />;
  }

  if (error && !stats) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={loadData}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Admin overview"
        title="Dashboard"
        description="High-level operational stats for customers, products, orders, subscriptions, revenue, and stock."
      />

      <div className="metric-grid">
        <AppStatCard label="Customers" value={stats.customers} tone="soft" />
        <AppStatCard label="Products" value={stats.products} />
        <AppStatCard label="Orders" value={stats.orders} />
        <AppStatCard label="Subscriptions" value={stats.activeSubscriptions} tone="accent" />
        <AppStatCard label="Revenue" value={formatCurrency(stats.revenue)} tone="warning" />
        <AppStatCard label="Low stock" value={lowStockProducts.length} />
        <AppStatCard label="Pending orders" value={stats.pendingOrders} />
      </div>

      <div className="content-grid">
        <div className="table-wrap">
          <div className="card-header">
            <div>
              <h2>Recent orders</h2>
              <p>Latest customer orders and live delivery states.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      <div className="table-muted">{order.createdAtLabel}</div>
                    </td>
                    <td>{order.customer?.name || "Customer"}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="card-header">
            <div>
              <h2>Low stock</h2>
              <p>Products that need attention soon.</p>
            </div>
          </div>

          {lowStockProducts.length ? (
            <div className="list-stack">
              {lowStockProducts.map((product) => (
                <article key={product._id} className="list-row">
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.category}</p>
                  </div>
                  <strong>{product.stock} left</strong>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No low stock items" description="Inventory is looking healthy right now." />
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
