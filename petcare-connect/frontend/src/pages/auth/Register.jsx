import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { values, onChange } = useForm({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Password requirements evaluation
  const passwordCriteria = useMemo(() => {
    const pwd = values.password || "";
    return [
      { id: "length", label: "At least 8 characters", valid: pwd.length >= 8 },
      { id: "upper", label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(pwd) },
      { id: "lower", label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(pwd) },
      { id: "number", label: "At least one number (0-9)", valid: /[0-9]/.test(pwd) },
      { id: "special", label: "At least one special symbol (!@#$%^&*)", valid: /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/.test(pwd) },
    ];
  }, [values.password]);

  const metCount = passwordCriteria.filter((c) => c.valid).length;
  const isPasswordValid = metCount === passwordCriteria.length;

  const strengthStatus = useMemo(() => {
    if (!values.password) return { label: "Empty", percent: 0, className: "strength-weak" };
    if (metCount <= 2) return { label: "Weak", percent: 35, className: "strength-weak" };
    if (metCount <= 4) return { label: "Moderate", percent: 70, className: "strength-medium" };
    return { label: "Strong", percent: 100, className: "strength-strong" };
  }, [values.password, metCount]);

  const passwordsMatch = Boolean(values.confirm && values.password === values.confirm);
  const confirmHasValue = Boolean(values.confirm && values.confirm.length > 0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setShowRequirements(true);
      return setError("Please ensure your password fulfills all required conditions highlighted in red.");
    }

    if (values.password !== values.confirm) {
      return setError("Both passwords must match");
    }

    setBusy(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        password: values.password,
      });
      navigate("/owner", { replace: true });
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
          welcomeTitle="Join PetCare"
          welcomeSubtitle="For better experience with your pets!"
          petImage="/assets/auth-cat.jpg"
          petAlt="Adorable cute cat"
        />
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Sign Up</h2>
              <p>Create your owner account to schedule appointments and follow pet care</p>
            </div>

            <Alert>{error}</Alert>

            <form className="auth-form" onSubmit={submit}>
              <Field label="Full Name">
                <input
                  name="name"
                  value={values.name}
                  onChange={onChange}
                  required
                  placeholder="Full Name"
                  autoComplete="name"
                />
              </Field>

              <div className="grid-2">
                <Field label="Email Address">
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={onChange}
                    required
                    placeholder="Email Address"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    name="phone"
                    value={values.phone}
                    onChange={onChange}
                    placeholder="Phone (e.g. 077 123 4567)"
                    autoComplete="tel"
                  />
                </Field>
              </div>

              <Field label="Home Address (Optional)">
                <input
                  name="address"
                  value={values.address}
                  onChange={onChange}
                  placeholder="City / Street address"
                  autoComplete="street-address"
                />
              </Field>

              <div className="grid-2">
                <Field label="Password">
                  <div className="input-password-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={onChange}
                      onFocus={() => setShowRequirements(true)}
                      onBlur={() => {
                        if (!values.password) setShowRequirements(false);
                      }}
                      required
                      minLength={8}
                      placeholder="Min 8 characters"
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

                <Field label="Confirm Password">
                  <div className="input-password-wrap">
                    <input
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={values.confirm}
                      onChange={onChange}
                      onFocus={() => setShowRequirements(true)}
                      onBlur={() => {
                        if (!values.password && !values.confirm) setShowRequirements(false);
                      }}
                      required
                      minLength={8}
                      placeholder="Confirm password"
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
                  {confirmHasValue && (
                    <div className={`confirm-match-badge ${passwordsMatch ? "matched" : "unmatched"}`}>
                      <span>{passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}</span>
                    </div>
                  )}
                </Field>
              </div>

              {/* Password conditions section: only shown when user clicks/focuses password or has entered text */}
              {(showRequirements || values.password.length > 0) && (
                <div className="password-conditions-box">
                  <div className="conditions-header">
                    <span>Password Requirements:</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                      {values.password ? `${strengthStatus.label} (${metCount}/${passwordCriteria.length})` : "Enter password"}
                    </span>
                  </div>

                  <div className="password-strength-bar">
                    <div
                      className={`password-strength-fill ${strengthStatus.className}`}
                      style={{ width: `${strengthStatus.percent}%` }}
                    />
                  </div>

                  <div className="conditions-grid">
                    {passwordCriteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className={`condition-badge ${criterion.valid ? "condition-valid" : "condition-invalid"}`}
                      >
                        <span className="condition-icon">{criterion.valid ? "✓" : "✕"}</span>
                        <span className="condition-text">{criterion.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-accent auth-submit-btn"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <span>Let's Get Started! →</span>
                )}
              </button>

              <div className="auth-switch">
                <span>Already a member?</span>{" "}
                <Link to="/login" className="auth-switch-link">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
