import watermarkTile from '../../../imports/eluv8-watermark-tile.svg';

const TILE = 120;

/**
 * Repeating Eluv8 cube watermark — uses the real logo mark (M251.32…),
 * NOT the flat hexagon from Logo-for-Figma (M321.7…).
 * Scoped inside the left brand panel only.
 */
export function AuthWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${watermarkTile})`,
        backgroundSize: `${TILE}px ${TILE}px`,
      }}
      aria-hidden
    />
  );
}
