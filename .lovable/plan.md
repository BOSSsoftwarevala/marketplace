## End-to-End Button Debug — Whole App

Scope: 60+ routes registered in `src/App.tsx`. Goal: every visible button/link either navigates, triggers an action with feedback, or is explicitly disabled with reason. Zero dead clicks, zero unhandled console errors.

### Approach — batched, evidence-based

I'll run Playwright against `http://localhost:8080`, batch routes into groups, and for each route:

1. Load route → capture console + network errors
2. Enumerate every `<button>`, `<a>`, `[role="button"]`
3. Click each (in isolation, reset per click), record:
   - navigated? toast fired? modal opened? no-op?
   - console error? network 4xx/5xx?
4. Screenshot only failures
5. Produce a per-batch defect list, then fix in code, re-run that batch

### Route batches (7 batches, ~9 routes each)

```text
B1 Public       /  /auth  /marketplace  /sectors  /pricing  /about  /contact  /franchise  /reseller
B2 Boss/Admin   /boss  /boss/*  /admin  /super-admin  /master-control
B3 Managers1    /hr  /finance  /legal  /marketing  /sales-support  /lead-manager  /pro-manager
B4 Managers2    /seo-manager  /server-manager  /api-manager  /influencer-manager  /reseller-manager  /franchise-manager
B5 AI/Support   /vala-ai  /ai-ceo  /ai-console  /safe-assist  /assist-manager  /internal-chat  /personal-chat
B6 Modules      /ams  /whmcs  /billing  /promise-tracker  /security-command  /server-orchestration  /unified-control
B7 Demos        /demo/* variants + role demo dashboards
```

### Fix categories (applied as found)

- Dead nav → wire `useNavigate` or correct `to=`
- Missing onClick → attach handler via `useModuleAction` (existing hook)
- Silent failure → wrap in `useEnterpriseButton` with toast + audit
- Console error on click → patch component
- Broken route target → point to real existing page

### Constraints (locked)

- Zero UI redesign — only behavior/wiring fixes
- No new pages, no mock data
- Use existing hooks: `useModuleAction`, `useEnterpriseButton`, `useEnterpriseAudit`
- Soft-delete rule preserved

### Deliverable per batch

- Defect table (route → button → issue → fix)
- Patched files
- Green re-run screenshot proof

### Execution order

Start with B1 (public + auth — highest user impact), report findings + fixes, then proceed batch by batch. Each batch = one message with report + patches. Full pass estimated 7 messages.

### Out of scope

- Backend/RLS changes (only if a button is dead purely because of a missing hook wire)
- Visual/design tweaks
- New features
