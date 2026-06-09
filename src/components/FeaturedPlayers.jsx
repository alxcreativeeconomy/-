import { players } from "../data/players";
import TOTYCard from "./TOTYCard";

export default function FeaturedPlayers() {
  return (
    <section className="featured">
      <h2 className="section-title">
        TEAM OF THE YEAR
      </h2>

      <div className="toty-grid">
        {players.map((player) => (
          <TOTYCard
            key={player.id}
            player={player}
          />
        ))}
      </div>
    </section>
  );
}