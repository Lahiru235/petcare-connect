import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/services";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const ForgotPassword = () => {
  const { values, onChange } = useForm({ email: "" });
  const [state, setState] = useState({ error: "", done: "", token: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await authApi.forgotPassword(values);
      setState({ error: "", done: data.message, token: data.resetToken || "" });
    } catch (err) {
      setState({ error: err.message, done: "", token: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthArt
        eyebrow="Account Recovery"
        heading="Need help accessing your account?"
        lead="Enter your registered email address and we'll send a secure password reset link valid for 30 minutes."
        points={[
          "Instant secure link delivery",
          "Link expires safely after 30 minutes",
          "Your current data remains completely protected",
        ]}
      />
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Reset your password</h2>
            <p>We will email you instructions to safely reset your account password.</p>
          </div>

          <Alert>{state.error}</Alert>
          <Alert type="success">{state.done}</Alert>

          <form className="auth-form" onSubmit={submit}>
            <Field label="Registered Email Address">
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

            <button
              type="submit"
              className="btn btn-accent auth-submit-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Sending Link…</span>
                </>
              ) : (
                <span>Send Reset Link →</span>
              )}
            </button>

            {state.token && (
              <div className="demo-quickfill">
                <div className="demo-quickfill-head">
                  <span className="demo-quickfill-badge">⚡ Demo Reset Link</span>
                </div>
                <p className="demo-reset-text">
                  Simulation link ready:{" "}
                  <Link to={`/reset-password/${state.token}`} className="auth-switch-link">
                    Click here to reset password
                  </Link>
                </p>
              </div>
            )}

            <div className="auth-switch">
              <span>Remembered your password?</span>{" "}
              <Link to="/login" className="auth-switch-link">
                Back to log in
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
