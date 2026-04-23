import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { PurchaseRequests } from './pages/PurchaseRequests';
import { MainPurchaseRequest } from './pages/MainPurchaseRequest';
import { ClientPresentation } from './pages/ClientPresentation';
import { UploadSplit } from './pages/UploadSplit';

/** Must match Vite `base` (GitHub project site: /repo-name/ → basename /repo-name). */
function routerBasename(): string | undefined {
  const raw = import.meta.env.BASE_URL;
  if (raw === '/' || raw === '') return undefined;
  return raw.replace(/\/$/, '') || undefined;
}

export const router = createBrowserRouter(
[
  {
    path: '/presentation',
    Component: ClientPresentation,
  },
  {
    path: '/upload-split',
    Component: UploadSplit,
  },
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
  {
    path: '*',
    Component: Dashboard,
  },
],
{ basename: routerBasename() },
);
