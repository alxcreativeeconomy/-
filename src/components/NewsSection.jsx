import { news } from "../data/news";

export default function NewsSection() {
  return (
    <section className="news-section">
      <h2 className="section-title">LATEST NEWS</h2>
      <div className="news-container">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            <img src={item.image} alt={item.title} />
            <div className="news-content">
              <h3>{item.title}</h3>
              <p>{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
