import { sponsors } from "../data/sponsors";

export default function Sponsors() {
  return (
    <section className="sponsors-section">
      <h2 className="section-title">OFFICIAL SPONSORS</h2>
      <div className="sponsors-container">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="sponsor-card">
            <img src={sponsor.logo} alt={sponsor.name} />
            <h3>{sponsor.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
