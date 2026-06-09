export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        FIFA WORLD CUP 2026
      </div>

      <ul>
        <li>Home</li>
        <li>News</li>
        <li>Players</li>
        <li>Fixtures</li>
        <li>Stats</li>
      </ul>

      <button className="join-btn">
        JOIN NOW
      </button>
    </nav>
  );
}