# Element-P2P — Complete File Manifest

Generated: June 8, 2026

---

## Pages (10 files)

```
src/app/pages/
├── auth/
│   ├── ForgotPassword.tsx
│   ├── Login.tsx
│   └── SignUp.tsx
├── ClientPresentation.tsx
├── Dashboard.tsx
├── MainPurchaseRequest.tsx
├── MainPurchaseRequestV1.tsx      # Legacy (not routed)
├── MainPurchaseRequestV2.tsx      # Active PR detail
├── PurchaseRequests.tsx
└── UploadSplit.tsx
```

## App shell (3 files)

```
src/app/
├── App.tsx
├── RootLayout.tsx
└── routes.ts
```

## Feature components (18 files)

```
src/app/components/
├── AddItemModal.tsx
├── DashboardAnalyticsCards.tsx
├── DashboardConfigurationModal.tsx
├── GLDistributionModal.tsx
├── PunchoutVendorCard.tsx
├── PunchoutVendorModal.tsx
├── PunchoutVendorPanel.tsx
├── PurchaseRequestHistoryPanel.tsx
├── PurchaseRequestModal.tsx
├── PurchaseRequestModalV1.tsx
├── RightPanel.tsx
├── SendForApprovalModal.tsx
├── Sidebar.tsx
├── SidebarV1.tsx
├── SkipToMainContent.tsx
├── TopHeader.tsx
├── TopHeaderV1.tsx
└── VersionSwitcher.tsx
```

## Auth components (8 files)

```
src/app/components/auth/
├── AuthBrandPanel.tsx
├── AuthLayout.tsx
├── auth-routes.ts
├── auth-ui.tsx
├── GuestRoute.tsx
├── PasswordField.tsx
├── RedirectHome.tsx
└── RequireAuth.tsx
```

## PR workflow components (12 files)

```
src/app/components/pr-workflow/
├── ApprovalActions.tsx
├── CopyButton.tsx
├── index.ts
├── NextActionPanel.tsx
├── PrintButton.tsx
├── PRWorkflowHeader.tsx
├── StarButton.tsx
├── StatusBadge.tsx
├── WorkflowActionBar.tsx
├── WorkflowActionBar.types.ts
├── WorkflowActionButton.tsx
└── workflowTokens.ts
```

## Page comments (1 file)

```
src/app/components/page-comments/
└── PageCommentSystem.tsx
```

## Figma helper (1 file)

```
src/app/components/figma/
└── ImageWithFallback.tsx
```

## UI kit — shadcn/ui (48 files)

```
src/app/components/ui/
├── accordion.tsx
├── alert-dialog.tsx
├── alert.tsx
├── aspect-ratio.tsx
├── avatar.tsx
├── badge.tsx
├── breadcrumb.tsx
├── button.tsx
├── calendar.tsx
├── card.tsx
├── carousel.tsx
├── chart.tsx
├── checkbox.tsx
├── collapsible.tsx
├── command.tsx
├── context-menu.tsx
├── dialog.tsx
├── drawer.tsx
├── dropdown-menu.tsx
├── form.tsx
├── hover-card.tsx
├── input-otp.tsx
├── input.tsx
├── label.tsx
├── menubar.tsx
├── navigation-menu.tsx
├── pagination.tsx
├── popover.tsx
├── progress.tsx
├── radio-group.tsx
├── resizable.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── sheet.tsx
├── sidebar.tsx
├── skeleton.tsx
├── slider.tsx
├── sonner.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── toggle-group.tsx
├── toggle.tsx
├── tooltip.tsx
├── use-mobile.ts
└── utils.ts
```

## Context (3 files)

```
src/app/context/
├── AuthContext.tsx
├── PageCommentsContext.tsx
└── VersionContext.tsx
```

## Tokens (2 files)

```
src/app/tokens/
├── brand.ts
└── typography.ts
```

## Types (2 files)

```
src/app/types/
├── pageComments.ts
└── prWorkflow.ts
```

## Data (1 file)

```
src/app/data/
└── punchoutVendors.ts
```

## Utils (2 files)

```
src/app/utils/
├── printTransaction.ts
└── starredTransactions.ts
```

## Styles (4 files)

```
src/styles/
├── fonts.css
├── index.css
├── tailwind.css
└── theme.css
```

## Assets (3 SVGs)

```
src/imports/
├── Eluv8P2P-final-logo.svg
├── Logo-for-Figma-1.svg
└── Logo-for-Figma.svg
```

## Entry (1 file)

```
src/main.tsx
```

## Public (1 file)

```
public/
└── _redirects
```

## Scripts (3 files)

```
scripts/
├── gh-pages-assets.mjs
├── migrate-org-pages.ps1
└── patch_pr_header.js
```

## Configuration (root)

```
index.html
package.json
package-lock.json
pnpm-workspace.yaml
vite.config.ts
postcss.config.mjs
default_shadcn_theme.css
tsconfig.json
.env.example
.gitignore
```

## Documentation

```
README.md
HANDOFF.md
MANIFEST.md
ATTRIBUTIONS.md
SHARE-WITH-CLIENT.txt
Share-with-client.bat
.impeccable.md
guidelines/Guidelines.md
```

## CI/CD

```
.github/workflows/deploy-github-pages.yml
```

---

## File counts

| Category | Count |
|----------|-------|
| Pages | 10 |
| Feature components | 18 |
| Auth components | 8 |
| PR workflow components | 12 |
| UI kit components | 48 |
| Contexts | 3 |
| Types | 2 |
| Tokens | 2 |
| Utils | 2 |
| Data | 1 |
| Styles | 4 |
| SVG assets | 3 |
| Scripts | 3 |
| **Total source files** | **~115** |
