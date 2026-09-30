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
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        <AuthArt
          welcomeTitle="Reset Password"
          welcomeSubtitle="We'll help you get back to your pets in no time!"
        />
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Account Recovery</h2>
              <p>Enter your registered email address to receive password reset instructions.</p>
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
                <span>Remember your password?</span>{" "}
                <Link to="/login" className="auth-switch-link">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
