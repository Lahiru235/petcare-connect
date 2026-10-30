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
  const [allSpecialisations, setAllSpecialisations] = useState([]);
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

  // Helper: trim, capitalize first letter, and deduplicate specialisations
  const normalizeSpecialisations = (vetList = []) => [
    ...new Set(
      vetList
        .map((v) => v.specialisation)
        .filter(Boolean)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    ),
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    Promise.all([petApi.list(), scheduleApi.vets()])
      .then(([p, v]) => {
        setPets(p.data.pets);
        setVets(v.data.vets);
        if (p.data.pets[0]) set({ pet: p.data.pets[0]._id });
        setAllSpecialisations(normalizeSpecialisations(v.data.vets));
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
      const returnedSlots = data.slots || [];
      setSlots(returnedSlots);
      const availableCount = returnedSlots.filter((s) => !s.isBooked).length;
      if (!returnedSlots.length) {
        if (form.date === todayStr()) {
          setMsg({ error: "All time slots for today have already passed. Please select tomorrow or a future date.", ok: "" });
        } else {
          setMsg({ error: "No working hours configured for this veterinarian on this date. Try another date.", ok: "" });
        }
      } else if (availableCount === 0) {
        setMsg({ error: "All remaining time slots for this date are already booked. Try another date.", ok: "" });
      }
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
    if (!form.startTime) {
      return setMsg({ error: "Please choose an available time slot first.", ok: "" });
    }
    const chosenSlot = slots.find((s) => s.startTime === form.startTime);
    if (chosenSlot && chosenSlot.isBooked) {
      return setMsg({ error: `Already this time slot (${form.startTime}) is booked. Please choose an available time slot.`, ok: "" });
    }
    try {
      const { data } = await appointmentApi.create({
        pet: form.pet, doctor: form.doctor, date: form.date,
        startTime: form.startTime, reason: form.reason,
      });
      // Refresh slots so newly booked slot updates to dark highlight immediately
      findSlots();
      // After booking, show payment modal
      setBookedAppointment(data.appointment);
      setShowPayment(true);
      setPaymentError("");
    } catch (err) {
      setMsg({ error: err.message || "Failed to book appointment", ok: "" });
      findSlots();
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

  const specialisations =
    allSpecialisations.length > 0
      ? allSpecialisations
      : normalizeSpecialisations(vets);

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
              {specialisations.map((s) => <option key={s} value={s}>{s}</option>)}
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
          {searching ? "Checking…" : "Show time slots"}
        </button>

        {slots.length > 0 && (
          <div style={{ marginTop: "1.1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem", flexWrap: "wrap", gap: ".5rem" }}>
              <label className="small muted">Time slots on {form.date}</label>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "#ffffff", border: "1.5px solid var(--line)", display: "inline-block" }}></span>
                  Available
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "#1f242d", border: "1.5px solid #374151", display: "inline-block" }}></span>
                  Already Booked
                </span>
              </div>
            </div>
            <div className="slot-grid" style={{ marginTop: ".4rem" }}>
              {slots.map((s) => {
                const isBooked = Boolean(s.isBooked);
                const isSelected = form.startTime === s.startTime;
                return (
                  <button
                    type="button"
                    key={s.startTime}
                    className={`slot ${isBooked ? "slot-booked" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      if (isBooked) {
                        setMsg({ error: `Already this time slot (${s.startTime}) is booked. Please choose an available time slot.`, ok: "" });
                        return;
                      }
                      setMsg({ error: "", ok: "" });
                      set({ startTime: s.startTime });
                    }}
                    title={isBooked ? `Already this time slot (${s.startTime}) is booked` : `Select ${s.startTime}`}
                  >
                    <span>{s.startTime}</span>
                    {isBooked && <span className="slot-booked-label">Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!searching && form.doctor && form.date && !slots.length && msg.error && (
          <p className="small muted" style={{ marginTop: ".7rem" }}>
            Choose a date with veterinarian working hours, then click "Show time slots" again.
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
