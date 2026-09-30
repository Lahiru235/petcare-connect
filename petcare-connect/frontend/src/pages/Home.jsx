import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const services = [
  { icon: "🐾", title: "Everyday pet care", text: "Grooming, vaccinations, and practical advice to keep tails wagging.", color: "warm" },
  { icon: "🏠", title: "Adoption support", text: "Meet pets looking for a home and get help settling in together.", color: "green" },
  { icon: "✚", title: "Veterinary care", text: "Check-ups, treatment, and urgent visits with qualified doctors.", color: "warm" },
  { icon: "🦴", title: "Positive training", text: "Friendly, reward-based sessions for puppies and adult dogs.", color: "green" },
];

const steps = [
  { number: "01", title: "Create your account", text: "Sign up as a pet owner and add your pets.", icon: "👤" },
  { number: "02", title: "Choose a visit", text: "Pick a doctor and a time that works for you.", icon: "📅" },
  { number: "03", title: "Feel ready", text: "Get a reminder before your visit and find the record afterwards.", icon: "✅" },
];

const ownerFeatures = [
  { icon: "📅", title: "Appointments at a glance", text: "See upcoming visits and find an available time when you need one." },
  { icon: "📋", title: "One home for health records", text: "Keep visit notes, treatment details, and each pet's history together." },
  { icon: "🔔", title: "Helpful reminders", text: "Stay on top of appointments with timely notifications." },
];

const testimonials = [
  { name: "Sarah M.", pet: "Golden Retriever owner", text: "PetCare Connect made booking vet appointments so easy. I love having all of Max's records in one place!", avatar: "🐕" },
  { name: "Rajith K.", pet: "Cat parent", text: "The reminders are a lifesaver! I never miss Luna's vaccinations anymore. Highly recommend!", avatar: "🐱" },
  { name: "Anya D.", pet: "Multi-pet household", text: "Managing appointments for 3 pets used to be chaos. Now everything is organized beautifully.", avatar: "🐾" },
];

const stats = [
  { value: "2,500+", label: "Happy pets cared for" },
  { value: "50+", label: "Expert veterinarians" },
  { value: "98%", label: "Client satisfaction" },
  { value: "24/7", label: "Emergency support" },
];

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 280) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="home-page" id="top">
      {/* ─── Navbar ─── */}
      <header className="home-header">
        <div className="home-nav-wrap">
          <Link className="home-brand" to="/" onClick={scrollToTop} aria-label="PetCare Connect home - scroll to top">
            <span className="home-brand-icon" aria-hidden="true">🐾</span>
            <span className="home-brand-name">PetCare<small>Connect</small></span>
          </Link>
          <nav className="home-nav" aria-label="Main navigation">
            <a href="#top" onClick={scrollToTop}>Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How it works</a>
            <a href="#testimonials">Reviews</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="home-nav-actions">
            <Link className="home-button home-button-outline" to="/login">Log in</Link>
            <Link className="home-button home-button-primary" to="/register">Sign up</Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="home-hero">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-eyebrow">🐾 Trusted by 2,500+ pet parents</span>
            <h1>Love, care &amp; comfort for your <em>beloved pets</em></h1>
            <p>Book trusted veterinary care, follow upcoming visits, and keep your pet's health history close at hand — all in one place.</p>
            <div className="home-hero-actions">
              <Link className="home-button home-button-accent home-button-lg" to="/register">
                Book an appointment <span aria-hidden="true">→</span>
              </Link>
              <a className="home-button home-button-outline home-button-lg" href="#services">
                Explore services
              </a>
            </div>
            <div className="home-hero-trust">
              <div className="home-trust-avatars" aria-hidden="true">
                <span>🐕</span><span>🐈</span><span>🐩</span><span>🐱</span>
              </div>
              <p><strong>4.9★</strong> from 500+ verified pet parents</p>
            </div>
          </div>

          <div className="home-hero-media">
            <img
              src="/assets/hero-pets.jpg"
              alt="Happy Golden Retriever dog, kitten and fluffy cat relaxing peacefully together"
              className="home-hero-seamless-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ─── Large Full-Width Pet Image (No Card / No Box) ─── */}
      <section className="home-pet-banner-section" aria-label="Our clinic pets">
        <img
          src="/assets/hero-pets-trio.jpg"
          alt="Golden retriever dog, black kitten, and tabby cat relaxing together on a cozy couch"
          className="home-pet-banner-img"
          loading="eager"
        />
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="home-stats-bar">
        <div className="home-container home-stats-grid">
          {stats.map((s) => (
            <div className="home-stat-item" key={s.label}>
              <span className="home-stat-value">{s.value}</span>
              <span className="home-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

    {/* ─── Services ─── */}
    <section className="home-section home-services" id="services">
      <div className="home-container">
        <div className="home-section-heading home-section-center">
          <span className="home-eyebrow">What we offer</span>
          <h2>Complete care for every furry family member</h2>
          <p>From routine check-ups to training, our team looks after every stage of your pet's life with warmth and expertise.</p>
        </div>
        <div className="home-service-grid">
          {services.map((service) => (
            <article className={`home-service-card home-service-${service.color}`} key={service.title}>
              <span className="home-service-icon" aria-hidden="true">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <Link to="/register">Get started <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ─── How it works ─── */}
    <section className="home-section home-steps" id="how-it-works">
      <div className="home-container">
        <div className="home-section-heading home-section-center">
          <span className="home-eyebrow">Simple from the start</span>
          <h2>Booking a visit takes just 3 steps</h2>
        </div>
        <div className="home-step-grid">
          {steps.map((step, i) => (
            <article className="home-step-card" key={step.number}>
              <div className="home-step-top">
                <span className="home-step-number">{step.number}</span>
                <span className="home-step-icon" aria-hidden="true">{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {i < steps.length - 1 && <span className="home-step-arrow" aria-hidden="true">→</span>}
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ─── Owner features with vet image ─── */}
    <section className="home-section home-owner" id="owner-features">
      <div className="home-container home-owner-layout">
        <div className="home-owner-img-wrap">
          <img src="/assets/vet-care.jpg" alt="Veterinarian caring for pets" loading="lazy" />
          <div className="home-owner-img-badge">
            <span className="home-owner-badge-icon" aria-hidden="true">🩺</span>
            <div>
              <strong>Expert Care</strong>
              <small>50+ qualified vets</small>
            </div>
          </div>
        </div>
        <div className="home-owner-content">
          <span className="home-eyebrow">Your care, all together</span>
          <h2>More peace of mind for every pet parent</h2>
          <p className="home-owner-desc">Your personal space makes it easier to care for your pets between visits, too.</p>
          <div className="home-owner-features">
            {ownerFeatures.map((feature) => (
              <article className="home-owner-feature" key={feature.title}>
                <span className="home-owner-icon" aria-hidden="true">{feature.icon}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
          <Link className="home-button home-button-primary" to="/register">Create your account <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>

    {/* ─── Testimonials ─── */}
    <section className="home-section home-testimonials" id="testimonials">
      <div className="home-container">
        <div className="home-section-heading home-section-center">
          <span className="home-eyebrow">What pet parents say</span>
          <h2>Loved by thousands of happy pet families</h2>
        </div>
        <div className="home-testimonial-grid">
          {testimonials.map((t) => (
            <article className="home-testimonial-card" key={t.name}>
              <div className="home-testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
              <p className="home-testimonial-text">"{t.text}"</p>
              <div className="home-testimonial-author">
                <span className="home-testimonial-avatar" aria-hidden="true">{t.avatar}</span>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.pet}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ─── CTA ─── */}
    <section className="home-cta">
      <div className="home-container home-cta-inner">
        <h2>Ready to give your pet the best care?</h2>
        <p>Join thousands of happy pet parents. Book your first appointment today.</p>
        <div className="home-cta-actions">
          <Link className="home-button home-button-light home-button-lg" to="/register">Get started free <span aria-hidden="true">→</span></Link>
          <a className="home-button home-button-ghost-light" href="#services">Learn more</a>
        </div>
      </div>
    </section>

    {/* ─── Contact ─── */}
    <section className="home-contact" id="contact">
      <div className="home-container home-contact-inner">
        <div>
          <span className="home-eyebrow">We're here to help</span>
          <h2>Good care starts with a hello.</h2>
          <p>Questions about booking or your pet's care? Our clinic team is happy to help.</p>
        </div>
        <a className="home-button home-button-primary" href="mailto:hello@petcareconnect.lk">Contact our team <span aria-hidden="true">→</span></a>
      </div>
    </section>

    {/* ─── Footer ─── */}
    <footer className="home-footer">
      <div className="home-container home-footer-main">
        <Link className="home-brand home-brand-footer" to="/" onClick={scrollToTop} aria-label="PetCare Connect home - scroll to top">
          <span className="home-brand-icon" aria-hidden="true">🐾</span>
          <span className="home-brand-name">PetCare<small>Connect</small></span>
        </Link>
        <p>Thoughtful care for the pets who make a home.</p>
        <nav className="home-footer-links" aria-label="Footer navigation">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#testimonials">Reviews</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Log in</Link>
        </nav>
      </div>
      <div className="home-container home-footer-bottom">
        <span>© {new Date().getFullYear()} PetCare Connect</span>
        <span>Made with ❤️ for pets and their people.</span>
      </div>
    </footer>

    {/* ─── Floating Scroll to Top Button ─── */}
    <button
      type="button"
      className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  </main>
  );
};

export default Home;
