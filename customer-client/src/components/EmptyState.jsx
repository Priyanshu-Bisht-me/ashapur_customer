function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">A</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action || null}
    </div>
  );
}

export default EmptyState;
