import { useEffect, useState } from "react";
import { adminApi, scheduleApi } from "../../api/services";
import { Alert, Empty, Field, Loader, Stat, prettyDate, todayStr, useForm } from "../../components/UI";

const VetManagement = () => {
  const [vets, setVets] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const { values, onChange } = useForm({ date: todayStr(), startTime: "09:00", endTime: "12:00", slotMinutes: 30, isBlocked: "false", note: "" });

  useEffect(() => {
    adminApi.users({ role: "doctor" }).then(({ data }) => {
      setVets(data.users);
      if (data.users[0]) setDoctor(data.users[0]._id);
    }).finally(() => setLoading(false));
  }, []);

  const load = () => {
    if (!doctor) return;
    scheduleApi.list({ doctor, from: todayStr(), to: "9999-12-31" }).then(({ data }) => setBlocks(data.schedules));
  };

  useEffect(() => { load(); }, [doctor]);

  const add = async (e) => {
    e.preventDefault();
    try {
      const { data } = await scheduleApi.create({
        doctor, date: values.date, startTime: values.startTime, endTime: values.endTime,
        slotMinutes: Number(values.slotMinutes), isBlocked: values.isBlocked === "true", note: values.note,
      });
      setMsg({ error: "", ok: data.message });
      load();
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
    }
  };

  const remove = async (id) => { await scheduleApi.remove(id); load(); };

  if (loading) return <Loader />;

  const current = vets.find((v) => v._id === doctor);

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Veterinarian management</h1>
          <p className="muted">Roster, specialisations and working hours.</p>
        </div>
        <select style={{ width: 240 }} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          {vets.map((v) => <option key={v._id} value={v._id}>Dr. {v.name}</option>)}
        </select>
      </div>

      {vets.length === 0 ? (
        <Empty title="No veterinarians yet" hint="Create a doctor account from User management first." />
      ) : (
        <>
          <div className="stat-grid">
            <Stat value={vets.length} label="Vets on the roster" />
            <Stat value={current?.specialisation || "General"} label="Specialisation" tone="accent" />
            <Stat value={current?.licenseNo || "—"} label="Licence" tone="sky" />
            <Stat value={`Rs ${current?.consultationFee || 0}`} label="Consultation fee" tone="warn" />
          </div>

          <form className="card" onSubmit={add}>
            <h2>Add working hours or leave</h2>
            <Alert>{msg.error}</Alert>
            <Alert type="success">{msg.ok}</Alert>
            <div className="grid-2">
              <Field label="Date"><input name="date" type="date" min={todayStr()} value={values.date} onChange={onChange} required /></Field>
              <Field label="Type">
                <select name="isBlocked" value={values.isBlocked} onChange={onChange}>
                  <option value="false">Working hours</option>
                  <option value="true">Unavailable</option>
                </select>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="From"><input name="startTime" type="time" value={values.startTime} onChange={onChange} required /></Field>
              <Field label="To"><input name="endTime" type="time" value={values.endTime} onChange={onChange} required /></Field>
            </div>
            <div className="grid-2">
              <Field label="Slot length (minutes)">
                <select name="slotMinutes" value={values.slotMinutes} onChange={onChange}>
                  <option value={15}>15</option><option value={20}>20</option><option value={30}>30</option><option value={45}>45</option><option value={60}>60</option>
                </select>
              </Field>
              <Field label="Note"><input name="note" value={values.note} onChange={onChange} /></Field>
            </div>
            <button className="btn btn-accent">Save</button>
          </form>

          <div className="card">
            <h2>Schedule from today</h2>
            {blocks.length === 0 ? <Empty title="No hours set" /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Slot</th><th>Note</th><th></th></tr></thead>
                  <tbody>
                    {blocks.map((b) => (
                      <tr key={b._id}>
                        <td>{prettyDate(b.date)}</td>
                        <td>{b.startTime}–{b.endTime}</td>
                        <td>{b.isBlocked ? "Unavailable" : "Working"}</td>
                        <td>{b.isBlocked ? "—" : `${b.slotMinutes} min`}</td>
                        <td className="small">{b.note || "—"}</td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => remove(b._id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default VetManagement;
