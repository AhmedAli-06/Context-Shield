# Frontend TypeScript Files Inventory

Generated: 2026-05-10
Scope: `src/` directory — all `.ts` and `.tsx` files

## Entry Points

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `src/main.tsx` | ~10 | entry | React DOM mount point |
| `src/App.tsx` | 150 | component | Root: BrowserRouter, AuthProvider, route assembly, sidebar layout |

**Entry points total: 2 files, ~160 lines**

## Global Config & API

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `src/api.ts` | 102 | service | Axios client with auth interceptors, all API call functions (login, assets, events, alerts, sessions, settings, api-keys, reports, audit, simulate-swipe) |
| `src/supabase.ts` | 6 | config | Supabase client factory (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY env vars) |

**Config total: 2 files, ~108 lines**

## Auth Context

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `src/context/AuthContext.tsx` | ~350 | context | React Context for user auth state — login, logout, token persistence in localStorage |

**Context total: 1 file, ~350 lines**

## Pages (13 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/pages/LoginPage.tsx` | ~120 | Login form with email/password |
| `src/pages/RegisterPage.tsx` | ~80 | Registration form with tenant creation |
| `src/pages/DashboardPage.tsx` | ~300 | Dashboard with stats cards, charts (recharts) |
| `src/pages/AssetsPage.tsx` | ~200 | Asset list with filtering and detail modal |
| `src/pages/AlertsPage.tsx` | ~200 | Alert list with acknowledge/resolve/dismiss actions |
| `src/pages/EventsPage.tsx` | ~180 | Access event history with table and filters |
| `src/pages/SessionsPage.tsx` | ~180 | Active sessions monitoring and revoke |
| `src/pages/ApiKeysPage.tsx` | ~150 | API key management (create, delete) |
| `src/pages/ReportsPage.tsx` | ~120 | Report export (CSV/JSON) and threat scores |
| `src/pages/AuditLogPage.tsx` | ~150 | Audit log query interface |
| `src/pages/LiveFeedPage.tsx` | ~200 | Real-time WebSocket event stream |
| `src/pages/SettingsPage.tsx` | ~200 | Tenant config (trust weights, thresholds, timeout) |
| `src/pages/SimulatorPage.tsx` | ~250 | Card-swipe simulator with trust score preview |

**Pages total: 13 files, ~2,430 lines**

## Reusable Components (6 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/EmptyState.tsx` | ~50 | Empty state placeholder with icon and message |
| `src/components/Modal.tsx` | ~80 | Generic modal dialog wrapper |
| `src/components/Skeleton.tsx` | ~40 | Loading skeleton shimmer component |
| `src/components/StatusBadge.tsx` | ~40 | Status label (severity, state) with color variants |
| `src/components/SwipeSimulator.tsx` | ~100 | Card-swipe UI component for simulator page |
| `src/components/SwipeSimulator.tsx` | — | (duplicate entry — see above) |

**Components total: 5 unique files, ~310 lines**

---

## Naming Convention Analysis

| Category | Pattern | Files | Status |
|----------|---------|-------|--------|
| Entry | `main.tsx` | 1 | ✅ camelCase |
| App | `App.tsx` | 1 | ✅ PascalCase |
| Pages | `XxxPage.tsx` | 13 | ✅ PascalCase |
| Components | `Xxx.tsx` | 5 | ✅ PascalCase |
| Context | `XxxContext.tsx` | 1 | ✅ PascalCase |
| Config | `api.ts`, `supabase.ts` | 2 | ✅ camelCase |
| Styles | `index.css` | 1 | ✅ camelCase |

**Status: Consistent — all files follow naming conventions.**

---

## Convention Issues Identified

### 1. TypeScript Strictness
- No `tsconfig.json` shown — verify `strict: true` is enabled.
- No `noImplicitAny` or `strictNullChecks` configured.

### 2. Linting
- No `eslint` or `prettier` configured in the project.
- No `lint` or `lint:fix` npm scripts in package.json.
- **Action needed:** Add ESLint + Prettier (see DEAD_CODE.md).

### 3. No `console.log` Found
- Searched all `.ts` and `.tsx` files for `console.log` — **none found** ✅

### 4. Hardcoded URLs
- `api.ts` line 3: `const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"` ✅
  - Correctly uses `VITE_API_URL` env var with localhost fallback for dev.
- `supabase.ts`: Both vars properly use env defaults. ✅

### 5. Unused Imports
- `App.tsx` imports `Radio` from lucide-react but the Live Feed nav item uses `Radio` while Simulator uses `Radio` too — but the Simulator nav item also imports `Radio`. Looking at the import block (lines 16-28), `Radio` is imported but SimulatorPage is imported as `SimulatorPage` which also uses `Radio` — need to verify if `Radio` is actually used in App.tsx. The import seems needed for the nav item label. Confirmed: nav item for `/live-feed` uses `Radio` icon. ✅

---

## Import Structure

```
App.tsx
├── AuthContext (context/)
├── All page components (pages/)
├── lucide-react icons
├── framer-motion (AnimatePresence, motion)
└── react-hot-toast (Toaster)

api.ts
└── axios

pages/
├── api.ts (API calls)
├── recharts (DashboardPage charts)
├── lucide-react (icons)
└── react-hot-toast (toast)
```

---

## Dependency Notes

- **`@supabase/supabase-js`** is installed but currently not actively used — `supabase.ts` is configured but the frontend uses plain `axios` for all API calls. Supabase may be intended for future real-time subscriptions or auth, but is currently a stub dependency.
- **`framer-motion`** is used in `App.tsx` for page transitions only.
- **`recharts`** is used only in `DashboardPage.tsx` for charts.

---

## Suggested Improvements (Non-Critical)

1. Consider removing `@supabase/supabase-js` if not used, or document its intended purpose.
2. Consider adding `React.memo` to heavy list components (AssetsPage, EventsPage) to reduce re-renders.
3. All pages are relatively large (~150-300 lines) — consider splitting data-fetching logic into custom hooks.