import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentApi, paymentApi, petApi, scheduleApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Alert, Empty, Field, Loader, Modal, todayStr } from "../../components/UI";

const CONSULTATION_FEE = 1500; // default LKR, can be dynamic from doctor.consultationFee

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState({ error: "", ok: "" });
  const [form, setForm] = useState({ pet: "", specialisation: "", doctor: "", date: todayStr(), startTime: "", reason: "" });

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    Promise.all([petApi.list(), scheduleApi.vets()])
      .then(([p, v]) => {
        setPets(p.data.pets);
        setVets(v.data.vets);
        if (p.data.pets[0]) set({ pet: p.data.pets[0]._id });
      })
      .finally(() => setLoading(false));
  }, []);

  // FR-15: narrow the vet list by specialisation
  const filterVets = async (specialisation) => {
    set({ specialisation, doctor: "", startTime: "" });
    setSlots([]);
    const { data } = await scheduleApi.vets(specialisation ? { specialisation } : {});
    setVets(data.vets);
  };

  const findSlots = async () => {
    if (!form.doctor || !form.date) return setMsg({ error: "Choose a veterinarian and a date", ok: "" });
    setSearching(true);
    setMsg({ error: "", ok: "" });
    try {
      const { data } = await scheduleApi.availability({ doctor: form.doctor, date: form.date });
      setSlots(data.slots);
      if (!data.slots.length) setMsg({ error: "No free slots that day. Try another date.", ok: "" });
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
    } finally {
      setSearching(false);
    }
  };

  // Get selected vet's consultation fee
  const getConsultationFee = () => {
    const selectedVet = vets.find((v) => v._id === form.doctor);
    return selectedVet?.consultationFee || CONSULTATION_FEE;
  };

  const book = async (e) => {
    e.preventDefault();
    try {
      const { data } = await appointmentApi.create({
        pet: form.pet, doctor: form.doctor, date: form.date,
        startTime: form.startTime, reason: form.reason,
      });
      // After booking, show payment modal
      setBookedAppointment(data.appointment);
      setShowPayment(true);
      setPaymentError("");
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
      setSlots([]);
    }
  };

  // Stripe checkout handler
  const handleStripeCheckout = async () => {
    if (!bookedAppointment) return;
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const fee = getConsultationFee();
      const selectedPet = pets.find((p) => p._id === (bookedAppointment.pet?._id || form.pet));

      const { data } = await paymentApi.create({
        appointmentId: bookedAppointment._id,
        serviceName: `Vet Consultation – ${selectedPet?.name || "Pet"}`,
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
    }
  };

  const skipPayment = () => {
    setShowPayment(false);
    navigate("/owner/appointments");
  };

  if (loading) return <Loader />;
  if (!pets.length)
    return <Empty title="Add a pet first" hint="An appointment needs a pet profile." action={<a className="btn" href="/owner/pets">Add a pet</a>} />;

  const specialisations = [...new Set(vets.map((v) => v.specialisation).filter(Boolean))];

  return (
    <>
      <div className="page-head">
        <h1>Book a visit</h1>
        <p className="muted">Choose a vet, then pick from the slots that are actually free.</p>
      </div>

      <form className="card" onSubmit={book}>
        <Alert>{msg.error}</Alert>

        <div className="grid-2">
          <Field label="Pet">
            <select value={form.pet} onChange={(e) => set({ pet: e.target.value })} required>
              {pets.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.species})</option>)}
            </select>
          </Field>
          <Field label="Specialisation">
            <select value={form.specialisation} onChange={(e) => filterVets(e.target.value)}>
              <option value="">Any</option>
              {specialisations.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid-2">
          <Field label="Veterinarian">
            <select value={form.doctor} onChange={(e) => { set({ doctor: e.target.value, startTime: "" }); setSlots([]); }} required>
              <option value="">Choose a vet</option>
              {vets.map((v) => <option key={v._id} value={v._id}>Dr. {v.name} — {v.specialisation || "General"}</option>)}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" min={todayStr()} value={form.date} onChange={(e) => { set({ date: e.target.value, startTime: "" }); setSlots([]); }} required />
          </Field>
        </div>

        <button type="button" className="btn btn-ghost" onClick={findSlots} disabled={searching}>
          {searching ? "Checking…" : "Show free slots"}
        </button>

        {slots.length > 0 && (
          <div style={{ marginTop: "1.1rem" }}>
            <label className="small muted">Free slots on {form.date}</label>
            <div className="slot-grid" style={{ marginTop: ".4rem" }}>
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.startTime}
                  className={`slot ${form.startTime === s.startTime ? "selected" : ""}`}
                  onClick={() => set({ startTime: s.startTime })}
                >
                  {s.startTime}
                </button>
              ))}
            </div>
          </div>
        )}

        {!searching && form.doctor && form.date && !slots.length && msg.error && (
          <p className="small muted" style={{ marginTop: ".7rem" }}>
            Choose a date with veterinarian working hours, then click "Show free slots" again.
          </p>
        )}

        <div style={{ marginTop: "1.1rem" }}>
          <Field label="Reason for the visit">
            <textarea value={form.reason} onChange={(e) => set({ reason: e.target.value })} placeholder="Limping, vaccination due, skin irritation…" />
          </Field>

          {form.doctor && (
            <div className="payment-fee-preview">
              <span className="small muted">Consultation fee</span>
              <span className="fee-amount">LKR {getConsultationFee().toLocaleString()}.00</span>
            </div>
          )}

          <button className="btn btn-accent" disabled={!form.startTime}>Confirm & Pay</button>
        </div>
      </form>

      {/* ── Payment Modal ── */}
      {showPayment && bookedAppointment && (
        <Modal title="Complete Payment" onClose={skipPayment}>
          <div className="payment-checkout-modal">
            <Alert>{paymentError}</Alert>

            <div className="payment-summary">
              <div className="payment-summary-icon">💳</div>
              <h3>Appointment Confirmed!</h3>
              <p className="muted">Complete your payment to secure your booking.</p>

              <div className="payment-details-grid">
                <div className="payment-detail-row">
                  <span className="muted">Pet</span>
                  <strong>{bookedAppointment.pet?.name}</strong>
                </div>
                <div className="payment-detail-row">
                  <span className="muted">Veterinarian</span>
                  <strong>Dr. {bookedAppointment.doctor?.name}</strong>
                </div>
                <div className="payment-detail-row">
                  <span className="muted">Date & Time</span>
                  <strong>{bookedAppointment.date} at {bookedAppointment.startTime}</strong>
                </div>
                <div className="payment-detail-row total">
                  <span>Total Amount</span>
                  <strong className="fee-amount-lg">LKR {getConsultationFee().toLocaleString()}.00</strong>
                </div>
              </div>
            </div>

            <div className="payment-gateway-brand">
              <p className="small muted">💳 Secure online payment powered by Stripe Checkout</p>
            </div>

            <button
              className="btn btn-accent btn-block btn-pay"
              onClick={handleStripeCheckout}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <>
                  <span className="spinner" /> Processing…
                </>
              ) : (
                <>💳 Pay Now – LKR {getConsultationFee().toLocaleString()}.00</>
              )}
            </button>

            <button className="btn btn-ghost btn-block" onClick={skipPayment} style={{ marginTop: ".5rem" }}>
              Pay later
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default BookAppointment;
