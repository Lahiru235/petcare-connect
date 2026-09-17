import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Chip, Empty, Loader, Stat, addDays, prettyDate, todayStr } from "../../components/UI";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi.list({ from: todayStr(), to: addDays(7) })
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const today = appointments.filter((a) => a.date === todayStr());
  const pending = today.filter((a) => a.status === "Scheduled");
  const done = today.filter((a) => a.status === "Completed");

  return (
    <>
      <div className="page-head">
        <h1>Good day, Dr. {user.name.split(" ").pop()}</h1>
        <p className="muted">{user.specialisation || "General practice"} · {prettyDate(todayStr())}</p>
      </div>

      <div className="stat-grid">
        <Stat value={today.length} label="Patients today" />
        <Stat value={pending.length} label="Still to see" tone="accent" />
        <Stat value={done.length} label="Completed today" tone="sky" />
        <Stat value={appointments.length} label="Booked this week" tone="warn" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Today's list</h2>
          <Link className="btn btn-ghost btn-sm" to="/doctor/schedule">Week view</Link>
        </div>

        {today.length === 0 ? (
          <Empty title="No patients booked today" hint="Your week view shows what is coming up." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Owner</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {today.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.startTime}</strong></td>
                    <td>{a.pet?.name}<div className="small muted">{a.pet?.species} · {a.pet?.age} yr</div></td>
                    <td className="small">{a.owner?.name}<div className="muted">{a.owner?.phone}</div></td>
                    <td className="small">{a.reason || "—"}</td>
                    <td><Chip status={a.status} /></td>
                    <td>
                      {a.status === "Scheduled" && (
                        <Link className="btn btn-accent btn-sm" to={`/doctor/record?appointment=${a._id}`}>Record visit</Link>
                      )}
                    </td>
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

export default DoctorDashboard;
