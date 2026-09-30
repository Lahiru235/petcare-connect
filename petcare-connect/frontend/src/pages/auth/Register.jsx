import { useState } from "react";
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
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

                <Field label="Confirm Password">
                  <div className="input-password-wrap">
                    <input
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={values.confirm}
                      onChange={onChange}
                      required
                      minLength={6}
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
                </Field>
              </div>

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
