import { useEffect, useState } from "react";
import { petApi, recordApi } from "../../api/services";
import { Empty, Loader, prettyDate } from "../../components/UI";

const PatientRecords = () => {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    petApi.list(search ? { search } : {})
      .then(({ data }) => setPets(data.pets))
      .finally(() => setLoading(false));
  }, [search]);

  const openPet = async (pet) => {
    setSelected(pet);
    const { data } = await recordApi.list({ pet: pet._id });
    setRecords(data.records);
  };

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Patient records</h1>
          <p className="muted">Read a pet's history before the consultation starts.</p>
        </div>
        <input style={{ width: 240 }} placeholder="Search by pet name" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <h2>Patients</h2>
        {loading ? <Loader /> : pets.length === 0 ? <Empty title="No pets found" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pet</th><th>Species / breed</th><th>Age</th><th>Owner</th><th></th></tr></thead>
              <tbody>
                {pets.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td className="small">{p.species}{p.breed && ` · ${p.breed}`}</td>
                    <td>{p.age} yr</td>
                    <td className="small">{p.owner?.name}<div className="muted">{p.owner?.phone}</div></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => openPet(p)}>View history</button></td>
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
            <h2>{selected.name}'s history</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          {selected.notes && <p className="small muted">Owner notes: {selected.notes}</p>}
          {records.length === 0 ? <Empty title="No visits recorded yet" /> : (
            <div className="timeline">
              {records.map((r) => (
                <div className="timeline-item" key={r._id}>
                  <h3>{prettyDate(r.appointment?.date)}</h3>
                  <div className="small muted">Dr. {r.doctor?.name}</div>
                  <p><strong>Diagnosis:</strong> {r.diagnosis}</p>
                  <p><strong>Treatment:</strong> {r.treatment}</p>
                  {r.prescription && <p><strong>Prescription:</strong> {r.prescription}</p>}
                  {r.vaccination && <p><strong>Vaccination:</strong> {r.vaccination}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PatientRecords;
