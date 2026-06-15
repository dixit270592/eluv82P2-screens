import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { P2P_BRAND } from '../../tokens/brand';

/** Shared field spacing and input styling for auth screens. */
export const authInputClass =
  'h-11 rounded-lg border-[#D0D5DD] bg-white px-3.5 text-[15px] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-[border-color,box-shadow] placeholder:text-[#98A2B3] focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]';

export const authLabelClass = 'text-[13px] font-medium leading-none text-[#344054]';

export function AuthField({
  id,
  label,
  hint,
  labelAside,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  labelAside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className={authLabelClass}>
          {label}
        </Label>
        {labelAside}
      </div>
      {children}
      {hint ? <p className="text-[12px] leading-relaxed text-[#667085]">{hint}</p> : null}
    </div>
  );
}

export const AuthInput = forwardRef<HTMLInputElement, ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input ref={ref} className={cn(authInputClass, className)} {...props} />
  ),
);
AuthInput.displayName = 'AuthInput';

export function AuthLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'font-medium text-[var(--p2p-brand)] underline-offset-4 transition-colors hover:text-[var(--p2p-brand-hover)] hover:underline',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AuthTextLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn('text-[13px] font-medium text-[var(--p2p-brand)] hover:underline', className)}
    >
      {children}
    </Link>
  );
}

const buttonBase =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50';

export function AuthPrimaryButton({
  children,
  className,
  loading,
  ...props
}: ComponentProps<'button'> & { loading?: boolean }) {
  return (
    <button
      type={props.type ?? 'submit'}
      className={cn(
        buttonBase,
        'text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] hover:shadow-[0_2px_6px_rgba(31,169,122,0.22)] active:scale-[0.99]',
        className,
      )}
      style={{ background: P2P_BRAND.primary }}
      onMouseEnter={(e) => {
        if (!props.disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.background = P2P_BRAND.primaryHover;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = P2P_BRAND.primary;
      }}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function AuthSecondaryButton({
  children,
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        buttonBase,
        'border border-[#D0D5DD] bg-white text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-[#98A2B3] hover:bg-[#F9FAFB] active:scale-[0.99]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="relative py-1" aria-hidden={label ? undefined : true}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#EAECF0]" />
      </div>
      {label ? (
        <p className="relative mx-auto w-fit bg-white px-3 text-[12px] font-medium uppercase tracking-wide text-[#98A2B3]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormFooter({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-[14px] leading-relaxed text-[#475467]">{children}</p>
  );
}

export function AuthMetaLinks({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-[#F2F4F7] pt-5 text-center text-[12px] leading-relaxed text-[#98A2B3]">
      {children}
    </p>
  );
}
