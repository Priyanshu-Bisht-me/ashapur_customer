function MetricCard({ label, value, detail, accent = "mint" }) {
  return (
    <article className={`metric-card metric-card--${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

export default MetricCard;
