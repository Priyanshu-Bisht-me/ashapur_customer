function Modal({ open, title, description, onClose, children, size = "default" }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal modal--${size}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="button button--ghost button--icon" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
