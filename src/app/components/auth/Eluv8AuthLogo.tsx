import { cn } from '../ui/utils';
import { Eluv8LogoMark } from './Eluv8LogoMark';

/** Login accent green (per design spec). */
export const LOGIN_GREEN = '#15bd82';
export const LOGIN_GREEN_HOVER = '#119d6c';

type Eluv8AuthLogoProps = {
  variant: 'panel' | 'card';
  className?: string;
};

export function Eluv8AuthLogo({ variant, className }: Eluv8AuthLogoProps) {
  if (variant === 'panel') {
    return (
      <div className={cn('flex flex-col items-center gap-5 text-center', className)}>
        <Eluv8LogoMark className="h-16 w-auto sm:h-[4.5rem]" color="#ffffff" />
        <p className="text-[2rem] font-bold tracking-[-0.02em] sm:text-[2.5rem]">
          <span className="text-white">Eluv8</span>
          <span style={{ color: LOGIN_GREEN }}>P2P</span>
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Eluv8LogoMark className="h-7 w-auto" color={LOGIN_GREEN} />
      <span className="text-[1.125rem] font-bold tracking-[-0.01em] text-[#101828]">Eluv8P2P</span>
    </div>
  );
}
