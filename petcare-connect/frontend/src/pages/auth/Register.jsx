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
    <div className="auth">
      <AuthArt
        eyebrow="Join PetCare Connect"
        heading="Build a healthier routine for every pet you love."
        lead="Create your owner account to organise profiles, book veterinary visits, and follow your pet’s complete health records from one place."
        points={[
          "Custom health passport for each pet",
          "Direct appointment booking with top vets",
          "Permanent medical history & treatment records",
        ]}
      />
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create an account</h2>
            <p>Sign up as a pet parent to book visits and track care.</p>
          </div>

          <Alert>{error}</Alert>

          <form className="auth-form" onSubmit={submit}>
            <Field label="Full Name">
              <input
                name="name"
                value={values.name}
                onChange={onChange}
                required
                placeholder="e.g. Sarah Mitchell"
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
                  placeholder="sarah@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  name="phone"
                  value={values.phone}
                  onChange={onChange}
                  placeholder="07X XXX XXXX"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <Field label="Home Address (Optional)">
              <input
                name="address"
                value={values.address}
                onChange={onChange}
                placeholder="Street address, City"
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
                    placeholder="Re-enter password"
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
                <span>Create Account →</span>
              )}
            </button>

            <div className="auth-switch">
              <span>Already registered?</span>{" "}
              <Link to="/login" className="auth-switch-link">
                Log in here
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Register;
