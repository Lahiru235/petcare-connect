import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api/services";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { values, onChange } = useForm({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirm) return setError("Both passwords must match");
    setBusy(true);
    try {
      await authApi.resetPassword(token, { password: values.password });
      navigate("/login", { replace: true });
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
          welcomeTitle="Secure Password"
          welcomeSubtitle="Choose a new safe password for your pet care account."
        />
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Set New Password</h2>
              <p>Please enter and confirm your new password below.</p>
            </div>

            <Alert>{error}</Alert>

            <form className="auth-form" onSubmit={submit}>
              <Field label="New Password">
                <div className="input-password-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={onChange}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </Field>

              <Field label="Confirm New Password">
                <div className="input-password-wrap">
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={values.confirm}
                    onChange={onChange}
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                className="btn btn-accent auth-submit-btn"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Saving Password…</span>
                  </>
                ) : (
                  <span>Save New Password →</span>
                )}
              </button>

              <div className="auth-switch">
                <span>Know your password?</span>{" "}
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

export default ResetPassword;
