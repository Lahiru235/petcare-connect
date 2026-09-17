import { useEffect, useState } from "react";
import { scheduleApi } from "../../api/services";
import { Alert, Empty, Field, Loader, prettyDate, todayStr, useForm } from "../../components/UI";

const VetAvailability = () => {
  const [vets, setVets] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const { values, onChange } = useForm({ date: todayStr(), startTime: "09:00", endTime: "12:00", slotMinutes: 30, isBlocked: "false", note: "" });

  useEffect(() => {
    scheduleApi.vets().then(({ data }) => {
      setVets(data.vets);
      if (data.vets[0]) setDoctor(data.vets[0]._id);
    }).finally(() => setLoading(false));
  }, []);

  const load = (id = doctor) => {
    if (!id) return;
    scheduleApi.list({ doctor: id, from: todayStr(), to: "9999-12-31" }).then(({ data }) => setBlocks(data.schedules));
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

  const remove = async (id) => {
    await scheduleApi.remove(id);
    load();
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Vet availability</h1>
          <p className="muted">Set working hours or block time off. Booked slots come from these blocks.</p>
        </div>
        <select style={{ width: 230 }} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          {vets.map((v) => <option key={v._id} value={v._id}>Dr. {v.name}</option>)}
        </select>
      </div>

      <form className="card" onSubmit={add}>
        <h2>Add a block</h2>
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
        <button className="btn btn-accent">Save block</button>
      </form>

      <div className="card">
        <h2>Upcoming blocks</h2>
        {blocks.length === 0 ? <Empty title="Nothing set" hint="This vet has no working hours from today onward." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Slot</th><th>Note</th><th></th></tr></thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b._id}>
                    <td>{prettyDate(b.date)}</td>
                    <td>{b.startTime}–{b.endTime}</td>
                    <td><span className="chip" style={{ background: b.isBlocked ? "var(--carrot-soft)" : "var(--leaf-soft)" }}>{b.isBlocked ? "Unavailable" : "Working"}</span></td>
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
  );
};

export default VetAvailability;
