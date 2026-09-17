import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentApi, petApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Chip, Empty, Loader, Stat, prettyDate, todayStr } from "../../components/UI";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([petApi.list(), appointmentApi.list()])
      .then(([p, a]) => {
        setPets(p.data.pets);
        setAppointments(a.data.appointments);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const upcoming = appointments.filter((a) => a.status === "Scheduled" && a.date >= todayStr());
  const completed = appointments.filter((a) => a.status === "Completed");

  return (
    <>
      <div className="page-head">
        <h1>Hello {user.name.split(" ")[0]} 🐾</h1>
        <p className="muted">Here is what is happening with your pets.</p>
      </div>

      <div className="stat-grid">
        <Stat value={pets.length} label="Pets on your profile" />
        <Stat value={upcoming.length} label="Upcoming visits" tone="accent" />
        <Stat value={completed.length} label="Completed visits" tone="sky" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Next visits</h2>
          <Link className="btn btn-accent btn-sm" to="/owner/book">Book a visit</Link>
        </div>

        {upcoming.length === 0 ? (
          <Empty
            title="No visits booked"
            hint="Pick a vet and a free slot whenever your pet needs a check-up."
            action={<Link className="btn" to="/owner/book">Book a visit</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pet</th><th>Veterinarian</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 5).map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.pet?.name}</strong><div className="small muted">{a.pet?.species}</div></td>
                    <td>Dr. {a.doctor?.name}<div className="small muted">{a.doctor?.specialisation}</div></td>
                    <td>{prettyDate(a.date)}</td>
                    <td>{a.startTime}</td>
                    <td><Chip status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Your pets</h2>
          <Link className="btn btn-ghost btn-sm" to="/owner/pets">Manage pets</Link>
        </div>
        {pets.length === 0 ? (
          <Empty title="No pets added yet" hint="Add a pet profile so the vet knows the species, breed and age." />
        ) : (
          <div className="pet-grid">
            {pets.map((p) => (
              <div className="pet-card" key={p._id}>
                <div className="pet-emoji">{p.species?.toLowerCase() === "cat" ? "🐱" : p.species?.toLowerCase() === "dog" ? "🐶" : "🐾"}</div>
                <h3>{p.name}</h3>
                <div className="small muted">{p.breed || p.species} · {p.age} yr</div>
                <Link className="btn btn-ghost btn-sm" style={{ marginTop: ".6rem" }} to={`/owner/history?pet=${p._id}`}>Medical history</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerDashboard;
