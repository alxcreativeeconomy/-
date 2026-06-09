export default function TokenPacks() {
  return (
    <section className="token-packs-section">
      <h2 className="section-title">TOKEN PACKS</h2>
      <div className="packs-container">
        <div className="pack-card">
          <h3>STARTER</h3>
          <p className="price">$9.99</p>
          <ul>
            <li>5 Player Cards</li>
            <li>100 Tokens</li>
            <li>1 TOTY Card</li>
          </ul>
          <button className="pack-btn">BUY NOW</button>
        </div>
        <div className="pack-card premium">
          <h3>ELITE</h3>
          <p className="price">$19.99</p>
          <ul>
            <li>15 Player Cards</li>
            <li>500 Tokens</li>
            <li>5 TOTY Cards</li>
          </ul>
          <button className="pack-btn">BUY NOW</button>
        </div>
        <div className="pack-card">
          <h3>LEGEND</h3>
          <p className="price">$49.99</p>
          <ul>
            <li>50 Player Cards</li>
            <li>2000 Tokens</li>
            <li>20 TOTY Cards</li>
          </ul>
          <button className="pack-btn">BUY NOW</button>
        </div>
      </div>
    </section>
  );
}
