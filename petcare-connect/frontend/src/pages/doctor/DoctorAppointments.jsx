import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentApi } from "../../api/services";
import { Chip, Empty, Loader, prettyDate } from "../../components/UI";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentApi.list(status ? { status } : {})
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const mark = async (id, next) => {
    await appointmentApi.setStatus(id, next);
    load();
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Appointments</h1>
          <p className="muted">Everything booked with you, past and future.</p>
        </div>
        <select style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-Show</option>
        </select>
      </div>

      <div className="card">
        {loading ? <Loader /> : appointments.length === 0 ? (
          <Empty title="No appointments" hint="Nothing matches this filter." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{prettyDate(a.date)}</td>
                    <td>{a.startTime}</td>
                    <td>{a.pet?.name}<div className="small muted">{a.pet?.breed || a.pet?.species}</div></td>
                    <td className="small">{a.owner?.name}<div className="muted">{a.owner?.phone}</div></td>
                    <td><Chip status={a.status} /></td>
                    <td>
                      {a.status === "Scheduled" && (
                        <div className="row-actions">
                          <Link className="btn btn-accent btn-sm" to={`/doctor/record?appointment=${a._id}`}>Record visit</Link>
                          <button className="btn btn-ghost btn-sm" onClick={() => mark(a._id, "No-Show")}>No-show</button>
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
    </>
  );
};

export default DoctorAppointments;
