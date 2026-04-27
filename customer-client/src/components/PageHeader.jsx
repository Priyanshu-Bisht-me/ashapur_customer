function PageHeader({ eyebrow, title, description, action, meta }) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <div className="page-header__title-row">
          <h1>{title}</h1>
          {meta || null}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="page-header__actions">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
