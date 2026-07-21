import { cn } from '../ui/utils';
import logoPng from '../../../imports/Eluv8P2P-final-logo.png';
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
        <p className="text-[2rem] font-bold tracking-[-0.02em] text-white sm:text-[2.5rem]">
          Eluv8P2P
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <img
        src={logoPng}
        alt="Eluv8P2P"
        className="h-[38px] w-auto"
        style={{ display: 'block' }}
      />
    </div>
  );
}
