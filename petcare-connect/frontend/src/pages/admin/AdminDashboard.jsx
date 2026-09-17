import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, appointmentApi } from "../../api/services";
import { Alert, Chip, Empty, Loader, Stat, prettyDate, todayStr } from "../../components/UI";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = () => {
    setLoading(true);
    setError("");
    Promise.all([adminApi.stats(), appointmentApi.list({ date: todayStr() })])
      .then(([s, a]) => {
        setStats(s.data.stats);
        setToday(a.data.appointments);
      })
      .catch((err) => setError(err.message || "Unable to load the admin dashboard."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  if (loading) return <Loader label="Loading clinic overview…" />;
  if (error || !stats) {
    return (
      <div className="card">
        <h1>Clinic overview</h1>
        <Alert>{error || "Dashboard data is unavailable."}</Alert>
        <button className="btn btn-accent" onClick={loadDashboard}>Try again</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Clinic overview</h1>
        <p className="muted">{prettyDate(todayStr())}</p>
      </div>

      <div className="stat-grid">
        <Stat value={stats.todayAppointments} label="Appointments today" tone="accent" />
        <Stat value={stats.scheduled} label="Scheduled overall" />
        <Stat value={stats.completed} label="Completed visits" tone="sky" />
        <Stat value={`${stats.noShowRate}%`} label="No-show rate" tone="warn" />
      </div>

      <div className="stat-grid">
        <Stat value={stats.owners} label="Registered pet owners" />
        <Stat value={stats.pets} label="Active pet profiles" tone="sky" />
        <Stat value={stats.doctors} label="Veterinarians" tone="accent" />
        <Stat value={stats.receptionists} label="Reception staff" tone="warn" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Today's bookings</h2>
          <div className="row-actions">
            <Link className="btn btn-ghost btn-sm" to="/admin/users">User management</Link>
            <Link className="btn btn-accent btn-sm" to="/admin/reports">Reports</Link>
          </div>
        </div>
        {today.length === 0 ? <Empty title="Nothing booked today" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Vet</th><th>Patient</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody>
                {today.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.startTime}</strong></td>
                    <td className="small">Dr. {a.doctor?.name}</td>
                    <td>{a.pet?.name}</td>
                    <td className="small">{a.owner?.name}</td>
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

export default AdminDashboard;
