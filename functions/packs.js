const PACKS = {
  bronze: { name: "Bronze Coin Pack", tokens: 5, amount: "5.00" },
  silver: { name: "Silver Coin Pack", tokens: 25, amount: "25.00" },
  gold: { name: "Gold Coin Pack", tokens: 60, amount: "60.00" },
  platinum: { name: "Platinum Coin Pack", tokens: 150, amount: "150.00" },
};

function getPack(packId) {
  return PACKS[packId] || null;
}

module.exports = { PACKS, getPack };