import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { PurchaseRequests } from './pages/PurchaseRequests';
import { MainPurchaseRequest } from './pages/MainPurchaseRequest';
import { ClientPresentation } from './pages/ClientPresentation';
import { UploadSplit } from './pages/UploadSplit';
import { RootLayout } from './RootLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { GuestRoute } from './components/auth/GuestRoute';
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { RedirectHome } from './components/auth/RedirectHome';

/** Must match Vite `base` (GitHub project site: /repo-name/ → basename /repo-name). */
function routerBasename(): string | undefined {
  const raw = import.meta.env.BASE_URL;
  if (raw === '/' || raw === '') return undefined;
  return raw.replace(/\/$/, '') || undefined;
}

export const router = createBrowserRouter(
[
  {
    Component: RootLayout,
    children: [
      {
        Component: GuestRoute,
        children: [
          { path: '/login', Component: Login },
          { path: '/signup', Component: SignUp },
          { path: '/forgot-password', Component: ForgotPassword },
        ],
      },
      {
        path: '/presentation',
        Component: ClientPresentation,
      },
      {
        path: '/upload-split',
        Component: UploadSplit,
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: '/',
            Component: Dashboard,
          },
          {
            path: '/purchase-requests',
            Component: PurchaseRequests,
          },
          {
            path: '/pr/:prId',
            Component: MainPurchaseRequest,
          },
        ],
      },
      {
        path: '*',
        Component: RedirectHome,
      },
    ],
  },
],
{ basename: routerBasename() },
);
