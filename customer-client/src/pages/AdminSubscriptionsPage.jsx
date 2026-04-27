import { useEffect, useState } from "react";
import { getAdminSubscriptions } from "../api/adminApi";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadSubscriptions(nextStatus = status) {
    setLoading(true);
    setError("");

    try {
      const payload = await getAdminSubscriptions(nextStatus ? { status: nextStatus } : {});
      setSubscriptions(payload.subscriptions);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  if (loading) {
    return <LoaderBlock label="Loading subscriptions..." />;
  }

  if (error && !subscriptions.length) {
    return (
      <EmptyState
        title="Subscriptions unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={() => loadSubscriptions(status)}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Recurring delivery oversight"
        title="Subscriptions"
        description="Review real subscription records from the database in a compact table."
      />

      <div className="table-wrap">
        <div className="table-tools">
          <div>
            <h2>Subscription list</h2>
            <p className="table-muted">Customer, product, frequency, next date, and current status.</p>
          </div>
          <div className="toolbar__group">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button type="button" className="button button--primary" onClick={() => loadSubscriptions(status)}>
              Apply
            </button>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Frequency</th>
                <th>Quantity</th>
                <th>Next date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td>{subscription.customer?.name || "Customer"}</td>
                  <td>{subscription.productName}</td>
                  <td>{subscription.frequency}</td>
                  <td>{subscription.quantity}</td>
                  <td>{subscription.nextDeliveryDateLabel}</td>
                  <td>
                    <StatusBadge status={subscription.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminSubscriptionsPage;
