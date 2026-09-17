import { useEffect, useState } from "react";
import { appointmentApi, scheduleApi } from "../../api/services";
import { Alert, Chip, Empty, Field, Loader, Modal, prettyDate, todayStr } from "../../components/UI";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [moving, setMoving] = useState(null);
  const [slots, setSlots] = useState([]);
  const [draft, setDraft] = useState({ date: todayStr(), startTime: "" });
  const [error, setError] = useState("");

  const load = () =>
    appointmentApi.list(filter ? { status: filter } : {})
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [filter]);

  const openMove = (a) => {
    setMoving(a);
    setDraft({ date: a.date, startTime: "" });
    setSlots([]);
    setError("");
  };

  const findSlots = async () => {
    const { data } = await scheduleApi.availability({ doctor: moving.doctor._id, date: draft.date });
    setSlots(data.slots);
    if (!data.slots.length) setError("No free slots that day. Try another date.");
  };

  const confirmMove = async () => {
    try {
      await appointmentApi.reschedule(moving._id, { date: draft.date, startTime: draft.startTime });
      setMoving(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (a) => {
    if (!window.confirm(`Cancel ${a.pet.name}'s visit on ${a.date}?`)) return;
    await appointmentApi.cancel(a._id);
    load();
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>My appointments</h1>
          <p className="muted">Reschedule or cancel without calling the clinic.</p>
        </div>
        <select style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-Show</option>
        </select>
      </div>

      <div className="card">
        {appointments.length === 0 ? (
          <Empty title="Nothing here" hint="Book a visit and it will show up in this list." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pet</th><th>Veterinarian</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.pet?.name}</strong></td>
                    <td>Dr. {a.doctor?.name}</td>
                    <td>{prettyDate(a.date)}</td>
                    <td>{a.startTime}–{a.endTime}</td>
                    <td className="small">{a.reason || "—"}</td>
                    <td><Chip status={a.status} /></td>
                    <td>
                      {a.status === "Scheduled" ? (
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openMove(a)}>Reschedule</button>
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(a)}>Cancel</button>
                        </div>
                      ) : <span className="small muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {moving && (
        <Modal title={`Move ${moving.pet.name}'s visit`} onClose={() => setMoving(null)}>
          <Alert>{error}</Alert>
          <Field label="New date">
            <input type="date" min={todayStr()} value={draft.date} onChange={(e) => { setDraft({ ...draft, date: e.target.value, startTime: "" }); setSlots([]); }} />
          </Field>
          <button className="btn btn-ghost" type="button" onClick={findSlots}>Show free slots</button>

          {slots.length > 0 && (
            <div className="slot-grid" style={{ margin: "1rem 0" }}>
              {slots.map((s) => (
                <button key={s.startTime} type="button"
                  className={`slot ${draft.startTime === s.startTime ? "selected" : ""}`}
                  onClick={() => setDraft({ ...draft, startTime: s.startTime })}>
                  {s.startTime}
                </button>
              ))}
            </div>
          )}

          <button className="btn btn-accent btn-block" disabled={!draft.startTime} onClick={confirmMove}>
            Move appointment
          </button>
        </Modal>
      )}
    </>
  );
};

export default MyAppointments;
