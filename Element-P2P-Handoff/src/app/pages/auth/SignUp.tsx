import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import {
  authInputClass,
  AuthField,
  AuthFormFooter,
  AuthInput,
  AuthLink,
  AuthPrimaryButton,
} from '../../components/auth/auth-ui';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { cn } from '../../components/ui/utils';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = [
  'Procurement',
  'Finance / AP',
  'Operations',
  'IT',
  'Engineering',
  'Other',
] as const;

export function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (confirmPassword && password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    setBusy(true);
    window.setTimeout(() => {
      login({
        name: fullName.trim() || 'New User',
        email: email.trim() || 'new.user@company.com',
        department,
      });
      navigate('/', { replace: true });
      setBusy(false);
    }, 450);
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up a profile to explore Element P2P. No email verification in this demo."
      footer={
        <AuthFormFooter>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </AuthFormFooter>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField id="signup-name" label="Full name" className="sm:col-span-2">
              <AuthInput
                id="signup-name"
                name="name"
                autoComplete="name"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </AuthField>

            <AuthField id="signup-email" label="Work email" className="sm:col-span-2">
              <AuthInput
                id="signup-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </AuthField>

            <AuthField id="signup-department" label="Department" className="sm:col-span-2">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="signup-department" className={cn('w-full', authInputClass)}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AuthField>

            <AuthField id="signup-password" label="Password">
              <PasswordField
                id="signup-password"
                name="password"
                autoComplete="new-password"
                placeholder="Create password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMismatch(false);
                }}
              />
            </AuthField>

            <AuthField id="signup-confirm" label="Confirm">
              <PasswordField
                id="signup-confirm"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter (optional)"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMismatch(false);
                }}
                aria-invalid={mismatch}
              />
              {mismatch ? (
                <p className="text-[12px] text-[#D92D20]" role="alert">
                  Passwords don&apos;t match — leave blank to skip in demo.
                </p>
              ) : null}
            </AuthField>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-[#F2F4F7] bg-[#FAFBFC] px-3.5 py-3">
            <Checkbox
              id="signup-terms"
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
              className="mt-0.5 size-[18px] rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)]"
            />
            <Label
              htmlFor="signup-terms"
              className="cursor-pointer text-[13px] font-normal leading-relaxed text-[#475467]"
            >
              I agree to the <span className="font-medium text-[#344054]">Terms</span> and{' '}
              <span className="font-medium text-[#344054]">Privacy Policy</span>
            </Label>
          </div>

          <div className="pt-1">
            <AuthPrimaryButton type="submit" loading={busy} disabled={busy || !terms}>
              {busy ? 'Creating account…' : 'Create account'}
            </AuthPrimaryButton>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
