import { CSSProperties, FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import { SocialLoginOptions } from '../../components/auth/SocialLoginOptions';
import { LOGIN_GREEN, LOGIN_GREEN_HOVER } from '../../components/auth/Eluv8AuthLogo';
import { AuthDivider, AuthField, AuthInput, AuthTextLink } from '../../components/auth/auth-ui';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { DEMO_USER, useAuth } from '../../context/AuthContext';

const greenScope = {
  '--p2p-brand': LOGIN_GREEN,
  '--p2p-brand-hover': LOGIN_GREEN_HOVER,
} as CSSProperties;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [password, setPassword] = useState('demopassword');
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

  return (
    <AuthLayout variant="login" title="Sign in" subtitle="Access your procurement workspace.">
      <div style={greenScope}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField id="login-email" label="Work email">
            <AuthInput
              id="login-email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="demo@elementp2p.com"
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
              placeholder=""
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

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--p2p-brand)] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors duration-150 hover:bg-[var(--p2p-brand-hover)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-7">
          <AuthDivider label="OR LOG IN WITH" />
        </div>

        <div className="mt-6">
          <SocialLoginOptions disabled={busy} />
        </div>
      </div>
    </AuthLayout>
  );
}
