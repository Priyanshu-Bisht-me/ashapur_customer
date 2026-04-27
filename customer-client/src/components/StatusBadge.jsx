function normalizeStatus(status = "") {
  return status.toLowerCase().replace(/[^a-z]+/g, "-");
}

function StatusBadge({ status, extraClass = "" }) {
  return (
    <span className={`status-badge status-badge--${normalizeStatus(status)} ${extraClass}`.trim()}>
      {status}
    </span>
  );
}

export default StatusBadge;
