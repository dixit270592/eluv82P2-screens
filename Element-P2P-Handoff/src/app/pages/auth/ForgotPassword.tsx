import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import {
  AuthField,
  AuthFormFooter,
  AuthInput,
  AuthLink,
  AuthPrimaryButton,
  AuthTextLink,
} from '../../components/auth/auth-ui';
import { DEMO_USER } from '../../context/AuthContext';
import { P2P_BRAND } from '../../tokens/brand';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setSent(true);
      setBusy(false);
    }, 400);
  };

  const displayEmail = email.trim() || DEMO_USER.email;

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send a reset link to your work email. No email is sent in this demo."
      footer={
        !sent ? (
          <AuthFormFooter>
            <AuthLink to="/login" className="inline-flex items-center justify-center gap-1.5">
              <ArrowLeft className="size-4" aria-hidden />
              Back to sign in
            </AuthLink>
          </AuthFormFooter>
        ) : undefined
      }
    >
      {sent ? (
        <div className="space-y-6 py-1 text-center">
          <div
            className="mx-auto flex size-16 items-center justify-center rounded-full"
            style={{ background: P2P_BRAND.surface }}
          >
            <CheckCircle2
              className="size-8"
              style={{ color: P2P_BRAND.primary }}
              strokeWidth={1.75}
              aria-hidden
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-[1.125rem] font-semibold tracking-tight text-[#101828]">
              Check your inbox
            </h2>
            <p className="mx-auto max-w-[280px] text-[14px] leading-relaxed text-[#667085]">
              If an account exists for{' '}
              <span className="font-medium text-[#344054]">{displayEmail}</span>, a reset link
              would arrive shortly.
            </p>
            <p className="text-[12px] text-[#98A2B3]">
              Demo: no email sent — sign in with any password instead.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <AuthPrimaryButton type="button" onClick={() => navigate('/login')}>
              Return to sign in
            </AuthPrimaryButton>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[13px] font-medium text-[#667085] transition-colors hover:text-[#344054]"
            >
              Try a different email
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthField
              id="forgot-email"
              label="Work email"
              hint="Reset links expire after 24 hours in production."
            >
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#98A2B3]"
                  aria-hidden
                />
                <AuthInput
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </AuthField>

            <AuthPrimaryButton type="submit" loading={busy} disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </AuthPrimaryButton>
          </form>

          <p className="text-center text-[13px] text-[#667085]">
            Remember your password? <AuthTextLink to="/login">Sign in</AuthTextLink>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
