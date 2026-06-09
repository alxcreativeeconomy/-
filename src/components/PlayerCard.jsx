export default function PlayerCard({ player }) {
  return (
    <div className="player-card">

      <div className="rating">
        {player.rating}
      </div>

      <img
        src={player.image}
        alt={player.name}
      />

      <h3>{player.name}</h3>

      <p>{player.position}</p>

    </div>
  );
}