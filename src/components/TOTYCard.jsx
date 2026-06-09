import { motion } from "framer-motion";

export default function TOTYCard({ player }) {
  return (
    <motion.div
      className="toty-card"
      whileHover={{
        y: -12,
        scale: 1.03
      }}
    >
      <div className="card-glow"></div>

      <div className="hex-pattern"></div>

      <div className="card-top">
        <div className="rating-block">
          <h1>{player.rating}</h1>
          <span>{player.position}</span>
        </div>

        <div className="nation">
          {player.nation}
        </div>
      </div>

      <div className="player-image-wrapper">
        <img
          src={player.image}
          alt={player.name}
          className="player-image"
        />
      </div>

      <div className="player-info">
        <h2>{player.name}</h2>

        <div className="club">
          {player.club}
        </div>
      </div>

      <div className="stats">
        <div>
          <strong>99</strong>
          <span>PAC</span>
        </div>

        <div>
          <strong>95</strong>
          <span>SHO</span>
        </div>

        <div>
          <strong>91</strong>
          <span>PAS</span>
        </div>

        <div>
          <strong>98</strong>
          <span>DRI</span>
        </div>

        <div>
          <strong>40</strong>
          <span>DEF</span>
        </div>

        <div>
          <strong>84</strong>
          <span>PHY</span>
        </div>
      </div>

      <div className="shine"></div>
    </motion.div>
  );
}