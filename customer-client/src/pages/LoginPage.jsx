import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveSession } from "../auth/authStorage";
import ProductImage from "../components/ProductImage";
import { AUTH_IMAGES } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const payload = await login(form);
      saveSession(payload);
      pushToast({ type: "success", message: "Welcome back." });
      navigate(payload.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-visual">
          <ProductImage
            src={AUTH_IMAGES.customer}
            alt="Fresh dairy bottles"
            className="auth-visual__media"
            imgClassName="auth-visual__image"
            fallbackLabel="Fresh dairy"
          />
          <div className="auth-visual__content">
            <span className="page-header__eyebrow">Fresh every morning</span>
            <h2>Simple milk delivery for daily homes.</h2>
            <p>Track orders, manage subscriptions, and reorder essentials in a calm customer space.</p>
            <div className="auth-visual__points">
              <div>
                <strong>Daily essentials</strong>
                <p>Milk, curd, paneer, butter, and ghee in one tidy flow.</p>
              </div>
              <div>
                <strong>Quick account access</strong>
                <p>Your orders, rewards, and preferences stay aligned with real backend data.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__header">
            <span className="page-header__eyebrow">Customer login</span>
            <h1>Welcome back</h1>
            <p>Sign in to manage deliveries, subscriptions, rewards, and your saved addresses.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="button button--primary button--full" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              New customer? <Link to="/signup">Create account</Link>
            </span>
            <Link to="/admin/login">Admin login</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
