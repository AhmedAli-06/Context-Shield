# Dead Code & Convention Issues Report

Generated: 2026-05-10
Based on: `backend/INVENTORY.md` and `frontend/src/INVENTORY.md`

---

## 1. Files to Remove

None identified — all files in `app/` are imported/used by routers or main.py.

### Cleanup Candidates (Not Removal — Keep for Debugging)
| File | Reason | Action |
|------|--------|--------|
| `reset_db.py` | Utility script, not part of app. Used occasionally. | Keep. Add to `.gitignore` consideration for production. |
| `test_api.py` (root) | Debug script (not pytest). `tests/test_api.py` is the proper test suite. | **Move** to `tests/debug_test_api.py` |
| `test_login.py` (root) | Debug script (not pytest). Manual DB verification. | **Move** to `tests/debug_test_login.py` |

---

## 2. Files to Move

| From | To | Rationale |
|------|----|-----------|
| `backend/test_api.py` | `backend/tests/debug_test_api.py` | Root-level debug script (not pytest). Move to tests/ with descriptive name. |
| `backend/test_login.py` | `backend/tests/debug_test_login.py` | Root-level debug script (not pytest). Move to tests/ with descriptive name. |

---

## 3. Dead Code Candidates (Review for Removal)

### Backend
| File | Issue | Recommendation |
|------|-------|----------------|
| `app/models/__init__.py` | Re-exports everything — any import change to a model requires updating this file. Consider removing if not actively used by other code. | Keep for now; verify `import app.models` usage in main.py and seed.py before removing. |
| `app/ml/generate_data.py` | Only used by `train.py` (via `get_feature_columns`). If ML pipeline is not actively used, could be deprecated. | Keep; mark as ML-only utility. |
| `app/ml/train.py` | ML training CLI script. If no model retraining workflow exists, may be unused. | Keep; mark as admin utility. |

### Frontend
| File | Issue | Recommendation |
|------|-------|----------------|
| `src/supabase.ts` | Supabase client is configured but not used anywhere — `axios` is used for all API calls instead. | Keep (configured for future use); document in code comments. |
| `@supabase/supabase-js` in package.json | Installed but unused. | Consider removing to reduce bundle size, or document intended future use. |

---

## 4. Import Convention Issues

### Backend — Fix Required

| File | Issue |
|------|-------|
| `app/middleware/audit.py` | `import uuid` and `from uuid import UUID` on same line — redundant |
| All model files (`models/*.py`) | `import uuid` + `from uuid import UUID` simultaneously in each file |

**Fix:** Add `ruff.toml` to enforce `from __future__ import annotations` and no-redundant-from-imports rule. Run `ruff check --fix` to auto-fix.

### Frontend — Fix Required

| File | Issue |
|------|-------|
| `package.json` | No `lint` or `lint:fix` scripts. ESLint not configured. |

**Fix:** Add ESLint + Prettier configuration. Add `lint` and `lint:fix` scripts.

---

## 5. Configuration Issues

### Backend: No Ruff / Import Sorting Config
- `pyproject.toml` only has pytest config — no ruff or isort rules.
- **Action:** Add `ruff.toml` with isort configuration.

### Frontend: No ESLint / Prettier
- `package.json` has no linting scripts.
- **Action:** Add ESLint and Prettier configs with `lint` and `lint:fix` scripts.

---

## 6. GitIgnore Issues

- `backend/venv/` — correctly excluded if `.gitignore` is set (verify)
- `backend/.pytest_cache/` — correctly excluded if `.gitignore` is set (verify)
- `backend/__pycache__/` — should be in `.gitignore`
- No `.gitignore` confirmed at backend root

---

## 7. Summary of Actions

| Priority | Action | Files Affected |
|----------|--------|----------------|
| P1 | Move root debug scripts to `tests/` | `test_api.py`, `test_login.py` |
| P1 | Add `ruff.toml` with isort config | `backend/ruff.toml` |
| P1 | Add ESLint + Prettier to frontend | `frontend/package.json`, `.eslintrc*`, `.prettierrc*` |
| P2 | Fix redundant `import uuid` in model files | `app/models/*.py`, `app/middleware/audit.py` |
| P2 | Add missing `.gitignore` entries | `backend/.gitignore` |
| P3 | Document Supabase client purpose in `supabase.ts` | `frontend/src/supabase.ts` |
| Low | Consider removing unused `@supabase/supabase-js` | `frontend/package.json` |