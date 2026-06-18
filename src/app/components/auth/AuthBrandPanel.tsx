import { Eluv8AuthLogo } from './Eluv8AuthLogo';
import { AuthWatermark } from './AuthWatermark';

/**
 * Left brand column.
 * position: relative + overflow: hidden so the watermark stays scoped here
 * and never bleeds behind the form on the right.
 */
export function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden w-1/2 overflow-hidden md:flex md:items-center md:justify-center"
      style={{
        background: 'linear-gradient(135deg, #0e1c2b 0%, #0a1521 100%)',
      }}
      aria-label="Eluv8P2P"
    >
      <AuthWatermark />
      <div className="relative z-10 px-8">
        <Eluv8AuthLogo variant="panel" />
      </div>
    </aside>
  );
}
