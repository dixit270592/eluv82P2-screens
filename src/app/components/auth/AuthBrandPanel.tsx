import { Link } from 'react-router';
import { FileText, Shield, Workflow } from 'lucide-react';
import logoSvg from '../../../imports/Eluv8P2P-final-logo.svg';
import { P2P_BRAND } from '../../tokens/brand';

const POINTS = [
  { icon: FileText, text: 'Purchase requests and approvals' },
  { icon: Workflow, text: 'Workflows that fit your organization' },
  { icon: Shield, text: 'Controls for procurement teams' },
] as const;

/** Brand column — balanced depth without clutter. */
export function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden min-h-[100dvh] w-full flex-col justify-center overflow-hidden lg:flex"
      style={{
        background: 'linear-gradient(168deg, #0f172a 0%, #1a2744 52%, #0f172a 100%)',
      }}
      aria-label="Element P2P"
    >
      <div
        className="pointer-events-none absolute -right-16 top-[15%] size-56 rounded-full blur-[72px]"
        style={{ background: `${P2P_BRAND.primary}35` }}
      />
      <div
        className="pointer-events-none absolute bottom-[10%] left-0 size-40 rounded-full blur-[48px]"
        style={{ background: `${P2P_BRAND.primary}18` }}
      />

      <div className="relative z-10 w-full max-w-[22rem] py-14 pl-10 pr-6 sm:pl-12 lg:pl-14 lg:pr-8 xl:pl-16 xl:py-16">
        <Link
          to="/login"
          className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <img src={logoSvg} alt="Element P2P" className="h-8 w-auto brightness-0 invert sm:h-9" />
        </Link>

        <h2 className="mt-10 text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-white">
          Clarity across every purchase request
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
          A single workspace for requests, approvals, and PO tracking.
        </p>

        <ul className="mt-10 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5"
                style={{ color: P2P_BRAND.primary }}
              >
                <Icon className="size-[17px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-[14px] leading-snug text-slate-300">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
