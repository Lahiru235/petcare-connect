import { Link } from "react-router-dom";

const services = [
  { icon: "🐾", title: "Everyday pet care", text: "Grooming, vaccinations, and practical advice to keep tails wagging." },
  { icon: "🏠", title: "Adoption support", text: "Meet pets looking for a home and get help settling in together." },
  { icon: "✚", title: "Veterinary care", text: "Check-ups, treatment, and urgent visits with qualified doctors." },
  { icon: "🦴", title: "Positive training", text: "Friendly, reward-based sessions for puppies and adult dogs." },
];

const steps = [
  { number: "01", title: "Create your account", text: "Sign up as a pet owner and add your pets." },
  { number: "02", title: "Choose a visit", text: "Pick a doctor and a time that works for you." },
  { number: "03", title: "Feel ready", text: "Get a reminder before your visit and find the record afterwards." },
];

const ownerFeatures = [
  { icon: "📅", title: "Appointments at a glance", text: "See upcoming visits and find an available time when you need one." },
  { icon: "📋", title: "One home for health records", text: "Keep visit notes, treatment details, and each pet’s history together." },
  { icon: "🔔", title: "Helpful reminders", text: "Stay on top of appointments with timely notifications." },
];

const Home = () => (
  <main className="home-page">
    <header className="home-header">
      <div className="home-nav-wrap">
        <Link className="home-brand" to="/" aria-label="PetCare Connect home">
          <span className="home-brand-name">PetCare<small>Connect</small></span>
          <span className="home-brand-tag">Veterinary care,<br />made simple</span>
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="home-nav-actions">
          <Link className="home-button home-button-outline" to="/login">Log in</Link>
          <Link className="home-button home-button-primary" to="/register">Sign up</Link>
        </div>
      </div>
    </header>

    <section className="home-hero">
      <div className="home-container home-hero-grid">
        <div className="home-hero-copy">
          <span className="home-eyebrow">A little more care, every day</span>
          <h1>Love, care and comfort for your <em>beloved pets.</em></h1>
          <p>Book trusted veterinary care, follow upcoming visits, and keep your pet’s health history close at hand.</p>
          <div className="home-hero-actions">
            <Link className="home-button home-button-primary" to="/register">Book an appointment <span aria-hidden="true">→</span></Link>
            <a className="home-button home-button-outline" href="#services">Explore services</a>
          </div>
          <ul className="home-benefits">
            <li><span aria-hidden="true">✓</span> See real-time appointment availability</li>
            <li><span aria-hidden="true">✓</span> Keep every pet record together</li>
            <li><span aria-hidden="true">✓</span> Get reminders before each visit</li>
          </ul>
        </div>
        <div className="home-hero-art">
          <div className="home-art-circle home-art-circle-back" />
          <div className="home-art-circle home-art-circle-front" />
          <img className="home-puppy-photo" src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85" alt="A golden retriever puppy sitting outdoors" />
          <span className="home-float home-open"><i />Open today</span>
          <span className="home-float home-reminder">Reminders on <span aria-hidden="true">🔔</span></span>
          <span className="home-spark home-spark-one" aria-hidden="true">✳</span>
          <span className="home-spark home-spark-two" aria-hidden="true">✦</span>
        </div>
      </div>
    </section>

    <section className="home-section home-services" id="services">
      <div className="home-container">
        <div className="home-section-heading">
          <span className="home-eyebrow">Care for every kind of good day</span>
          <h2>Here for all the ways<br />you care for them.</h2>
          <p>From routine check-ups to training, our team looks after every stage of your pet’s life.</p>
        </div>
        <div className="home-service-grid">
          {services.map((service, index) => (
            <article className="home-service-card" key={service.title}>
              <span className={`home-service-icon tone-${index + 1}`} aria-hidden="true">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <Link to="/register">Get started <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="home-section home-steps" id="how-it-works">
      <div className="home-container">
        <div className="home-section-heading home-steps-heading">
          <span className="home-eyebrow">Simple from the start</span>
          <h2>Booking a visit takes three steps.</h2>
        </div>
        <div className="home-step-grid">
          {steps.map((step) => (
            <article className="home-step-card" key={step.number}>
              <span className="home-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="home-section home-owner" id="owner-features">
      <div className="home-container home-owner-layout">
        <div className="home-owner-intro">
          <span className="home-eyebrow">Your care, all together</span>
          <h2>More peace of mind for every pet parent.</h2>
          <p>Your personal space makes it easier to care for your pets between visits, too.</p>
          <Link className="home-button home-button-primary" to="/register">Create your account <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-owner-features">
          {ownerFeatures.map((feature) => (
            <article className="home-owner-feature" key={feature.title}>
              <span className="home-owner-icon" aria-hidden="true">{feature.icon}</span>
              <div><h3>{feature.title}</h3><p>{feature.text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="home-contact" id="contact">
      <div className="home-container home-contact-inner">
        <div><span className="home-eyebrow">We’re here to help</span><h2>Good care starts with a hello.</h2><p>Questions about booking or your pet’s care? Our clinic team is happy to help.</p></div>
        <a className="home-button home-button-light" href="mailto:hello@petcareconnect.lk">Contact our team <span aria-hidden="true">→</span></a>
      </div>
    </section>

    <footer className="home-footer">
      <div className="home-container home-footer-main">
        <Link className="home-brand home-brand-footer" to="/" aria-label="PetCare Connect home">
          <span className="home-brand-name">PetCare<small>Connect</small></span>
        </Link>
        <p>Thoughtful care for the pets who make a home.</p>
        <nav className="home-footer-links" aria-label="Footer navigation">
          <a href="#services">Services</a><a href="#how-it-works">How it works</a><a href="#contact">Contact</a><Link to="/login">Log in</Link>
        </nav>
      </div>
      <div className="home-container home-footer-bottom"><span>© {new Date().getFullYear()} PetCare Connect</span><span>Made with care for pets and their people.</span></div>
    </footer>
  </main>
);

export default Home;
