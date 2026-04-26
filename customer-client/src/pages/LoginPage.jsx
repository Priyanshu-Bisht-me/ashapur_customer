import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthIntro from "../components/AuthIntro";
import { loginCustomer } from "../api/customerApi";
import { saveSession } from "../auth/authStorage";

const initialForm = {
  email: "",
  password: ""
};

function LoginPage() {
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
      const user = await loginCustomer(form);
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
        title="A cleaner customer entry point"
        description="This is a fresh React setup for customers, inspired by the stronger stitched screens and disconnected from the old page logic."
      />

      <section className="auth-panel">
        <div className="auth-panel__header">
          <span className="auth-panel__tag">Customer Login</span>
          <h2>Welcome back</h2>
          <p>Sign in to see deliveries, subscriptions and recent orders.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-panel__footer">
          New here? <Link to="/customer/signup">Create a customer account</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
