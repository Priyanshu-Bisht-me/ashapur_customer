import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import { saveSession } from "../auth/authStorage";
import ProductImage from "../components/ProductImage";
import { AUTH_IMAGES } from "../utils/media";
import { pushToast } from "../utils/toastBus";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: ""
  });
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
      const payload = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        addresses: [
          {
            label: "Home",
            recipientName: form.name,
            phone: form.phone,
            line1: form.line1,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            isDefault: true
          }
        ]
      });
      saveSession(payload);
      pushToast({ type: "success", message: "Account created." });
      navigate("/dashboard");
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
            src={AUTH_IMAGES.signup}
            alt="Fresh dairy kitchen"
            className="auth-visual__media"
            imgClassName="auth-visual__image"
            fallbackLabel="Dairy kitchen"
          />
          <div className="auth-visual__content">
            <span className="page-header__eyebrow">Start fresh</span>
            <h2>Set up deliveries in a few calm steps.</h2>
            <p>Create your account, save the first address, and begin ordering daily dairy essentials.</p>
            <div className="auth-visual__points">
              <div>
                <strong>One account</strong>
                <p>Orders, subscriptions, rewards, and preferences stay connected.</p>
              </div>
              <div>
                <strong>Address first</strong>
                <p>Your initial address keeps checkout and recurring delivery setup much smoother.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--wide">
          <div className="auth-panel__header">
            <span className="page-header__eyebrow">Customer signup</span>
            <h1>Create your account</h1>
            <p>Keep it simple: account details first, then the primary delivery address.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="two-col-form">
              <label>
                Name
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                Password
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </label>
              <label>
                Phone
                <input type="text" name="phone" value={form.phone} onChange={handleChange} required />
              </label>
            </div>

            <div className="two-col-form">
              <label className="form-grid__full">
                Address line
                <input type="text" name="line1" value={form.line1} onChange={handleChange} required />
              </label>
              <label>
                City
                <input type="text" name="city" value={form.city} onChange={handleChange} required />
              </label>
              <label>
                State
                <input type="text" name="state" value={form.state} onChange={handleChange} required />
              </label>
              <label>
                Pincode
                <input type="text" name="pincode" value={form.pincode} onChange={handleChange} required />
              </label>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="button button--primary button--full" disabled={busy}>
              {busy ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Already have an account? <Link to="/login">Login</Link>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignupPage;
