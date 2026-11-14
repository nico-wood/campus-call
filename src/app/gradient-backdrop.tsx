/** Slow CSS-only motion. Reduced-motion users receive the same static composition. */
export function GradientBackdrop() {
  return <div className="ambient-backdrop" data-backdrop-ready="true" aria-hidden="true"><div className="ambient-green" /><div className="ambient-gold" /><div className="ambient-texture" /></div>;
}
