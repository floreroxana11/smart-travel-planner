import "./PresentationPage.css";

export default function PresentationPage({ onStart }) {
  return (
    <div className="hero">

      <div className="hero-airplane">✈️</div>
      <div className="hero-content">
        <div className="hero-badge">✈️ Smart Travel Planner</div>

        <h1>
          Your Entire Journey,
          <br />
          <span>Perfectly Planned.</span>
        </h1>

        <p>
          The all-in-one companion for seamless travels. Organize complex itineraries,
          <br />
          track your budget in real-time, and manage smart packing lists effortlessly.
        </p>

        <div className="hero-cta">
          <button className="btn btn-primary hero-btn start-btn-animated" onClick={onStart}>
            ✈️ Start Planning
          </button>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🗓️</div>
            <h3>Smart Itineraries</h3>
            <p>Create detailed day-by-day plans with automatic time optimization and smart suggestions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>Budget Tracking</h3>
            <p>Monitor expenses in real-time with currency conversion and spending insights.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎒</div>
            <h3>Packing Lists</h3>
            <p>Never forget essentials with customizable checklists tailored to your destination.</p>
          </div>
        </div>
      </div>
    </div>
  );
}