import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import {
  AuthDivider,
  AuthField,
  AuthFormFooter,
  AuthInput,
  AuthLink,
  AuthMetaLinks,
  AuthPrimaryButton,
  AuthSecondaryButton,
  AuthTextLink,
} from '../../components/auth/auth-ui';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { DEMO_USER, useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const redirectTo = searchParams.get('redirect');
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? decodeURIComponent(redirectTo)
      : '/';

  const completeSignIn = (user: typeof DEMO_USER) => {
    login(user);
    navigate(safeRedirect, { replace: true });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      const displayName = email.includes('@') ? email.split('@')[0] : 'Demo User';
      completeSignIn({
        name: displayName.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim() || DEMO_USER.email,
        department: DEMO_USER.department,
      });
      setBusy(false);
    }, 350);
  };

  const handleDemo = () => {
    setBusy(true);
    window.setTimeout(() => {
      completeSignIn(DEMO_USER);
      setBusy(false);
    }, 200);
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your procurement workspace."
      footer={
        <AuthFormFooter>
          Don&apos;t have an account? <AuthLink to="/signup">Create account</AuthLink>
        </AuthFormFooter>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField id="login-email" label="Work email">
            <AuthInput
              id="login-email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AuthField>

          <AuthField
            id="login-password"
            label="Password"
            labelAside={<AuthTextLink to="/forgot-password">Forgot password?</AuthTextLink>}
          >
            <PasswordField
              id="login-password"
              name="password"
              placeholder="Any password works in demo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthField>

          <div className="flex items-center gap-2.5 pt-0.5">
            <Checkbox
              id="login-remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
              className="size-[18px] rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)]"
            />
            <Label
              htmlFor="login-remember"
              className="cursor-pointer text-[14px] font-normal leading-none text-[#475467]"
            >
              Keep me signed in
            </Label>
          </div>

          <AuthPrimaryButton type="submit" loading={busy} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </AuthPrimaryButton>
        </form>

        <AuthDivider />

        <AuthSecondaryButton type="button" onClick={handleDemo} disabled={busy}>
          Continue as demo
        </AuthSecondaryButton>

        <AuthMetaLinks>
          <AuthTextLink to="/presentation" className="text-[#667085] hover:text-[var(--p2p-brand)]">
            Client presentation
          </AuthTextLink>
          <span className="mx-2 text-[#D0D5DD]">·</span>
          <span>SSO in production</span>
        </AuthMetaLinks>
      </div>
    </AuthLayout>
  );
}
