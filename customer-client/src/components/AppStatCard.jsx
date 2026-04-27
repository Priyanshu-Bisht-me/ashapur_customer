function AppStatCard({ label, value, detail, tone = "default" }) {
  return (
    <article className={`metric-card metric-card--${tone}`.trim()}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      {detail ? <small className="metric-card__detail">{detail}</small> : null}
    </article>
  );
}

export default AppStatCard;
