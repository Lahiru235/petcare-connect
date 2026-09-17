import { useEffect, useState } from "react";
import { appointmentApi, petApi } from "../../api/services";
import { Chip, Empty, Loader, prettyDate } from "../../components/UI";

const SearchPatients = () => {
  const [search, setSearch] = useState("");
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    setLoading(true);
    petApi.list(search ? { search } : {})
      .then(({ data }) => setPets(data.pets))
      .finally(() => setLoading(false));
  }, [search]);

  const open = async (pet) => {
    setSelected(pet);
    const { data } = await appointmentApi.list({ pet: pet._id });
    setVisits(data.appointments);
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Search patients</h1>
          <p className="muted">Find a pet or a client at the desk, then see their visits.</p>
        </div>
        <input style={{ width: 260 }} placeholder="Pet name" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <Loader /> : pets.length === 0 ? <Empty title="No matches" hint="Try part of the pet's name." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pet</th><th>Species</th><th>Owner</th><th>Phone</th><th>Email</th><th></th></tr></thead>
              <tbody>
                {pets.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td className="small">{p.species}{p.breed && ` · ${p.breed}`}</td>
                    <td>{p.owner?.name}</td>
                    <td className="small">{p.owner?.phone || "—"}</td>
                    <td className="small">{p.owner?.email}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => open(p)}>Visits</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="card">
          <div className="card-head">
            <h2>{selected.name} — visit history</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          {visits.length === 0 ? <Empty title="No visits yet" /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Time</th><th>Vet</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v._id}>
                      <td>{prettyDate(v.date)}</td>
                      <td>{v.startTime}</td>
                      <td className="small">Dr. {v.doctor?.name}</td>
                      <td className="small">{v.reason || "—"}</td>
                      <td><Chip status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SearchPatients;
