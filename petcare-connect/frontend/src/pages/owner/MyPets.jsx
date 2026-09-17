import { useEffect, useState } from "react";
import { petApi } from "../../api/services";
import { Alert, Empty, Field, Loader, Modal, useForm } from "../../components/UI";

const blank = { name: "", species: "Dog", breed: "", gender: "Unknown", age: 0, weight: 0, colour: "", notes: "" };

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | pet | "new"
  const [error, setError] = useState("");
  const { values, setValues, onChange } = useForm(blank);

  const load = () =>
    petApi.list({ includeInactive: true }).then(({ data }) => setPets(data.pets)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => { setValues(blank); setEditing("new"); setError(""); };
  const openEdit = (pet) => { setValues({ ...blank, ...pet }); setEditing(pet); setError(""); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...values, age: Number(values.age), weight: Number(values.weight) };
      if (editing === "new") await petApi.create(payload);
      else await petApi.update(editing._id, payload);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (pet) => {
    await petApi.toggle(pet._id);
    load();
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>My pets</h1>
          <p className="muted">Keep species, breed and age current so the vet has the full picture.</p>
        </div>
        <button className="btn btn-accent" onClick={openNew}>Add a pet</button>
      </div>

      {pets.length === 0 ? (
        <Empty title="No pets yet" hint="Add your first pet to start booking visits." action={<button className="btn" onClick={openNew}>Add a pet</button>} />
      ) : (
        <div className="pet-grid">
          {pets.map((p) => (
            <div className={`pet-card ${p.isActive ? "" : "inactive"}`} key={p._id}>
              <div className="pet-emoji">{p.species?.toLowerCase() === "cat" ? "🐱" : p.species?.toLowerCase() === "dog" ? "🐶" : "🐾"}</div>
              <h3>{p.name}</h3>
              <div className="small muted">{p.species}{p.breed && ` · ${p.breed}`}</div>
              <div className="small muted">{p.gender} · {p.age} yr · {p.weight} kg</div>
              {p.notes && <p className="small" style={{ marginTop: ".5rem" }}>{p.notes}</p>}
              <div className="row-actions" style={{ marginTop: ".7rem" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggle(p)}>{p.isActive ? "Deactivate" : "Reactivate"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add a pet" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <Alert>{error}</Alert>
            <div className="grid-2">
              <Field label="Pet name"><input name="name" value={values.name} onChange={onChange} required /></Field>
              <Field label="Species">
                <select name="species" value={values.species} onChange={onChange}>
                  <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                </select>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Breed"><input name="breed" value={values.breed} onChange={onChange} /></Field>
              <Field label="Gender">
                <select name="gender" value={values.gender} onChange={onChange}>
                  <option>Unknown</option><option>Male</option><option>Female</option>
                </select>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Age (years)"><input name="age" type="number" min="0" step="0.5" value={values.age} onChange={onChange} /></Field>
              <Field label="Weight (kg)"><input name="weight" type="number" min="0" step="0.1" value={values.weight} onChange={onChange} /></Field>
            </div>
            <Field label="Colour / markings"><input name="colour" value={values.colour} onChange={onChange} /></Field>
            <Field label="Notes for the vet"><textarea name="notes" value={values.notes} onChange={onChange} /></Field>
            <button className="btn btn-accent btn-block">{editing === "new" ? "Add pet" : "Save changes"}</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default MyPets;
