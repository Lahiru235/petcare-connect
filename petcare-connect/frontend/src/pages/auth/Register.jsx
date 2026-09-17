import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { values, onChange } = useForm({ name: "", email: "", phone: "", address: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (values.password !== values.confirm) return setError("Both passwords must match");
    setBusy(true);
    try {
      await register({
        name: values.name, email: values.email, phone: values.phone,
        address: values.address, password: values.password,
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
        eyebrow="A calmer way to manage pet care"
        heading="Build a healthier routine for every pet you love."
        lead="Create your owner account to organise profiles, book clinic visits, and follow your pet’s care from one place."
        points={["Create a profile for each pet", "Book visits around your schedule", "Keep treatment history available"]}
      />
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <h2>Create your account</h2>
          <p className="muted small">Clinic staff accounts are created by the administrator.</p>
          <Alert>{error}</Alert>

          <Field label="Full name">
            <input name="name" value={values.name} onChange={onChange} required />
          </Field>
          <div className="grid-2">
            <Field label="Email">
              <input name="email" type="email" value={values.email} onChange={onChange} required />
            </Field>
            <Field label="Phone">
              <input name="phone" value={values.phone} onChange={onChange} placeholder="07X XXX XXXX" />
            </Field>
          </div>
          <Field label="Address">
            <input name="address" value={values.address} onChange={onChange} />
          </Field>
          <div className="grid-2">
            <Field label="Password">
              <input name="password" type="password" value={values.password} onChange={onChange} required minLength={6} />
            </Field>
            <Field label="Repeat password">
              <input name="confirm" type="password" value={values.confirm} onChange={onChange} required minLength={6} />
            </Field>
          </div>

          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
          <div className="auth-foot">Already registered? <Link to="/login">Log in</Link></div>
        </form>
      </section>
    </div>
  );
};

export default Register;
