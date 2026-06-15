import logoSvg from '../../../imports/Eluv8P2P-final-logo.svg';
import { SkipToMainContent } from '../SkipToMainContent';
import { AuthBrandPanel } from './AuthBrandPanel';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] font-sans text-foreground antialiased">
      <SkipToMainContent />
      {/* Column split: 42% brand | 58% form (change both % in grid-cols together) */}
      <div className="flex min-h-[100dvh] flex-col lg:grid lg:grid-cols-[42%_58%]">
        <AuthBrandPanel />

        <main
          id="main-content"
          className="flex w-full min-w-0 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-14"
        >
          <div className="w-full max-w-[min(460px,92%)]">
            {/* Mobile logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <img src={logoSvg} alt="" className="h-7 w-auto opacity-90" aria-hidden />
            </div>

            <article
              className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <header className="border-b border-[#F2F4F7] px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
                <h1 className="text-[1.625rem] font-semibold tracking-[-0.02em] text-[#101828] sm:text-[1.75rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-[32rem] text-[14px] leading-relaxed text-[#667085]">
                  {subtitle}
                </p>
              </header>

              <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>

              {footer ? (
                <footer className="border-t border-[#F2F4F7] bg-[#FAFBFC] px-6 py-4 sm:px-8">
                  {footer}
                </footer>
              ) : null}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
