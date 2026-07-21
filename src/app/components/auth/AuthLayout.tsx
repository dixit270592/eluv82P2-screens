import { SkipToMainContent } from '../SkipToMainContent';
import logoSvg from '../../../imports/Eluv8P2P-final-logo.png';
import { AuthBrandPanel } from './AuthBrandPanel';
import { Eluv8AuthLogo, LOGIN_GREEN } from './Eluv8AuthLogo';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'login';
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = 'default',
}: AuthLayoutProps) {
  const isLogin = variant === 'login';

  return (
    <div className="flex min-h-[100dvh] font-sans text-foreground antialiased">
      <SkipToMainContent />

      {/* Left brand panel — relative + overflow-hidden, watermark scoped inside */}
      <AuthBrandPanel />

      {/* Right form panel — plain light, no pattern */}
      <main
        id="main-content"
        className="flex w-full flex-1 items-center justify-center bg-[#f6f8fa] px-5 py-10 sm:px-8 sm:py-12 md:w-1/2"
      >
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark (left panel is hidden below md) */}
          <div className="mb-8 flex justify-center md:hidden">
            {isLogin ? (
              <Eluv8AuthLogo variant="card" />
            ) : (
              <img src={logoSvg} alt="" className="h-7 w-auto opacity-90" aria-hidden />
            )}
          </div>

          <article
            className={
              isLogin
                ? 'relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(16,24,40,0.08),0_2px_6px_rgba(16,24,40,0.04)] sm:p-10'
                : 'overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]'
            }
          >
            {/* 3px green accent across the top edge */}
            {isLogin ? (
              <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: LOGIN_GREEN }} aria-hidden />
            ) : null}

            {isLogin ? (
              <header className="mb-7">
                <Eluv8AuthLogo variant="card" className="mb-6" />
                <h1 className="text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-[#101828]">
                  {title}
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed text-[#667085]">{subtitle}</p>
              </header>
            ) : (
              <header className="border-b border-[#F2F4F7] px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
                <h1 className="text-[1.625rem] font-semibold tracking-[-0.02em] text-[#101828] sm:text-[1.75rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-[32rem] text-[14px] leading-relaxed text-[#667085]">{subtitle}</p>
              </header>
            )}

            <div className={isLogin ? undefined : 'px-6 py-6 sm:px-8 sm:py-7'}>{children}</div>

            {footer ? (
              <footer
                className={
                  isLogin ? 'mt-7 text-center' : 'border-t border-[#F2F4F7] bg-[#FAFBFC] px-6 py-4 sm:px-8'
                }
              >
                {footer}
              </footer>
            ) : null}
          </article>
        </div>
      </main>
    </div>
  );
}
