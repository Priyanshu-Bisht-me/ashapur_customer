import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveSession } from "../auth/authStorage";
import ProductImage from "../components/ProductImage";
import { AUTH_IMAGES } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function AdminLoginPage() {
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

      if (payload.user.role !== "admin") {
        throw new Error("This account does not have admin access");
      }

      saveSession(payload);
      pushToast({ type: "success", message: "Admin login successful." });
      navigate("/admin/dashboard");
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
            src={AUTH_IMAGES.admin}
            alt="Dairy operations overview"
            className="auth-visual__media"
            imgClassName="auth-visual__image"
            fallbackLabel="Admin workspace"
          />
          <div className="auth-visual__content">
            <span className="page-header__eyebrow">Admin operations</span>
            <h2>Keep orders, products, and customers easy to manage.</h2>
            <p>A focused admin space for delivery workflows, stock updates, and subscription oversight.</p>
            <div className="auth-visual__points">
              <div>
                <strong>Clean order control</strong>
                <p>Review status, rider details, and delivery windows without a crowded form dump.</p>
              </div>
              <div>
                <strong>Catalog management</strong>
                <p>Add, edit, enable, or disable products from one straightforward workspace.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__header">
            <span className="page-header__eyebrow">Admin login</span>
            <h1>Welcome back</h1>
            <p>Sign in with an admin account to manage orders, products, customers, and subscriptions.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="button button--primary button--full" disabled={busy}>
              {busy ? "Signing in..." : "Login to admin"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">Back to customer login</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminLoginPage;
