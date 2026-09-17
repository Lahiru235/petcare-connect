import { useState } from "react";

export const Loader = ({ label = "Loading…" }) => <div className="loader">{label}</div>;

export const Alert = ({ type = "error", children }) =>
  children ? <div className={`alert ${type}`}>{children}</div> : null;

export const Empty = ({ title, hint, action }) => (
  <div className="empty">
    <h3>{title}</h3>
    {hint && <p className="muted" style={{ margin: "0 auto .8rem" }}>{hint}</p>}
    {action}
  </div>
);

export const Stat = ({ value, label, tone = "" }) => (
  <div className={`stat ${tone}`}>
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

export const Chip = ({ status }) => (
  <span className={`chip ${status}`} data-s={status}>{status}</span>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="modal-back" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="card-head">
        <h2>{title}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      {children}
    </div>
  </div>
);

export const Field = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);

// small helper hook for form state
export const useForm = (initial) => {
  const [values, setValues] = useState(initial);
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  return { values, setValues, onChange, reset: () => setValues(initial) };
};

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
export const prettyDate = (s) =>
  s ? new Date(`${s}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
