import { useEffect, useState } from "react";
import { adminApi, appointmentApi, petApi, scheduleApi } from "../../api/services";
import { Alert, Chip, Empty, Field, Loader, Modal, prettyDate, todayStr } from "../../components/UI";

const ManageAppointments = () => {
  const [date, setDate] = useState(todayStr());
  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ owner: "", pet: "", doctor: "", date: todayStr(), startTime: "", reason: "", bookingChannel: "phone" });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const load = () => {
    setLoading(true);
    Promise.all([appointmentApi.list({ date }), scheduleApi.vets()])
      .then(([a, v]) => {
        setAppointments(a.data.appointments);
        setVets(v.data.vets);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const openForm = async () => {
    setShowForm(true);
    setError("");
    setSlots([]);
    setForm({ owner: "", pet: "", doctor: "", date, startTime: "", reason: "", bookingChannel: "phone" });
    // receptionists cannot call the admin user list, so owners come from the pet list
    const { data } = await petApi.list();
    setPets(data.pets);
    const unique = [];
    data.pets.forEach((p) => {
      if (p.owner && !unique.find((o) => o._id === p.owner._id)) unique.push(p.owner);
    });
    setOwners(unique);
  };

  const findSlots = async () => {
    if (!form.doctor) return setError("Choose a veterinarian first");
    const { data } = await scheduleApi.availability({ doctor: form.doctor, date: form.date });
    setSlots(data.slots);
    if (!data.slots.length) setError("No free slots that day");
  };

  const book = async (e) => {
    e.preventDefault();
    try {
      await appointmentApi.create({
        pet: form.pet, doctor: form.doctor, date: form.date,
        startTime: form.startTime, reason: form.reason, bookingChannel: form.bookingChannel,
      });
      setShowForm(false);
      setDate(form.date);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (a) => {
    if (!window.confirm(`Cancel ${a.pet?.name}'s visit?`)) return;
    await appointmentApi.cancel(a._id);
    load();
  };

  const mark = async (a, status) => {
    await appointmentApi.setStatus(a._id, status);
    load();
  };

  const ownerPets = pets.filter((p) => p.owner?._id === form.owner);

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Book and manage appointments</h1>
          <p className="muted">For clients who call in or walk through the door.</p>
        </div>
        <div className="row-actions">
          <input type="date" style={{ width: 170 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-accent" onClick={openForm}>New appointment</button>
        </div>
      </div>

      <div className="card">
        <h2>{prettyDate(date)}</h2>
        {loading ? <Loader /> : appointments.length === 0 ? (
          <Empty title="Nothing booked" hint="Create an appointment for a phone or walk-in client." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Vet</th><th>Patient</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.startTime}</strong></td>
                    <td className="small">Dr. {a.doctor?.name}</td>
                    <td>{a.pet?.name}</td>
                    <td className="small">{a.owner?.name}<div className="muted">{a.owner?.phone}</div></td>
                    <td><Chip status={a.status} /></td>
                    <td>
                      {a.status === "Scheduled" && (
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => mark(a, "No-Show")}>No-show</button>
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(a)}>Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="New appointment" onClose={() => setShowForm(false)}>
          <form onSubmit={book}>
            <Alert>{error}</Alert>
            <Field label="Owner">
              <select value={form.owner} onChange={(e) => set({ owner: e.target.value, pet: "" })} required>
                <option value="">Choose the client</option>
                {owners.map((o) => <option key={o._id} value={o._id}>{o.name} — {o.phone || o.email}</option>)}
              </select>
            </Field>
            <Field label="Pet">
              <select value={form.pet} onChange={(e) => set({ pet: e.target.value })} required disabled={!form.owner}>
                <option value="">Choose the pet</option>
                {ownerPets.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.species})</option>)}
              </select>
            </Field>
            <div className="grid-2">
              <Field label="Veterinarian">
                <select value={form.doctor} onChange={(e) => { set({ doctor: e.target.value, startTime: "" }); setSlots([]); }} required>
                  <option value="">Choose a vet</option>
                  {vets.map((v) => <option key={v._id} value={v._id}>Dr. {v.name} — {v.specialisation || "General"}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={form.date} onChange={(e) => { set({ date: e.target.value, startTime: "" }); setSlots([]); }} required />
              </Field>
            </div>

            <button type="button" className="btn btn-ghost" onClick={findSlots}>Show free slots</button>
            {slots.length > 0 && (
              <div className="slot-grid" style={{ margin: "1rem 0" }}>
                {slots.map((s) => (
                  <button key={s.startTime} type="button"
                    className={`slot ${form.startTime === s.startTime ? "selected" : ""}`}
                    onClick={() => set({ startTime: s.startTime })}>{s.startTime}</button>
                ))}
              </div>
            )}

            <div className="grid-2">
              <Field label="Booked by">
                <select value={form.bookingChannel} onChange={(e) => set({ bookingChannel: e.target.value })}>
                  <option value="phone">Phone</option><option value="walk-in">Walk-in</option>
                </select>
              </Field>
              <Field label="Reason"><input value={form.reason} onChange={(e) => set({ reason: e.target.value })} /></Field>
            </div>

            <button className="btn btn-accent btn-block" disabled={!form.startTime}>Confirm booking</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ManageAppointments;
