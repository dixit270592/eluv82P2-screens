import { cn } from '../ui/utils';
import { ELUV8_CUBE_PATH } from './eluv8CubePath';

type Eluv8LogoMarkProps = {
  className?: string;
  color?: string;
};

/** Authentic Eluv8 isometric cube mark extracted from the official logo SVG. */
export function Eluv8LogoMark({ className, color = '#15bd82' }: Eluv8LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 436 470"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path d={ELUV8_CUBE_PATH} />
    </svg>
  );
}
