# Plan — Role/Permission Wiring + i18n Coverage Gating

UI stays 100% locked. Backend + hooks + DB only. Reference zip is read for logic, nothing copied wholesale.

## Phase 1 — Role Permission & Route Protection (backend-first)

Existing infra: `user_roles`, `role_permissions`, `permissions`, `is_super_admin()`, `has_role()`, `RequireRole`, `PermissionGuard`, `useRolePermission`, `useDataScope`, `securityUtils.hasPermission`.

Work:
1. **DB**: add `module_routes(role_name, module_key, route_path, can_view, can_edit, can_delete)` + seed Super Admin's 40+ module routes from `RoleSwitchDashboard`. Add SQL function `can_access_route(_user_id uuid, _route text)` (security definer) returning bool. RLS: read = authenticated, write = super_admin.
2. **DB**: backfill `role_permissions` for every role × module the app already references (scan `roleConfig.ts`, `types/roles.ts`, `rbac.ts`, `RoleSwitchDashboard` map).
3. **Hook**: extend `useRolePermission` with `canAccessRoute(path)` backed by `can_access_route` RPC + 60s cache (no UI change).
4. **`RequireRole`**: add optional `route` prop that calls `canAccessRoute` server-side before render; on deny → existing `/access-denied` page. No layout change.
5. **`PermissionGuard`**: switch its in-memory `hasPermission` to consult `role_permissions` via cached query; keep render contract identical.
6. **Audit**: every denial already logs via `RequireRole` — extend to log allowed `module_open` once per session per route.
7. **Smoke**: verify Super Admin can open every route in `RoleSwitchDashboard.NAV` (DB query, not UI).

## Phase 2 — i18n Translation Tables + Coverage Gating

8. **DB tables**:
   - `languages(code pk, name, native_name, rtl bool, enabled bool default false, coverage_pct numeric default 0)`
   - `translation_keys(id, namespace, key, description, unique(namespace,key))`
   - `translation_values(id, key_id fk, language_code fk, value, status text check approved/pending, updated_by, updated_at)`
   - `translation_audit_logs(id, key_id, language_code, old_value, new_value, actor, action, created_at)`
   - View `translation_coverage` computing pct per language.
   - Trigger to refresh `languages.coverage_pct` on value insert/update.
4. **Seed**: 125 language rows (codes + native names + RTL flag for ar/he/ur/fa/ps). `enabled=false` initially. Seed translation_keys from current `src/lib/i18n.ts` / `i18n.tsx` English bundle.
5. **RLS**: read-all for authenticated on languages/keys/values; write only for roles with `permission_name='i18n.manage'`.
6. **Hook**: `useAvailableLanguages()` returns only `enabled=true AND coverage_pct=100`. Existing language picker (UI unchanged) consumes this hook — empty means English-only.
7. **Edge function** `translation-coverage-recompute` — admin-trigger to recalc all languages.
8. **No UI redesign**: picker, dashboards, sidebars untouched. Translation strings continue resolving through existing `i18n` runtime; missing keys fall back to English.

## Out of scope (deferred, explicit)

- Gamification / animations / sound system — not built this round.
- Actually translating 102 missing languages (only infrastructure + gating).
- Replacing existing UI components with zip's versions.
- 100k-user load infra (CDN/Redis/microservices) — separate effort.

## Validation

- `psql` checks: every NAV entry has a `module_routes` row for `super_admin`.
- Run `can_access_route` for boss_owner / super_admin / a non-privileged role — expect true/true/false respectively.
- `SELECT code FROM languages WHERE enabled AND coverage_pct=100` returns at most `en` until translations are filled.
- App still renders identically (no component edits).

## Files (expected)

- 2 migrations (Phase 1 + Phase 2)
- `src/hooks/useRolePermission.ts` (extend)
- `src/components/auth/RequireRole.tsx` (extend signature, no JSX change)
- `src/components/common/PermissionGuard.tsx` (swap data source)
- `src/hooks/useAvailableLanguages.ts` (new, hook only)
- `supabase/functions/translation-coverage-recompute/index.ts` (new)

Approve to proceed, or tell me to trim further (e.g. Phase 1 only first).
