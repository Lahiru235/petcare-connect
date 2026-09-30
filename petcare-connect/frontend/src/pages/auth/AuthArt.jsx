import { Link } from "react-router-dom";

// Left-hand panel shared by every auth screen (warm luxury boutique aesthetic)
const AuthArt = ({ eyebrow = "Compassionate Pet Care", heading, lead, points = [] }) => (
  <aside className="auth-art">
    <div className="auth-art-top">
      <Link to="/" className="auth-brand" title="Back to home page" aria-label="PetCare Connect home">
        <span className="auth-brand-icon" aria-hidden="true">🐾</span>
        <span className="auth-brand-name">PetCare<small>Connect</small></span>
      </Link>
      <span className="auth-brand-tag">Boutique Veterinary Care</span>
    </div>

    <div className="auth-art-body">
      <div className="auth-art-hero">
        <div className="auth-art-img-wrap">
          <img
            src="/assets/hero-pets.jpg"
            alt="Happy pets relaxing peacefully"
            className="auth-art-img"
          />
          <div className="auth-art-badge">
            <span className="auth-art-badge-dot" />
            <span>Loving Care Daily</span>
          </div>
        </div>
      </div>

      <div className="auth-art-content">
        <span className="auth-eyebrow">{eyebrow}</span>
        <h1>{heading}</h1>
        {lead && <p className="auth-lead">{lead}</p>}

        {points && points.length > 0 && (
          <ul className="auth-points">
            {points.map((p) => (
              <li key={p}>
                <span className="auth-point-icon" aria-hidden="true">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    <div className="auth-art-foot">
      <div className="auth-trust-pill">
        <span className="auth-trust-stars" aria-hidden="true">★★★★★</span>
        <p><strong>4.9/5 Rating</strong> from 2,500+ happy pet parents</p>
      </div>
    </div>
  </aside>
);

export default AuthArt;
