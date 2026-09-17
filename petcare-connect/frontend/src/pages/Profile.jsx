import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Alert, Field, useForm } from "../components/UI";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { values, onChange } = useForm({
    name: user.name, phone: user.phone || "", address: user.address || "",
    specialisation: user.specialisation || "", password: "",
  });
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      const data = await updateProfile(payload);
      setMsg({ error: "", ok: data.message });
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Your profile</h1>
        <p className="muted">Email and role are managed by the clinic administrator.</p>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <form onSubmit={submit}>
          <Alert>{msg.error}</Alert>
          <Alert type="success">{msg.ok}</Alert>

          <Field label="Full name"><input name="name" value={values.name} onChange={onChange} required /></Field>
          <div className="grid-2">
            <Field label="Email"><input value={user.email} disabled /></Field>
            <Field label="Role"><input value={user.role} disabled /></Field>
          </div>
          <div className="grid-2">
            <Field label="Phone"><input name="phone" value={values.phone} onChange={onChange} /></Field>
            {user.role === "doctor" && (
              <Field label="Specialisation"><input name="specialisation" value={values.specialisation} onChange={onChange} /></Field>
            )}
          </div>
          <Field label="Address"><input name="address" value={values.address} onChange={onChange} /></Field>
          <Field label="New password (leave blank to keep the current one)">
            <input name="password" type="password" value={values.password} onChange={onChange} minLength={6} />
          </Field>

          <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        </form>
      </div>
    </>
  );
};

export default Profile;
