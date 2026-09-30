import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../../context/AuthContext";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const DEMO_ACCOUNTS = [
  { role: "Pet Owner", email: "owner@petcare.lk", pass: "owner123", icon: "🐾" },
  { role: "Doctor / Vet", email: "kasun@petcare.lk", pass: "doctor123", icon: "🩺" },
  { role: "Reception", email: "reception@petcare.lk", pass: "reception123", icon: "📋" },
  { role: "Admin", email: "admin@petcare.lk", pass: "admin123", icon: "⚡" },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { values, setValues, onChange } = useForm({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fillDemo = (acc) => {
    setValues({ email: acc.email, password: acc.pass });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(values);
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        <AuthArt
          welcomeTitle="Welcome to PetCare"
          welcomeSubtitle="For better experience with your pets!"
        />
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Sign In</h2>
              <p>Enter your details to access your pet care dashboard</p>
            </div>

            <Alert>{error}</Alert>

            <form className="auth-form" onSubmit={submit}>
              <Field label="Email Address">
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={onChange}
                  required
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Password">
                <div className="input-password-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={onChange}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </Field>

              <div className="auth-options">
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-accent auth-submit-btn"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Let's Get Started! →</span>
                )}
              </button>

              <div className="auth-switch">
                <span>New to PetCare?</span>{" "}
                <Link to="/register" className="auth-switch-link">
                  Create an account
                </Link>
              </div>

              {/* Quick Fill Demo Helper */}
              <div className="demo-quickfill">
                <div className="demo-quickfill-head">
                  <span className="demo-quickfill-badge">⚡ Quick Fill Demo</span>
                </div>
                <div className="demo-chips">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      className="demo-chip-btn"
                      onClick={() => fillDemo(acc)}
                      title={`Fill as ${acc.role} (${acc.email})`}
                    >
                      <span className="demo-chip-icon">{acc.icon}</span>
                      <span>{acc.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
