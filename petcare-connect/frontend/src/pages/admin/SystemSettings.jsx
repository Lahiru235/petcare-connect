import { useState } from "react";
import { notificationApi } from "../../api/services";
import { Alert, Field, useForm } from "../../components/UI";

// Clinic-wide configuration. Reminder settings are kept in the browser for the
// prototype; the reminder run itself calls the API.
const SystemSettings = () => {
  const saved = JSON.parse(localStorage.getItem("pcc_settings") || "null");
  const { values, onChange } = useForm(
    saved || { clinicName: "PetCare Connect Animal Clinic", openTime: "09:00", closeTime: "17:00", slotMinutes: 30, reminderHours: 24, contact: "(123) 456-789" }
  );
  const [msg, setMsg] = useState({ error: "", ok: "" });

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem("pcc_settings", JSON.stringify(values));
    setMsg({ error: "", ok: "Settings saved" });
  };

  const sendReminders = async () => {
    try {
      const { data } = await notificationApi.runReminders({ daysAhead: 1 });
      setMsg({ error: "", ok: data.message });
    } catch (err) {
      setMsg({ error: err.message, ok: "" });
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>System settings</h1>
        <p className="muted">Clinic details, default slot length and reminder timing.</p>
      </div>

      <form className="card" style={{ maxWidth: 640 }} onSubmit={save}>
        <Alert>{msg.error}</Alert>
        <Alert type="success">{msg.ok}</Alert>

        <Field label="Clinic name"><input name="clinicName" value={values.clinicName} onChange={onChange} /></Field>
        <div className="grid-2">
          <Field label="Opens"><input name="openTime" type="time" value={values.openTime} onChange={onChange} /></Field>
          <Field label="Closes"><input name="closeTime" type="time" value={values.closeTime} onChange={onChange} /></Field>
        </div>
        <div className="grid-2">
          <Field label="Default slot length (minutes)">
            <select name="slotMinutes" value={values.slotMinutes} onChange={onChange}>
              <option value={15}>15</option><option value={20}>20</option><option value={30}>30</option><option value={45}>45</option><option value={60}>60</option>
            </select>
          </Field>
          <Field label="Send reminders this many hours ahead">
            <select name="reminderHours" value={values.reminderHours} onChange={onChange}>
              <option value={12}>12</option><option value={24}>24</option><option value={48}>48</option>
            </select>
          </Field>
        </div>
        <Field label="Contact number"><input name="contact" value={values.contact} onChange={onChange} /></Field>

        <div className="row-actions">
          <button className="btn">Save settings</button>
          <button className="btn btn-accent" type="button" onClick={sendReminders}>Send tomorrow's reminders now</button>
        </div>
      </form>
    </>
  );
};

export default SystemSettings;
