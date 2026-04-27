import { useEffect, useState } from "react";
import { getRewards } from "../api/profileApi";
import AppStatCard from "../components/AppStatCard";
import EmptyState from "../components/EmptyState";
import LoaderBlock from "../components/LoaderBlock";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { formatDate, getTierColor } from "../utils/formatters";

function RewardsPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRewards() {
    setLoading(true);
    setError("");

    try {
      setPayload(await getRewards());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  if (loading) {
    return <LoaderBlock label="Loading rewards..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Rewards unavailable"
        description={error}
        action={
          <button type="button" className="button button--primary" onClick={loadRewards}>
            Retry
          </button>
        }
      />
    );
  }

  const rewards = payload.rewards;
  const redeemables = payload.redeemables || [];
  const milestones = [
    { tier: "Bronze", pointsRequired: 0 },
    { tier: "Silver", pointsRequired: 500 },
    { tier: "Gold", pointsRequired: 1200 }
  ];
  const currentTierIndex = ["Bronze", "Silver", "Gold"].indexOf(rewards.tier);

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Loyalty and points"
        title="Rewards"
        description="Points, tier, and recent activity."
      />

      <div className="metric-grid">
        <AppStatCard label="Points" value={rewards.points} tone="soft" />
        <AppStatCard label="Tier" value={rewards.tier} tone="accent" />
        <AppStatCard label="Progress" value={`${rewards.progress}%`} />
        <AppStatCard label="Next target" value={rewards.nextTierTarget} tone="warning" />
      </div>

      <div className="content-grid">
        <div className="panel rewards-panel">
          <div className="card-header">
            <div>
              <h2>Tier progress</h2>
              <p>Current tier and next unlock.</p>
            </div>
            <StatusBadge status={rewards.tier} extraClass={getTierColor(rewards.tier)} />
          </div>

          <div className="progress-track">
            <div className="progress-track__fill" style={{ width: `${rewards.progress}%` }} />
          </div>
          <p className="helper-text">
            {Math.max(0, rewards.nextTierTarget - rewards.points)} points to the next milestone.
          </p>

          <div className="milestone-strip">
            {milestones.map((milestone, index) => (
              <article
                key={milestone.tier}
                className={`milestone-strip__item ${index === currentTierIndex ? "milestone-strip__item--active" : ""}`}
              >
                <strong>{milestone.tier}</strong>
                <span>{milestone.pointsRequired} pts</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel rewards-panel">
          <div className="card-header">
            <div>
              <h2>Redeem suggestions</h2>
              <p>Suggested redemptions.</p>
            </div>
          </div>

          {redeemables.length ? (
            <div className="reward-offer-grid">
              {redeemables.map((item) => {
                const isUnlocked = rewards.points >= item.pointsRequired;
                const status = isUnlocked ? "Unlocked" : "Keep earning";

                return (
                  <article key={item.title} className="reward-offer">
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.pointsRequired} points required</p>
                    </div>
                    <StatusBadge status={status} />
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No redeem suggestions" description="Redeem options will appear here when available." />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="card-header">
          <div>
            <h2>Milestone tiers</h2>
            <p>Tier milestones.</p>
          </div>
        </div>

        <div className="list-stack">
          {milestones.map((milestone) => (
            <article key={milestone.tier} className="list-row">
              <div>
                <strong>{milestone.tier}</strong>
                <p>{milestone.pointsRequired} points</p>
              </div>
              <StatusBadge
                status={rewards.points >= milestone.pointsRequired ? "Unlocked" : "Keep earning"}
                extraClass={milestone.tier === rewards.tier ? getTierColor(milestone.tier) : ""}
              />
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="card-header">
          <div>
            <h2>Reward history</h2>
            <p>Points earned from recent orders</p>
          </div>
        </div>

        {rewards.history.length ? (
          <div className="list-stack">
            {rewards.history.map((item) => (
              <article key={item.orderId} className="list-row">
                <div>
                  <strong>{item.orderNumber}</strong>
                  <p>{`${item.status} - ${formatDate(item.createdAt)}`}</p>
                </div>
                <strong>+{item.pointsEarned} pts</strong>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No reward history yet" description="Your points activity will appear here." />
        )}
      </div>
    </section>
  );
}

export default RewardsPage;
