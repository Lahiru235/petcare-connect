import { useEffect, useState } from "react";
import { appointmentApi, paymentApi, scheduleApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Alert, Chip, Empty, Field, Loader, Modal, prettyDate, todayStr } from "../../components/UI";

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [paymentMap, setPaymentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [moving, setMoving] = useState(null);
  const [slots, setSlots] = useState([]);
  const [draft, setDraft] = useState({ date: todayStr(), startTime: "" });
  const [error, setError] = useState("");

  // Payment states
  const [payingFor, setPayingFor] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const load = () => {
    appointmentApi.list(filter ? { status: filter } : {})
      .then(({ data }) => {
        setAppointments(data.appointments);
        // Load payment status for each appointment
        data.appointments.forEach((a) => {
          paymentApi.byAppointment(a._id)
            .then(({ data: pData }) => {
              setPaymentMap((prev) => ({ ...prev, [a._id]: pData.payment }));
            })
            .catch(() => {
              setPaymentMap((prev) => ({ ...prev, [a._id]: null }));
            });
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openMove = (a) => {
    setMoving(a);
    setDraft({ date: a.date, startTime: "" });
    setSlots([]);
    setError("");
  };

  const findSlots = async () => {
    const { data } = await scheduleApi.availability({ doctor: moving.doctor._id, date: draft.date });
    setSlots(data.slots);
    if (!data.slots.length) setError("No free slots that day. Try another date.");
  };

  const confirmMove = async () => {
    try {
      await appointmentApi.reschedule(moving._id, { date: draft.date, startTime: draft.startTime });
      setMoving(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (a) => {
    if (!window.confirm(`Cancel ${a.pet.name}'s visit on ${a.date}?`)) return;
    await appointmentApi.cancel(a._id);
    load();
  };

  // Stripe checkout for unpaid appointments
  const handlePay = async (appointment) => {
    setPayingFor(appointment._id);
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const fee = appointment.doctor?.consultationFee || 1500;
      const { data } = await paymentApi.create({
        appointmentId: appointment._id,
        serviceName: `Vet Consultation – ${appointment.pet?.name || "Pet"}`,
        amount: fee,
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout session URL was not returned");
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || "Failed to start payment");
      setPaymentLoading(false);
      setPayingFor(null);
    }
  };

  const getPaymentChip = (appointmentId) => {
    const payment = paymentMap[appointmentId];
    if (!payment) return null;
    const statusLabel = { success: "Paid", pending: "Pending", failed: "Failed", cancelled: "Unpaid" };
    const chipStatus = { success: "Completed", pending: "Scheduled", failed: "Cancelled", cancelled: "Cancelled" };
    return <Chip status={chipStatus[payment.status] || payment.status} />;
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>My appointments</h1>
          <p className="muted">Reschedule, cancel, or pay without calling the clinic.</p>
        </div>
        <select style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-Show</option>
        </select>
      </div>

      {paymentError && <Alert>{paymentError}</Alert>}

      <div className="card">
        {appointments.length === 0 ? (
          <Empty title="Nothing here" hint="Book a visit and it will show up in this list." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pet</th><th>Veterinarian</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.pet?.name}</strong></td>
                    <td>Dr. {a.doctor?.name}</td>
                    <td>{prettyDate(a.date)}</td>
                    <td>{a.startTime}–{a.endTime}</td>
                    <td className="small">{a.reason || "—"}</td>
                    <td><Chip status={a.status} /></td>
                    <td>
                      {getPaymentChip(a._id) || <span className="small muted">—</span>}
                    </td>
                    <td>
                      {a.status === "Scheduled" ? (
                        <div className="row-actions">
                          {!paymentMap[a._id] || paymentMap[a._id]?.status !== "success" ? (
                            <button
                              className="btn btn-accent btn-sm"
                              onClick={() => handlePay(a)}
                              disabled={payingFor === a._id && paymentLoading}
                            >
                              {payingFor === a._id && paymentLoading ? "…" : "💳 Pay Now"}
                            </button>
                          ) : null}
                          <button className="btn btn-ghost btn-sm" onClick={() => openMove(a)}>Reschedule</button>
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(a)}>Cancel</button>
                        </div>
                      ) : <span className="small muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {moving && (
        <Modal title={`Move ${moving.pet.name}'s visit`} onClose={() => setMoving(null)}>
          <Alert>{error}</Alert>
          <Field label="New date">
            <input type="date" min={todayStr()} value={draft.date} onChange={(e) => { setDraft({ ...draft, date: e.target.value, startTime: "" }); setSlots([]); }} />
          </Field>
          <button className="btn btn-ghost" type="button" onClick={findSlots}>Show free slots</button>

          {slots.length > 0 && (
            <div className="slot-grid" style={{ margin: "1rem 0" }}>
              {slots.map((s) => (
                <button key={s.startTime} type="button"
                  className={`slot ${draft.startTime === s.startTime ? "selected" : ""}`}
                  onClick={() => setDraft({ ...draft, startTime: s.startTime })}>{s.startTime}</button>
              ))}
            </div>
          )}

          <button className="btn btn-accent btn-block" disabled={!draft.startTime} onClick={confirmMove}>
            Move appointment
          </button>
        </Modal>
      )}
    </>
  );
};

export default MyAppointments;
