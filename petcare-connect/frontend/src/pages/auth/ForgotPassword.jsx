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
        heading="Locked out?"
        lead="Enter the email on your account and we will send a reset link that works for 30 minutes."
        points={["Link expires in 30 minutes", "Old password stops working at once"]}
      />
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <h2>Reset your password</h2>
          <Alert>{state.error}</Alert>
          <Alert type="success">{state.done}</Alert>

          <Field label="Email">
            <input name="email" type="email" value={values.email} onChange={onChange} required />
          </Field>
          <button className="btn btn-accent btn-block" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>

          {state.token && (
            <div className="demo-box">
              Demo mode — the email is simulated. Open{" "}
              <Link to={`/reset-password/${state.token}`}>your reset link</Link>.
            </div>
          )}
          <div className="auth-foot"><Link to="/login">Back to log in</Link></div>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword;
