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
import { GroupSetup } from './pages/setup/GroupSetup';
import { DepartmentLocationSetup } from './pages/setup/DepartmentLocationSetup';
import { PurchaseRequestOptions } from './pages/setup/PurchaseRequestOptions';
import { PurchaseOrderOptions } from './pages/setup/PurchaseOrderOptions';
import { ReceivingOptions } from './pages/setup/ReceivingOptions';
import { CustomOptions } from './pages/setup/CustomOptions';
import { GlobalApprovalSetup } from './pages/setup/GlobalApprovalSetup';
import { ApprovalWorkflowSetup } from './pages/setup/ApprovalWorkflowSetup';
import { ApprovalGroupSetup } from './pages/setup/ApprovalGroupSetup';
import { FilterProfileSetup } from './pages/setup/FilterProfileSetup';
import { AccountSetup } from './pages/setup/AccountSetup';
import { ProjectSetup } from './pages/setup/ProjectSetup';
import { BudgetSetup } from './pages/setup/BudgetSetup';
import { VendorSetup } from './pages/setup/VendorSetup';
import { VendorPortal } from './pages/vendor/VendorPortal';
import { AddressSetup } from './pages/setup/AddressSetup';
import { UserSetup } from './pages/setup/UserSetup';
import { UnitOfMeasureSetup } from './pages/setup/UnitOfMeasureSetup';
import { ItemSetup } from './pages/setup/ItemSetup';
import { ShippingMethodSetup } from './pages/setup/ShippingMethodSetup';
import { PurchaseOrderTemplateSettings } from './pages/setup/PurchaseOrderTemplateSettings';
import { PurchaseOrderTemplatePreview } from './pages/setup/PurchaseOrderTemplatePreview';
import { GeneratePurchaseOrder } from './pages/po/GeneratePurchaseOrder';
import { PurchaseOrdersWorkspace } from './pages/po/PurchaseOrdersWorkspace';
import { Reports } from './pages/Reports';
import { ReportsLayout } from './pages/ReportsLayout';
import { ReportsRedirect } from './pages/ReportsRedirect';

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
          {
            path: '/setup/group',
            Component: GroupSetup,
          },
          {
            path: '/setup/department-location',
            Component: DepartmentLocationSetup,
          },
          {
            path: '/setup/purchase-request-options',
            Component: PurchaseRequestOptions,
          },
          {
            path: '/setup/purchase-order-options',
            Component: PurchaseOrderOptions,
          },
          {
            path: '/setup/receiving-options',
            Component: ReceivingOptions,
          },
          {
            path: '/setup/custom-options',
            Component: CustomOptions,
          },
          {
            path: '/setup/global-approvals',
            Component: GlobalApprovalSetup,
          },
          {
            path: '/setup/approval-workflow',
            Component: ApprovalWorkflowSetup,
          },
          {
            path: '/setup/approval-group',
            Component: ApprovalGroupSetup,
          },
          {
            path: '/setup/filter-profiles',
            Component: FilterProfileSetup,
          },
          {
            path: '/setup/account',
            Component: AccountSetup,
          },
          {
            path: '/setup/project',
            Component: ProjectSetup,
          },
          {
            path: '/setup/budget',
            Component: BudgetSetup,
          },
          {
            path: '/setup/vendor',
            Component: VendorSetup,
          },
          {
            path: '/vendor-portal/:vendorId',
            Component: VendorPortal,
          },
          {
            path: '/setup/address',
            Component: AddressSetup,
          },
          {
            path: '/setup/user',
            Component: UserSetup,
          },
          {
            path: '/setup/unit-of-measure',
            Component: UnitOfMeasureSetup,
          },
          {
            path: '/setup/item',
            Component: ItemSetup,
          },
          {
            path: '/setup/shipping-method',
            Component: ShippingMethodSetup,
          },
          {
            path: '/setup/po-template',
            Component: PurchaseOrderTemplateSettings,
          },
          {
            path: '/setup/po-template/preview',
            Component: PurchaseOrderTemplatePreview,
          },
          {
            path: '/purchase-orders',
            Component: PurchaseOrdersWorkspace,
          },
          {
            path: '/purchase-orders/generate',
            Component: GeneratePurchaseOrder,
          },
          {
            Component: ReportsLayout,
            children: [
              {
                path: '/reports',
                Component: ReportsRedirect,
              },
              {
                path: '/reports/library/:reportId?',
                Component: Reports,
              },
              {
                path: '/reports/schedules',
                Component: Reports,
              },
              {
                path: '/reports/templates',
                Component: Reports,
              },
              {
                path: '/reports/insights',
                Component: Reports,
              },
            ],
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
