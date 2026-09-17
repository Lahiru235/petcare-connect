import { useState } from "react";
import { authApi, petApi } from "../../api/services";
import { Alert, Field, useForm } from "../../components/UI";

// Quick registration for a client standing at the desk: owner account + first pet in one go.
const RegisterWalkIn = () => {
  const { values, onChange, reset } = useForm({
    name: "", email: "", phone: "", address: "", password: "",
    petName: "", species: "Dog", breed: "", age: 0, gender: "Unknown",
  });
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ error: "", ok: "" });

    // keep the receptionist's own session token safe while creating the owner account
    const myToken = localStorage.getItem("pcc_token");
    try {
      const { data } = await authApi.register({
        name: values.name, email: values.email, phone: values.phone,
        address: values.address, password: values.password || "pet12345",
      });
      localStorage.setItem("pcc_token", myToken);

      await petApi.create({
        ownerId: data.user._id, name: values.petName, species: values.species,
        breed: values.breed, gender: values.gender, age: Number(values.age),
      });

      setMsg({ error: "", ok: `${values.name} and ${values.petName} registered. Temporary password: ${values.password || "pet12345"}` });
      reset();
    } catch (err) {
      localStorage.setItem("pcc_token", myToken);
      setMsg({ error: err.message, ok: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Register a walk-in client</h1>
        <p className="muted">Creates the owner account and the first pet profile in one step.</p>
      </div>

      <form className="card" style={{ maxWidth: 680 }} onSubmit={submit}>
        <Alert>{msg.error}</Alert>
        <Alert type="success">{msg.ok}</Alert>

        <h2>Owner</h2>
        <div className="grid-2">
          <Field label="Full name"><input name="name" value={values.name} onChange={onChange} required /></Field>
          <Field label="Phone"><input name="phone" value={values.phone} onChange={onChange} required /></Field>
        </div>
        <div className="grid-2">
          <Field label="Email"><input name="email" type="email" value={values.email} onChange={onChange} required /></Field>
          <Field label="Temporary password"><input name="password" value={values.password} onChange={onChange} placeholder="pet12345" minLength={6} /></Field>
        </div>
        <Field label="Address"><input name="address" value={values.address} onChange={onChange} /></Field>

        <h2 style={{ marginTop: "1.2rem" }}>Pet</h2>
        <div className="grid-2">
          <Field label="Pet name"><input name="petName" value={values.petName} onChange={onChange} required /></Field>
          <Field label="Species">
            <select name="species" value={values.species} onChange={onChange}>
              <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Breed"><input name="breed" value={values.breed} onChange={onChange} /></Field>
          <Field label="Age (years)"><input name="age" type="number" min="0" step="0.5" value={values.age} onChange={onChange} /></Field>
        </div>

        <button className="btn btn-accent" disabled={busy}>{busy ? "Registering…" : "Register client and pet"}</button>
      </form>
    </>
  );
};

export default RegisterWalkIn;
