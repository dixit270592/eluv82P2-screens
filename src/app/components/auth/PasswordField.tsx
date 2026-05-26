import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthInput } from './auth-ui';
import { cn } from '../ui/utils';

type PasswordFieldProps = Omit<ComponentProps<typeof AuthInput>, 'type'>;

export function PasswordField({ className, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthInput
        type={visible ? 'text' : 'password'}
        className={cn('pr-11', className)}
        autoComplete={props.autoComplete ?? 'current-password'}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-[#98A2B3] transition-colors hover:bg-[#F2F4F7] hover:text-[#475467]"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
      </button>
    </div>
  );
}
