import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../../context/AuthContext";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { values, onChange } = useForm({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="auth">
      <AuthArt
        eyebrow="Welcome back to your care desk"
        heading="Everything your pet needs, right when you need it."
        lead="Book trusted veterinary care, follow upcoming visits, and keep your pet’s health history close at hand."
        points={["See real-time appointment availability", "Keep every pet record together", "Get reminders before each visit"]}
      />
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <h2>Log in</h2>
          <p className="muted small">Use the account the clinic gave you, or the one you signed up with.</p>
          <Alert>{error}</Alert>

          <Field label="Email">
            <input name="email" type="email" value={values.email} onChange={onChange} required placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" value={values.password} onChange={onChange} required minLength={6} />
          </Field>

          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>

          <div className="auth-foot">
            <Link to="/forgot-password">Forgot your password?</Link>
            <div>New here? <Link to="/register">Create a pet owner account</Link></div>
          </div>

          <div className="demo-box">
            Demo accounts (after <code>npm run seed</code>):<br />
            owner@petcare.lk / owner123 · kasun@petcare.lk / doctor123<br />
            reception@petcare.lk / reception123 · admin@petcare.lk / admin123
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
