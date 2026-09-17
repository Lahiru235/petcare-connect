import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { appointmentApi, recordApi } from "../../api/services";
import { Alert, Empty, Field, Loader, prettyDate, useForm } from "../../components/UI";

const RecordVisit = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get("appointment") || "");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const { values, onChange, reset } = useForm({ diagnosis: "", treatment: "", prescription: "", vaccination: "", followUpDate: "" });

  useEffect(() => {
    appointmentApi.list({ status: "Scheduled" })
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));
  }, []);

  const selected = appointments.find((a) => a._id === selectedId);

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ error: "", ok: "" });
    try {
      const { data } = await recordApi.create({ appointment: selectedId, ...values });
      setMsg({ error: "", ok: data.message });
      reset();
      setSelectedId("");
      setAppointments((list) => list.filter((a) => a._id !== selectedId));
      setTimeout(() => navigate("/doctor/appointments"), 900);
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="page-head">
        <h1>Record a visit</h1>
        <p className="muted">Saving the notes marks the appointment completed and timestamps the record.</p>
      </div>

      {appointments.length === 0 && !msg.ok ? (
        <Empty title="No open appointments" hint="Visits appear here while their status is still Scheduled." />
      ) : (
        <form className="card" onSubmit={submit}>
          <Alert>{msg.error}</Alert>
          <Alert type="success">{msg.ok}</Alert>

          <Field label="Appointment">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
              <option value="">Choose the visit</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {prettyDate(a.date)} {a.startTime} — {a.pet?.name} ({a.owner?.name})
                </option>
              ))}
            </select>
          </Field>

          {selected && (
            <div className="card" style={{ background: "var(--mint)", boxShadow: "none", marginBottom: "1rem" }}>
              <strong>{selected.pet?.name}</strong> · {selected.pet?.species} · {selected.pet?.age} yr · {selected.pet?.weight} kg
              <div className="small muted">Owner: {selected.owner?.name} · {selected.owner?.phone}</div>
              <div className="small">Reason given: {selected.reason || "—"}</div>
            </div>
          )}

          <Field label="Diagnosis"><textarea name="diagnosis" value={values.diagnosis} onChange={onChange} required /></Field>
          <Field label="Treatment given"><textarea name="treatment" value={values.treatment} onChange={onChange} required /></Field>
          <Field label="Prescription"><textarea name="prescription" value={values.prescription} onChange={onChange} placeholder="Drug, dose, frequency, duration" /></Field>
          <div className="grid-2">
            <Field label="Vaccination given"><input name="vaccination" value={values.vaccination} onChange={onChange} /></Field>
            <Field label="Follow-up date"><input name="followUpDate" type="date" value={values.followUpDate} onChange={onChange} /></Field>
          </div>

          <button className="btn btn-accent" disabled={!selectedId}>Save and complete visit</button>
        </form>
      )}
    </>
  );
};

export default RecordVisit;
