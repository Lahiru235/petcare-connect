import { Link } from "react-router-dom";

// Left-hand panel shared by every auth screen
const AuthArt = ({ eyebrow, heading, lead, points }) => (
  <aside className="auth-art">
    <div className="auth-brand">
      <Link to="/" className="logo" title="Back to home page">PetCare<span>Connect</span></Link>
      <span className="auth-brand-tag">Veterinary care, made simple</span>
    </div>
    <span className="auth-eyebrow">{eyebrow}</span>
    <h1>{heading}</h1>
    <p className="lead">{lead}</p>
    <ul className="auth-points">
      {points.map((p) => (
        <li key={p}><i>✓</i>{p}</li>
      ))}
    </ul>
    <div className="care-preview" aria-label="PetCare appointment summary">
      <div className="care-preview-head"><span>Today at the clinic</span><b>ON TRACK</b></div>
      <div className="care-preview-row"><span className="care-icon">🐾</span><span><strong>Care plan in one place</strong><small>Visits, pets, and treatment notes</small></span></div>
      <div className="care-preview-line"><span /><span /><span /></div>
    </div>
  </aside>
);

export default AuthArt;
