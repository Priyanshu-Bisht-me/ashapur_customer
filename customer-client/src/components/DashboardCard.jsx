function DashboardCard({ title, action, children, accent = "default" }) {
  return (
    <section className={`dashboard-card dashboard-card--${accent}`}>
      <div className="dashboard-card__header">
        <h2>{title}</h2>
        {action ? <span>{action}</span> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default DashboardCard;
