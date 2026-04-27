function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats = [],
  image,
  imageAlt = "",
  tone = "default",
  compact = false
}) {
  return (
    <section className={`page-hero page-hero--${tone} ${compact ? "page-hero--compact" : ""}`.trim()}>
      <div className="page-hero__content">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
        {stats.length ? (
          <div className="page-hero__stats">
            {stats.map((item) => (
              <article key={item.label} className="hero-stat">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                {item.detail ? <small>{item.detail}</small> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
      {image ? (
        <div className="page-hero__media">
          <img src={image} alt={imageAlt} />
        </div>
      ) : null}
    </section>
  );
}

export default PageHero;
