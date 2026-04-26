function AuthIntro({ title, description }) {
  return (
    <section className="auth-intro">
      <div className="auth-intro__badge">Aasapure Customer</div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="auth-intro__feature-list">
        <div>
          <strong>Fresh daily delivery</strong>
          <span>Milk, paneer, curd and essentials curated for repeat households.</span>
        </div>
        <div>
          <strong>One place for routine buying</strong>
          <span>Track deliveries, manage subscriptions and reorder without friction.</span>
        </div>
        <div>
          <strong>Calm dashboard</strong>
          <span>Built from the strongest screens in the stitched concepts, not their old code.</span>
        </div>
      </div>
    </section>
  );
}

export default AuthIntro;
