import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api/services";
import { Alert, Field, useForm } from "../../components/UI";
import AuthArt from "./AuthArt";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { values, onChange } = useForm({ password: "", confirm: "" });
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
    <div className="auth">
      <AuthArt
        heading="Pick a new password"
        lead="Choose something at least six characters long. It is hashed before it reaches the database."
        points={["Stored with bcrypt, never in plain text"]}
      />
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <h2>New password</h2>
          <Alert>{error}</Alert>
          <Field label="New password">
            <input name="password" type="password" value={values.password} onChange={onChange} required minLength={6} />
          </Field>
          <Field label="Repeat new password">
            <input name="confirm" type="password" value={values.confirm} onChange={onChange} required minLength={6} />
          </Field>
          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
          <div className="auth-foot"><Link to="/login">Back to log in</Link></div>
        </form>
      </section>
    </div>
  );
};

export default ResetPassword;
