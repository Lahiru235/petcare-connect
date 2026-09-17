import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentApi, scheduleApi } from "../../api/services";
import { Chip, Empty, Loader, Stat, prettyDate, todayStr } from "../../components/UI";

const ReceptionDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentApi.list({ date: todayStr() }), scheduleApi.vets()])
      .then(([a, v]) => {
        setAppointments(a.data.appointments);
        setVets(v.data.vets);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const scheduled = appointments.filter((a) => a.status === "Scheduled");
  const completed = appointments.filter((a) => a.status === "Completed");
  const noShow = appointments.filter((a) => a.status === "No-Show");

  return (
    <>
      <div className="page-head">
        <h1>Front desk</h1>
        <p className="muted">{prettyDate(todayStr())} · {vets.length} vets on the roster</p>
      </div>

      <div className="stat-grid">
        <Stat value={appointments.length} label="Appointments today" />
        <Stat value={scheduled.length} label="Waiting to be seen" tone="accent" />
        <Stat value={completed.length} label="Completed" tone="sky" />
        <Stat value={noShow.length} label="No-shows" tone="warn" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Today across all vets</h2>
          <div className="row-actions">
            <Link className="btn btn-ghost btn-sm" to="/reception/walk-in">Register a walk-in</Link>
            <Link className="btn btn-accent btn-sm" to="/reception/appointments">Book an appointment</Link>
          </div>
        </div>

        {appointments.length === 0 ? (
          <Empty title="Nothing booked today" hint="Book a slot for a phone or walk-in client." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Vet</th><th>Patient</th><th>Owner</th><th>Channel</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.startTime}</strong></td>
                    <td className="small">Dr. {a.doctor?.name}</td>
                    <td>{a.pet?.name}</td>
                    <td className="small">{a.owner?.name}<div className="muted">{a.owner?.phone}</div></td>
                    <td className="small">{a.bookingChannel}</td>
                    <td><Chip status={a.status} /></td>
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

export default ReceptionDashboard;
