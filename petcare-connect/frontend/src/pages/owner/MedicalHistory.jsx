import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { petApi, recordApi } from "../../api/services";
import { Empty, Loader, prettyDate } from "../../components/UI";

const MedicalHistory = () => {
  const [params, setParams] = useSearchParams();
  const petId = params.get("pet") || "";
  const [pets, setPets] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { petApi.list().then(({ data }) => setPets(data.pets)); }, []);

  useEffect(() => {
    setLoading(true);
    recordApi.list(petId ? { pet: petId } : {})
      .then(({ data }) => setRecords(data.records))
      .finally(() => setLoading(false));
  }, [petId]);

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Medical history</h1>
          <p className="muted">Every diagnosis, treatment and vaccination, newest first.</p>
        </div>
        <select style={{ width: 210 }} value={petId} onChange={(e) => setParams(e.target.value ? { pet: e.target.value } : {})}>
          <option value="">All pets</option>
          {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <Loader /> : records.length === 0 ? (
          <Empty title="No visit notes yet" hint="Notes appear here once a vet completes a visit." />
        ) : (
          <div className="timeline">
            {records.map((r) => (
              <div className="timeline-item" key={r._id}>
                <h3>{r.pet?.name} — {prettyDate(r.appointment?.date)}</h3>
                <div className="small muted">Dr. {r.doctor?.name} · {r.doctor?.specialisation || "General"}</div>
                <p style={{ marginTop: ".5rem" }}><strong>Diagnosis:</strong> {r.diagnosis}</p>
                <p><strong>Treatment:</strong> {r.treatment}</p>
                {r.prescription && <p><strong>Prescription:</strong> {r.prescription}</p>}
                {r.vaccination && <p><strong>Vaccination:</strong> {r.vaccination}</p>}
                {r.followUpDate && <p className="small muted">Follow-up suggested on {prettyDate(r.followUpDate)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MedicalHistory;
