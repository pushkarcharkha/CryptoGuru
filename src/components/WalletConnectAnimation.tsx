

const generateHexGrid = () => {
  const hexes = [];
  const rows = 5;
  const cols = 7;
  const hexRadius = 25;
  const hexHeight = hexRadius * Math.sqrt(3);
  const hexWidth = hexRadius * 2;
  const hDist = hexWidth * 0.75;
  const vDist = hexHeight;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * hDist + 80;
      const y = r * vDist + (c % 2 === 0 ? 0 : vDist / 2) + 120;
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        points.push(`${x + hexRadius * Math.cos(angle)},${y + hexRadius * Math.sin(angle)}`);
      }
      hexes.push({ points: points.join(' ') });
    }
  }
  return hexes;
};

export const WalletConnectAnimation = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: '#050508',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeOut 0.5s ease forwards 1.8s'
  }}>
    <svg width="400" height="400" viewBox="0 0 400 400">
      {/* Hexagon grid that assembles */}
      {generateHexGrid().map((hex, i) => (
        <polygon
          key={i}
          points={hex.points}
          fill="none"
          stroke="#00ff88"
          strokeWidth="0.5"
          opacity="0.3"
          style={{
            strokeDasharray: 100,
            strokeDashoffset: 100,
            animation: `hexAppear 0.3s ease forwards ${i * 0.02}s`
          }}
        />
      ))}
      <text x="200" y="210" textAnchor="middle" fill="#00ff88" fontSize="14" fontFamily="JetBrains Mono, monospace" style={{ animation: 'fadeIn 0.5s ease forwards 0.5s', opacity: 0 }}>
        WALLET CONNECTED
      </text>
    </svg>
  </div>
);
