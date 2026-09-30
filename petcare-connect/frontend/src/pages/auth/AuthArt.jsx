import { Link } from "react-router-dom";

// Modern minimal left-side visual panel matching the PetShree reference layout
const AuthArt = ({
  welcomeTitle = "Welcome to PetCare",
  welcomeSubtitle = "For better experience with your pets!",
}) => (
  <aside className="auth-art">
    {/* Decorative ambient rings and dots matching the reference */}
    <div className="auth-art-ring auth-art-ring-1" aria-hidden="true" />
    <div className="auth-art-ring auth-art-ring-2" aria-hidden="true" />
    <div className="auth-art-dot auth-art-dot-1" aria-hidden="true" />
    <div className="auth-art-dot auth-art-dot-2" aria-hidden="true" />

    {/* Brand Logo Header */}
    <div className="auth-art-header">
      <Link to="/" className="auth-brand" title="Back to PetCare Connect Home" aria-label="PetCare Connect home">
        <span className="auth-brand-icon" aria-hidden="true">🐾</span>
        <span className="auth-brand-name">
          petcare<small>.connect</small>
        </span>
      </Link>
    </div>

    {/* Simple Eye-Catching Greeting (No paragraph, No letters, No bullet points) */}
    <div className="auth-art-headline">
      <h2>{welcomeTitle}</h2>
      <p>{welcomeSubtitle}</p>
    </div>

    {/* Modern Pet Visual */}
    <div className="auth-art-pet-stage">
      <img
        src="/assets/auth-pet.jpg"
        alt="Happy smiling dog"
        className="auth-art-pet-img"
      />
    </div>
  </aside>
);

export default AuthArt;
