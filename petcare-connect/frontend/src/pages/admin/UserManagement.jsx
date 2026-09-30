import { useEffect, useState } from "react";
import { adminApi } from "../../api/services";
import { Alert, Empty, Field, Loader, Modal, prettyDate, useForm } from "../../components/UI";

const blank = { name: "", email: "", password: "", role: "receptionist", phone: "", specialisation: "", licenseNo: "", consultationFee: 0 };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const { values, setValues, onChange } = useForm(blank);

  const load = () => {
    setLoading(true);
    adminApi.users({ ...(role && { role }), ...(search && { search }) })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [role, search]);

  const openNew = () => { setValues(blank); setEditing("new"); setError(""); };
  const openEdit = (u) => { setValues({ ...blank, ...u, password: "" }); setEditing(u); setError(""); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...values, consultationFee: Number(values.consultationFee) };
      if (editing === "new") await adminApi.createUser(payload);
      else {
        if (!payload.password) delete payload.password;
        await adminApi.updateUser(editing._id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (u) => {
    try {
      await adminApi.toggleUser(u._id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>User management</h1>
          <p className="muted">Create staff accounts, change roles, deactivate people who leave.</p>
        </div>
        <div className="row-actions">
          <input style={{ width: 200 }} placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={{ width: 160 }} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="owner">Pet owners</option>
            <option value="doctor">Veterinarians</option>
            <option value="receptionist">Reception</option>
            <option value="admin">Admins</option>
          </select>
          <button className="btn btn-accent" onClick={openNew}>Add account</button>
        </div>
      </div>

      <div className="card">
        {loading ? <Loader /> : users.length === 0 ? <Empty title="No accounts match" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong>{u.specialisation && <div className="small muted">{u.specialisation}</div>}</td>
                    <td className="small">{u.email}</td>
                    <td><span className="chip">{u.role}</span></td>
                    <td className="small">{u.phone || "—"}</td>
                    <td className="small">{prettyDate(u.createdAt?.slice(0, 10))}</td>
                    <td><span className="chip" style={{ background: u.isActive ? "var(--leaf-soft)" : "var(--danger-soft)", color: u.isActive ? "var(--forest)" : "var(--danger)" }}>{u.isActive ? "Active" : "Disabled"}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggle(u)}>{u.isActive ? "Deactivate" : "Activate"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Add an account" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <Alert>{error}</Alert>
            <div className="grid-2">
              <Field label="Full name"><input name="name" value={values.name} onChange={onChange} required /></Field>
              <Field label="Role">
                <select name="role" value={values.role} onChange={onChange}>
                  <option value="owner">Pet owner</option>
                  <option value="doctor">Veterinarian</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Administrator</option>
                </select>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Email"><input name="email" type="email" value={values.email} onChange={onChange} required /></Field>
              <Field label="Phone"><input name="phone" value={values.phone} onChange={onChange} /></Field>
            </div>
            <Field label={editing === "new" ? "Password" : "New password (blank keeps the current one)"}>
              <input name="password" type="password" value={values.password} onChange={onChange} minLength={6} required={editing === "new"} />
            </Field>

            {values.role === "doctor" && (
              <>
                <div className="grid-2">
                  <Field label="Specialisation"><input name="specialisation" value={values.specialisation} onChange={onChange} placeholder="Surgery, Dermatology…" /></Field>
                  <Field label="Licence number"><input name="licenseNo" value={values.licenseNo} onChange={onChange} /></Field>
                </div>
                <Field label="Consultation fee (LKR)"><input name="consultationFee" type="number" min="0" value={values.consultationFee} onChange={onChange} /></Field>
              </>
            )}

            <button className="btn btn-accent btn-block">{editing === "new" ? "Create account" : "Save changes"}</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default UserManagement;
