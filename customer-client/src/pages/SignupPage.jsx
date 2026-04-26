import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthIntro from "../components/AuthIntro";
import { signupCustomer } from "../api/customerApi";
import { saveSession } from "../auth/authStorage";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: ""
};

function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await signupCustomer(form);
      saveSession(user);
      navigate("/customer/dashboard");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthIntro
        title="Customer signup, rebuilt cleanly"
        description="The new flow keeps only the screen intent from the original concepts: warm entry, simple fields and a fast path into the dashboard."
      />

      <section className="auth-panel">
        <div className="auth-panel__header">
          <span className="auth-panel__tag">Customer Signup</span>
          <h2>Create your account</h2>
          <p>We’ll save you as a customer automatically.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </label>

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
              placeholder="Choose a password"
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
            />
          </label>

          <label>
            Address
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Delivery address"
              rows="3"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Signup"}
          </button>
        </form>

        <p className="auth-panel__footer">
          Already registered? <Link to="/customer/login">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default SignupPage;
