import { useEffect, useState } from "react";
import { appointmentApi, scheduleApi } from "../../api/services";
import { Alert, Chip, Field, Loader, Modal, addDays, prettyDate, todayStr, useForm } from "../../components/UI";

const MySchedule = () => {
  const [from, setFrom] = useState(todayStr());
  const [appointments, setAppointments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBlock, setShowBlock] = useState(false);
  const [error, setError] = useState("");
  const { values, onChange } = useForm({ date: todayStr(), startTime: "09:00", endTime: "12:00", note: "" });

  const to = (() => {
    const d = new Date(`${from}T00:00:00`);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  const load = () => {
    setLoading(true);
    Promise.all([appointmentApi.list({ from, to }), scheduleApi.list({ from, to })])
      .then(([a, s]) => {
        setAppointments(a.data.appointments);
        setBlocks(s.data.schedules);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [from]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${from}T00:00:00`);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const addBlock = async (e) => {
    e.preventDefault();
    try {
      await scheduleApi.create({ ...values, isBlocked: true });
      setShowBlock(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>My schedule</h1>
          <p className="muted">Week of {prettyDate(from)} — {prettyDate(to)}</p>
        </div>
        <div className="row-actions">
          <input type="date" style={{ width: 170 }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={() => setFrom(todayStr())}>This week</button>
          <button className="btn btn-accent btn-sm" onClick={() => { setShowBlock(true); setError(""); }}>Block time off</button>
        </div>
      </div>

      {loading ? <Loader /> : days.map((day) => {
        const dayAppointments = appointments.filter((a) => a.date === day);
        const dayBlocks = blocks.filter((b) => b.date === day);
        const working = dayBlocks.filter((b) => !b.isBlocked);
        const off = dayBlocks.filter((b) => b.isBlocked);

        return (
          <div className="card" key={day}>
            <div className="card-head">
              <h2>{new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short" })}</h2>
              <span className="small muted">
                {working.length ? working.map((w) => `${w.startTime}–${w.endTime}`).join(" · ") : "No working hours set"}
                {off.length ? ` · off ${off.map((o) => `${o.startTime}–${o.endTime}`).join(", ")}` : ""}
              </span>
            </div>

            {dayAppointments.length === 0 ? (
              <p className="small muted">No appointments.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Time</th><th>Patient</th><th>Owner</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {dayAppointments.map((a) => (
                      <tr key={a._id}>
                        <td><strong>{a.startTime}–{a.endTime}</strong></td>
                        <td>{a.pet?.name} <span className="small muted">({a.pet?.species})</span></td>
                        <td className="small">{a.owner?.name}</td>
                        <td className="small">{a.reason || "—"}</td>
                        <td><Chip status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {showBlock && (
        <Modal title="Block time off" onClose={() => setShowBlock(false)}>
          <form onSubmit={addBlock}>
            <Alert>{error}</Alert>
            <Field label="Date"><input name="date" type="date" min={todayStr()} value={values.date} onChange={onChange} required /></Field>
            <div className="grid-2">
              <Field label="From"><input name="startTime" type="time" value={values.startTime} onChange={onChange} required /></Field>
              <Field label="To"><input name="endTime" type="time" value={values.endTime} onChange={onChange} required /></Field>
            </div>
            <Field label="Reason (optional)"><input name="note" value={values.note} onChange={onChange} placeholder="Surgery, training, leave…" /></Field>
            <button className="btn btn-accent btn-block">Save block</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default MySchedule;
