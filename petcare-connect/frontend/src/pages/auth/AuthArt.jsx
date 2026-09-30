import { Link } from "react-router-dom";

// Modern minimal left-side visual panel matching the PetShree reference layout
const AuthArt = ({
  welcomeTitle = "Welcome to PetCare",
  welcomeSubtitle = "For better experience with your pets!",
  petImage = "/assets/auth-dog.jpg",
  petAlt = "Happy pet",
}) => (
  <aside className="auth-art">
    {/* Decorative ambient rings and dots */}
    <div className="auth-art-ring auth-art-ring-1" aria-hidden="true" />
    <div className="auth-art-ring auth-art-ring-2" aria-hidden="true" />
    <div className="auth-art-ring auth-art-ring-3" aria-hidden="true" />
    <div className="auth-art-dot auth-art-dot-1" aria-hidden="true" />
    <div className="auth-art-dot auth-art-dot-2" aria-hidden="true" />
    <div className="auth-art-dot auth-art-dot-3" aria-hidden="true" />

    <div className="auth-art-top-content">
      {/* Brand Logo Header */}
      <div className="auth-art-header">
        <Link to="/" className="auth-brand" title="Back to PetCare Connect Home" aria-label="PetCare Connect home">
          <span className="auth-brand-icon" aria-hidden="true">🐾</span>
          <span className="auth-brand-name">
            petcare<small>.connect</small>
          </span>
        </Link>
      </div>

      {/* Simple Eye-Catching Greeting */}
      <div className="auth-art-headline">
        <h2>{welcomeTitle}</h2>
        <p>{welcomeSubtitle}</p>
      </div>
    </div>

    {/* Seamless Pet Visual (Dog for login, Cat for signup) */}
    <div className="auth-art-pet-stage">
      <img
        src={petImage}
        alt={petAlt}
        className="auth-art-pet-img"
      />
    </div>
  </aside>
);

export default AuthArt;
