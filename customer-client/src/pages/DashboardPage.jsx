import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboard } from "../api/profileApi";
import AppStatCard from "../components/AppStatCard";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/formatters";
import { getProductImage } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function DashboardPage() {
  const navigate = useNavigate();
  const { reorderItems } = useCart();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      setDashboard(await getDashboard());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const savedAddresses = useMemo(() => dashboard?.user?.addresses?.length || 0, [dashboard]);
  const rewardsProgress = useMemo(() => {
    if (!dashboard?.rewards?.nextTierTarget) {
      return 0;
    }

    return Math.min(100, Math.round((dashboard.rewards.points / dashboard.rewards.nextTierTarget) * 100));
  }, [dashboard]);

  const quickLinks = [
    { label: "Browse shop", to: "/shop" },
    { label: "View rewards", to: "/rewards" },
    { label: "Active plans", to: "/subscriptions" },
    { label: "Profile settings", to: "/profile" }
  ];

  function handleReorder(order) {
    reorderItems(order.items);
    pushToast({ type: "success", message: "Items added to cart." });
    navigate("/cart");
  }

  if (loading) {
    return <LoaderBlock label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={loadDashboard}>
            Retry
          </button>
        }
      />
    );
  }

  const latestOrder = dashboard.recentOrders[0] || null;

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Customer dashboard"
        title={`Hello ${dashboard.user.name.split(" ")[0]}`}
        description="Today's delivery, recent activity, and quick actions."
        action={
          <div className="inline-actions">
            <button type="button" className="button button--primary" onClick={() => navigate("/shop")}>
              Shop now
            </button>
            <button type="button" className="button button--ghost" onClick={() => navigate("/subscriptions")}>
              Manage subscriptions
            </button>
          </div>
        }
      />

      <div className="metric-grid">
        <AppStatCard
          label="Today's delivery"
          value={dashboard.todayDelivery ? dashboard.todayDelivery.status : "None"}
          detail={dashboard.todayDelivery ? dashboard.todayDelivery.slot : "No active order"}
          tone="soft"
        />
        <AppStatCard label="Reward points" value={dashboard.rewards.points} tone="accent" />
        <AppStatCard label="Active subscriptions" value={dashboard.activeSubscriptions.length} />
        <AppStatCard
          label="Average order"
          value={formatCurrency(dashboard.spendSummary.averageOrderValue)}
          detail={`${dashboard.spendSummary.totalOrders} total orders`}
          tone="warning"
        />
      </div>

      <div className="dashboard-layout">
        <div className="page-stack">
          <div className="hero-card">
            <div className="hero-card__content">
              <span className="page-header__eyebrow">Latest order</span>
              <h2>
                {latestOrder
                  ? `${latestOrder.orderNumber} is ready whenever you are.`
                  : "Start your first dairy order today."}
              </h2>
              <p>
                {latestOrder
                  ? `Placed on ${latestOrder.createdAtLabel}. Status: ${latestOrder.status}.`
                  : "Browse the shop, add essentials, and checkout in a clean flow."}
              </p>

              {dashboard.todayDelivery ? (
                <p className="meta-note">Today's delivery window: {dashboard.todayDelivery.slot}</p>
              ) : null}

              <div className="pill-row">
                <span className="pill">{dashboard.rewards.tier} rewards tier</span>
                <span className="pill">{dashboard.activeSubscriptions.length} active plan(s)</span>
                <span className="pill">{savedAddresses} saved address(es)</span>
              </div>

              <div className="inline-actions">
                {latestOrder ? (
                  <>
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => handleReorder(latestOrder)}
                    >
                      Reorder
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => navigate(`/orders/${latestOrder._id}`)}
                    >
                      View details
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="button button--primary" onClick={() => navigate("/shop")}>
                      Shop now
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => navigate("/profile")}>
                      Set up profile
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hero-card__kpis">
              <div>
                <span>Saved addresses</span>
                <strong>{savedAddresses}</strong>
              </div>
              <div>
                <span>Total spent</span>
                <strong>{formatCurrency(dashboard.spendSummary.totalSpent)}</strong>
              </div>
              <div>
                <span>Reward tier</span>
                <strong>{dashboard.rewards.tier}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="card-header">
              <div>
                <h2>Quick actions</h2>
                <p>Common next steps.</p>
              </div>
            </div>
            <div className="quick-link-grid">
              {quickLinks.map((link) => (
                <button key={link.to} type="button" className="button button--ghost" onClick={() => navigate(link.to)}>
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                className="button button--ghost"
                onClick={() => dashboard.quickReorder && handleReorder(dashboard.quickReorder)}
                disabled={!dashboard.quickReorder}
              >
                Quick reorder
              </button>
            </div>
          </div>
        </div>

        <div className="page-stack">
          <div className="panel">
            <div className="card-header">
              <div>
                <h2>Active subscriptions</h2>
                <p>Your recurring deliveries.</p>
              </div>
            </div>
            {dashboard.activeSubscriptions.length ? (
              <div className="subscription-list">
                {dashboard.activeSubscriptions.slice(0, 3).map((subscription) => (
                  <article key={subscription._id} className="subscription-card">
                    <div className="subscription-row__head">
                      <div>
                        <h3>{subscription.productName}</h3>
                        <p>
                          {subscription.quantity} x {subscription.unit}
                        </p>
                      </div>
                      <StatusBadge status={subscription.status} />
                    </div>
                    <p>{subscription.frequency} delivery - Next dispatch {subscription.nextDeliveryDateLabel}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No subscriptions yet"
                description="Start a daily plan from any product page."
                action={
                  <Link to="/shop" className="button button--primary">
                    Explore products
                  </Link>
                }
              />
            )}
          </div>

          <div className="panel">
            <div className="card-header">
              <div>
                <h2>Rewards progress</h2>
                <p>Points from recent orders.</p>
              </div>
              <StatusBadge status={dashboard.rewards.tier} />
            </div>
            <div className="summary-lines">
              <div>
                <span>Total points</span>
                <strong>{dashboard.rewards.points}</strong>
              </div>
              <div>
                <span>Next milestone</span>
                <strong>{dashboard.rewards.nextTierTarget}</strong>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-track__fill" style={{ width: `${rewardsProgress}%` }} />
            </div>
            <p className="helper-text">
              {Math.max(0, dashboard.rewards.nextTierTarget - dashboard.rewards.points)} points to the next milestone.
            </p>
          </div>

          <div className="panel">
            <div className="card-header">
              <div>
                <h2>Featured essentials</h2>
                <p>Top picks in stock.</p>
              </div>
            </div>
            <div className="feature-grid">
              {dashboard.featuredProducts.map((product) => (
                <Link key={product._id} to={`/products/${product.slug}`} className="feature-card feature-card--product">
                  <ProductImage
                    src={getProductImage(product)}
                    alt={product.name}
                    className="feature-card__media"
                    imgClassName="media-frame__image"
                    fallbackLabel={product.name}
                    aspectRatio="1 / 1"
                  />
                  <div className="stack-sm">
                    <strong>{product.name}</strong>
                    <p>{product.unit}</p>
                    <strong>{formatCurrency(product.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
