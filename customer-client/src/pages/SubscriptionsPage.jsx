import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSubscriptions, updateSubscription } from "../api/subscriptionApi";
import AppStatCard from "../components/AppStatCard";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const subscriptionPayload = await getSubscriptions();
      setSubscriptions(subscriptionPayload.subscriptions);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const grouped = useMemo(
    () => ({
      active: subscriptions.filter((item) => item.status === "Active"),
      paused: subscriptions.filter((item) => item.status === "Paused")
    }),
    [subscriptions]
  );

  async function handleUpdate(subscription, payload, successMessage) {
    setBusyKey(subscription._id);

    try {
      await updateSubscription(subscription._id, payload);
      pushToast({ type: "success", message: successMessage });
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  if (loading) {
    return <LoaderBlock label="Loading subscriptions..." />;
  }

  if (error && !subscriptions.length) {
    return (
      <EmptyState
        title="Subscriptions unavailable"
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
        eyebrow="Recurring plans"
        title="Subscriptions"
        description="Pause, resume, or cancel recurring deliveries."
        action={
          <Link to="/shop" className="button button--primary">
            Browse products
          </Link>
        }
      />

      <div className="metric-grid">
        <AppStatCard label="Active plans" value={grouped.active.length} tone="soft" />
        <AppStatCard label="Paused plans" value={grouped.paused.length} tone="warning" />
        <AppStatCard
          label="Next delivery"
          value={grouped.active[0]?.nextDeliveryDateLabel || "Not scheduled"}
          detail={grouped.active[0]?.productName || ""}
        />
        <AppStatCard label="Total plans" value={subscriptions.length} tone="accent" />
      </div>

      <div className="panel">
        <div className="card-header">
          <div>
            <h2>Current plans</h2>
            <p>Your active and paused plans.</p>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {subscriptions.length ? (
          <div className="subscription-list">
            {subscriptions.map((subscription) => (
              <article key={subscription._id} className="subscription-card">
                <div className="subscription-row__head">
                  <div className="mini-media-row">
                    <ProductImage
                      src={getProductImage(subscription)}
                      alt={subscription.productName}
                      className="mini-thumb"
                      imgClassName="media-frame__image"
                      fallbackLabel={subscription.productName}
                    />
                    <div>
                      <h3>{subscription.productName}</h3>
                      <p>
                        {subscription.quantity} x {subscription.unit}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>

                <div className="summary-lines">
                  <div>
                    <span>Frequency</span>
                    <strong>{subscription.frequency}</strong>
                  </div>
                  <div>
                    <span>Next delivery date</span>
                    <strong>{subscription.nextDeliveryDateLabel}</strong>
                  </div>
                </div>

                <div className="inline-actions">
                  {subscription.status === "Active" ? (
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={busyKey === subscription._id}
                      onClick={() => handleUpdate(subscription, { status: "Paused" }, "Subscription paused.")}
                    >
                      Pause
                    </button>
                  ) : null}
                  {subscription.status === "Paused" ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      disabled={busyKey === subscription._id}
                      onClick={() => handleUpdate(subscription, { status: "Active" }, "Subscription resumed.")}
                    >
                      Resume
                    </button>
                  ) : null}
                  {subscription.status !== "Cancelled" ? (
                    <button
                      type="button"
                      className="button button--link"
                      disabled={busyKey === subscription._id}
                      onClick={() => handleUpdate(subscription, { status: "Cancelled" }, "Subscription cancelled.")}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active plans yet"
            description="Create a subscription from a product detail page when you want automatic delivery."
            action={
              <Link to="/shop" className="button button--primary">
                Go to shop
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}

export default SubscriptionsPage;
