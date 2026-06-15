# Element-P2P — Developer Handoff Package

**Package version:** 1.0  
**Date:** June 8, 2026  
**Figma source:** [Element-P2P Design File](https://www.figma.com/design/80cbcFfKJsO0Vfz7F4jZ6k/Element-P2P)

This package contains everything required to run, extend, and integrate the Element-P2P procurement UI prototype. No additional files are needed from the design team.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# → http://localhost:5173

# 3. Production build
npm run build
# → output in dist/

# 4. Preview production build locally
npm run preview
```

### Demo credentials

Authentication is **demo-only** (no backend). On `/login`, use any email/password or click through with the demo user. Session persists in `localStorage` under `element_p2p_demo_session`.

### Client presentation walkthrough

Open `/presentation` for the guided client demo navigator. Sample PR detail: `/pr/PR-26016-774`.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 6 |
| Framework | React 18 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (CSS-first config) |
| UI kit | shadcn/ui (Radix primitives) |
| Icons | lucide-react |
| Charts | Recharts |
| Fonts | Instrument Sans (Google Fonts CDN) |

---

## Project Structure

```
Element-P2P-Handoff/
├── index.html                 # SPA entry HTML
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite config, @ alias, Figma asset resolver
├── postcss.config.mjs         # PostCSS (Tailwind via Vite plugin)
├── default_shadcn_theme.css   # Reference shadcn theme (not imported by app)
├── .env.example               # Environment variable template
├── tsconfig.json              # TypeScript config for IDE/tooling
│
├── public/
│   └── _redirects             # Netlify SPA fallback
│
├── scripts/
│   ├── gh-pages-assets.mjs    # Copies index.html → 404.html for GitHub Pages
│   ├── migrate-org-pages.ps1  # Org Pages migration helper
│   └── patch_pr_header.js     # One-off patch script
│
├── .github/workflows/
│   └── deploy-github-pages.yml
│
├── guidelines/
│   └── Guidelines.md          # Design guidelines template
│
└── src/
    ├── main.tsx               # React entry point
    ├── imports/               # SVG logos (3 files)
    ├── styles/
    │   ├── index.css          # Global CSS entry
    │   ├── fonts.css          # Instrument Sans import
    │   ├── tailwind.css       # Tailwind v4 + tw-animate-css
    │   └── theme.css          # Design tokens, brand colors, responsive grids
    └── app/
        ├── App.tsx            # RouterProvider wrapper
        ├── RootLayout.tsx     # Layout + page comment system
        ├── routes.ts          # All route definitions
        ├── pages/             # Screen components (see Screen Inventory)
        ├── components/        # Feature + UI components (88 files)
        ├── context/           # Auth, Version, PageComments contexts
        ├── tokens/            # brand.ts, typography.ts
        ├── types/             # prWorkflow.ts, pageComments.ts
        ├── data/              # punchoutVendors.ts mock catalog
        └── utils/             # starredTransactions.ts, printTransaction.ts
```

---

## Screen Inventory (Complete)

### Routed screens (8 routes + catch-all)

| Route | Auth | File | Description |
|-------|------|------|-------------|
| `/login` | Guest | `src/app/pages/auth/Login.tsx` | Demo login form |
| `/signup` | Guest | `src/app/pages/auth/SignUp.tsx` | Demo signup form |
| `/forgot-password` | Guest | `src/app/pages/auth/ForgotPassword.tsx` | Password reset UI |
| `/presentation` | Public | `src/app/pages/ClientPresentation.tsx` | Client walkthrough navigator |
| `/upload-split` | Public | `src/app/pages/UploadSplit.tsx` | PDF upload & split workflow |
| `/` | Auth | `src/app/pages/Dashboard.tsx` | Dashboard with analytics, PR list, punchout |
| `/purchase-requests` | Auth | `src/app/pages/PurchaseRequests.tsx` | PR list with filters & starred |
| `/pr/:prId` | Auth | `src/app/pages/MainPurchaseRequest.tsx` | PR detail wrapper → V2 |
| `*` | — | `src/app/components/auth/RedirectHome.tsx` | Catch-all → `/` |

### Internal / legacy screens (included, not routed)

| File | Role |
|------|------|
| `src/app/pages/MainPurchaseRequestV2.tsx` | **Active** PR detail implementation |
| `src/app/pages/MainPurchaseRequestV1.tsx` | Legacy V1 PR screen (reference only) |

### Modals & overlays (triggered from screens)

| Component | Triggered from |
|-----------|----------------|
| `PurchaseRequestModal.tsx` | Dashboard, Purchase Requests (New Request) |
| `PurchaseRequestModalV1.tsx` | Legacy V1 flow |
| `AddItemModal.tsx` | PR detail line items |
| `GLDistributionModal.tsx` | PR detail GL distribution |
| `SendForApprovalModal.tsx` | PR workflow actions |
| `DashboardConfigurationModal.tsx` | Dashboard settings |
| `PunchoutVendorModal.tsx` | Dashboard punchout panel |
| `PageCommentSystem.tsx` | All non-auth routes (annotation overlay) |

---

## Responsive Design Coverage

### Breakpoints in use

| Breakpoint | Where | Behavior |
|------------|-------|----------|
| **768px** | `use-mobile.ts`, `sidebar.tsx` | Mobile drawer vs desktop sidebar |
| **560px** | `theme.css` `.app-stat-grid` | 4-col → 2-col → 1-col stat cards |
| **520px** | `theme.css` `.app-metric-grid` | 4-col → 3-col → 2-col → 1-col metrics |
| **900px** | `theme.css` `.app-metric-grid` | Metric grid column reduction |
| **1200px** | `theme.css` `.app-stat-grid` | Stat grid 4-col → 2-col |
| **1400px** | `theme.css` `.app-metric-grid` | Metric grid 4-col → 3-col |
| **sm/md/lg/xl** | Auth pages, analytics cards, UI kit | Tailwind responsive utilities |

### Responsive status by screen

| Screen | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Auth (Login/Signup/Forgot) | ✅ Full split layout | ✅ Stacked layout | ✅ Single column |
| Dashboard | ✅ Full layout | ⚠️ Partial (fixed widths on some panels) | ⚠️ Sidebar collapses; some panels fixed-width |
| Purchase Requests | ✅ Full table | ⚠️ Table scroll | ⚠️ Horizontal scroll |
| PR Detail (V2) | ✅ Full workspace | ⚠️ Fixed layout | ⚠️ Fixed layout (dev integration needed) |
| Client Presentation | ✅ Side nav + content | ⚠️ Sticky nav | ⚠️ Fixed 260px sidebar |
| Upload Split | ✅ Full layout | ⚠️ Fixed layout | ⚠️ Fixed layout |

> **Note:** Core app screens (Dashboard, PR detail) use fixed pixel layouts in places. Auth and analytics components have the strongest responsive coverage. Production integration should add breakpoint refinements for PR detail and dashboard panels.

---

## Design System

### CSS tokens (`src/styles/theme.css`)

- shadcn semantic tokens: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--radius`, sidebar tokens, chart colors
- Brand greens: `--p2p-brand`, `--p2p-brand-hover`, `--p2p-brand-strong`, `--p2p-brand-surface`, `--p2p-brand-border`
- Layout: `--space-1`…`--space-4`, `--layout-sticky-clearance`
- Dark mode via `.dark` class

### TypeScript tokens

- `src/app/tokens/brand.ts` — `P2P_BRAND` color constants
- `src/app/tokens/typography.ts` — `UI_FONT_STACK`
- `src/app/components/pr-workflow/workflowTokens.ts` — workflow chrome dimensions

### UI component library

Full shadcn/ui kit in `src/app/components/ui/` (46 components + `utils.ts` + `use-mobile.ts`).

---

## Assets

| Asset | Path | Used by |
|-------|------|---------|
| Eluv8 P2P logo | `src/imports/Eluv8P2P-final-logo.svg` | TopHeader, AuthLayout, AuthBrandPanel |
| Legacy logo | `src/imports/Logo-for-Figma.svg` | SidebarV1, TopHeaderV1 |
| Unused logo | `src/imports/Logo-for-Figma-1.svg` | Not referenced |
| Font | Google Fonts CDN | Instrument Sans via `fonts.css` |
| Icons | lucide-react | Throughout app |
| Vendor logos | Clearbit CDN | `punchoutVendors.ts` (remote URLs) |

---

## State & Data (Demo / Mock)

**No backend API layer exists.** All data is mock or localStorage-driven.

### Contexts

| Context | Hook | Purpose |
|---------|------|---------|
| `AuthContext.tsx` | `useAuth()` | Demo session |
| `VersionContext.tsx` | `useVersion()` | V1/V2 preference |
| `PageCommentsContext.tsx` | `usePageComments()` | Page annotations |

### localStorage keys

| Key | Purpose |
|-----|---------|
| `element_p2p_demo_session` | Auth session |
| `eluv8_version` | V1/V2 UI preference |
| `eluv8_page_comments` | Page comment annotations |
| `eluv8_comment_author` | Comment author role |
| `element-p2p-starred-prs` | Starred PR IDs |
| `pr-cancelled-ids` | Cancelled PR IDs |
| Dynamic `getStorageKey(prId)` | PR detail state per PR |

### Mock data locations

- `Dashboard.tsx` — inline `allPRs[]` + metrics
- `PurchaseRequests.tsx` — inline `allPRs[]`
- `punchoutVendors.ts` — 6 vendor catalog entries
- `MainPurchaseRequestV2.tsx` — default PR state, approvers
- `prWorkflow.ts` — status helpers, `DEFAULT_NEXT_ACTION`
- `PurchaseRequestHistoryPanel.tsx` — `MOCK_USERS`

---

## Integration Checklist for Dev Team

- [ ] Replace demo auth (`AuthContext.tsx`) with real authentication
- [ ] Connect PR list/detail to backend APIs (replace inline mock arrays)
- [ ] Wire punchout vendors to `/api/punchout/vendors` (placeholder in `punchoutVendors.ts`)
- [ ] Replace localStorage persistence with server-side state
- [ ] Add responsive refinements for PR detail and dashboard on tablet/mobile
- [ ] Remove or wire `VersionSwitcher.tsx` (orphaned — context exists, UI not mounted)
- [ ] Decide fate of V1 legacy files (`*V1.tsx`) — keep for reference or remove
- [ ] Configure `VITE_BASE_PATH` for deployment target (see `.env.example`)
- [ ] Review unused dependencies (`@mui/*`, `react-dnd`, etc.) — safe to prune

---

## Deployment

### Local / Netlify

1. `npm run build` → drag `dist/` to [Netlify Drop](https://app.netlify.com/drop)
2. `public/_redirects` handles SPA routing on Netlify

### GitHub Pages

1. Set `VITE_BASE_PATH=/<repo-name>/` in CI (see `.github/workflows/deploy-github-pages.yml`)
2. `scripts/gh-pages-assets.mjs` creates `404.html` for SPA fallback

### Windows helper

Double-click `Share-with-client.bat` to build and open Netlify Drop automatically.

---

## Environment Variables

See `.env.example`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_BASE_PATH` | `/` | Asset base path for subpath deployments |

---

## Support Files

| File | Purpose |
|------|---------|
| `README.md` | Basic run instructions |
| `MANIFEST.md` | Complete file inventory |
| `ATTRIBUTIONS.md` | shadcn/ui MIT + Unsplash credits |
| `SHARE-WITH-CLIENT.txt` | Client sharing instructions |
| `.impeccable.md` | Design context & quality bar |

---

## Verification Checklist (Pre-Delivery)

- [x] All 8 routed screens included
- [x] Legacy V1 screens included for reference
- [x] All 88 component files included
- [x] All 3 SVG logo assets included
- [x] Font configuration (CDN) documented
- [x] Design tokens (CSS + TS) included
- [x] Mock data & contexts included
- [x] Auth guards & route config included
- [x] Build & deploy scripts included
- [x] CI workflow for GitHub Pages included
- [x] Dependencies lockfile included
- [x] Responsive breakpoint documentation included
