import { useEffect, useState } from "react";
import { appointmentApi, scheduleApi } from "../../api/services";
import { Chip, Loader, prettyDate, todayStr } from "../../components/UI";

const AllSchedules = () => {
  const [date, setDate] = useState(todayStr());
  const [vets, setVets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([scheduleApi.vets(), appointmentApi.list({ date }), scheduleApi.list({ date })])
      .then(([v, a, s]) => {
        setVets(v.data.vets);
        setAppointments(a.data.appointments);
        setBlocks(s.data.schedules);
      })
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>All schedules</h1>
          <p className="muted">Every vet's day on one screen — {prettyDate(date)}</p>
        </div>
        <input type="date" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {loading ? <Loader /> : vets.map((v) => {
        const mine = appointments.filter((a) => a.doctor?._id === v._id);
        const hours = blocks.filter((b) => b.doctor?._id === v._id && !b.isBlocked);
        const off = blocks.filter((b) => b.doctor?._id === v._id && b.isBlocked);

        return (
          <div className="card" key={v._id}>
            <div className="card-head">
              <div>
                <h2>Dr. {v.name}</h2>
                <span className="small muted">{v.specialisation || "General practice"}</span>
              </div>
              <span className="small muted">
                {hours.length ? hours.map((h) => `${h.startTime}–${h.endTime}`).join(" · ") : "No working hours set"}
                {off.length ? ` · off ${off.map((o) => `${o.startTime}–${o.endTime}`).join(", ")}` : ""}
              </span>
            </div>

            {mine.length === 0 ? <p className="small muted">No bookings.</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Time</th><th>Patient</th><th>Owner</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {mine.map((a) => (
                      <tr key={a._id}>
                        <td><strong>{a.startTime}</strong></td>
                        <td>{a.pet?.name}</td>
                        <td className="small">{a.owner?.name}<div className="muted">{a.owner?.phone}</div></td>
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
    </>
  );
};

export default AllSchedules;
