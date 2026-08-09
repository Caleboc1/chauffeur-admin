---
trigger: always_on
---

# Architecture Rules — Chauffeur Admin Dashboard

> Agent instruction file. Read before planning or implementing any structural, routing, or data-fetching work.

---

## Stack Overview

| Layer | Technology |
|---|---|
| UI Framework | React (functional components + hooks) |
| App Framework | Next.js (App Router) |
| Language | JavaScript (ES2020+) |
| Database | Supabase — PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Routing | Next.js file-based routing (App Router) |

---

## Project Structure

```
/
├── app/                        # Next.js App Router root
│   ├── (auth)/                 # Auth group — login, forgot password
│   │   └── login/
│   ├── (dashboard)/            # Protected group — all admin modules
│   │   ├── layout.jsx          # Sidebar + top nav shell
│   │   ├── page.jsx            # Dashboard (KPI + activity feed)
│   │   ├── drivers/
│   │   ├── applications/
│   │   ├── inspections/
│   │   ├── rides/
│   │   ├── complaints/
│   │   ├── earnings/
│   │   ├── accounting/
│   │   ├── vehicles/
│   │   ├── riders/
│   │   ├── notifications/
│   │   ├── web-settings/
│   │   ├── settings/
│   │   └── audit-logs/
│   └── api/                    # Next.js API Routes (server-side only)
│       └── [...module]/
├── components/
│   ├── ui/                     # Primitive, reusable UI components
│   ├── modules/                # Module-specific composite components
│   └── layout/                 # Sidebar, TopNav, PageWrapper, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.js           # Browser Supabase client (anon key)
│   │   └── server.js           # Server Supabase client (service role)
│   ├── rbac.js                 # Role permission helpers
│   └── audit.js                # Audit log writer (server-side only)
├── hooks/                      # Custom React hooks
├── utils/                      # Pure utility functions
├── styles/                     # Global CSS and CSS Modules
├── supabase/
│   └── migrations/             # Versioned SQL migration files
└── AGENTS.md
```

---

## Rendering Strategy

### Server Components (default)
Use Server Components for all pages and layouts that fetch data. They do not ship JS to the client and have direct access to the service-role Supabase client.

```jsx
// app/(dashboard)/drivers/page.jsx
import { createServerClient } from '@/lib/supabase/server';

export default async function DriversPage() {
  const supabase = createServerClient();
  const { data: drivers } = await supabase.from('drivers').select('*');
  return <DriverTable drivers={drivers} />;
}
```

### Client Components
Add `'use client'` only when the component requires:
- Browser APIs (`window`, `navigator`, `localStorage`)
- React state (`useState`, `useReducer`)
- Event listeners or interactive behaviour
- Supabase Realtime subscriptions

Mark the smallest possible subtree as a Client Component. Never make a full page Client Component just to handle a single button click — extract the interactive element.

---

## Data Fetching Rules

1. **Pages fetch their own data** as Server Components. Do not prop-drill data through multiple layout layers.
2. **API Routes** (`/app/api/`) are used for mutations (POST, PATCH) and any operation requiring the service-role key. Never expose the service-role key to the browser.
3. **Never fetch from the client directly** for any write operation. All mutations go through a Next.js API Route or Server Action.
4. **Supabase Realtime** (for live ride map and activity feed) is client-side only. Wrap in a dedicated Client Component.

---

## Supabase Client Usage

Two separate clients — never mix them:

| Client | File | Key Used | Use For |
|---|---|---|---|
| Browser client | `lib/supabase/client.js` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth session, Realtime subscriptions |
| Server client | `lib/supabase/server.js` | `SUPABASE_SERVICE_ROLE_KEY` | All data reads/writes in Server Components and API Routes |

```js
// lib/supabase/server.js
import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
```

```js
// lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

---

## Routing & Access Control

- The `(dashboard)` route group layout must verify the session on every render. Unauthenticated requests redirect to `/login`.
- Role must be read from the `admins` table (not just the JWT) on every protected page load. JWTs can be stale.
- Module-level access gates live in `lib/rbac.js`. Every page checks the role before rendering. Return a 403 component, not a redirect, for authenticated users with insufficient role.

```js
// lib/rbac.js
export const ROLE_PERMISSIONS = {
  super_admin:        ['*'],
  operations_admin:   ['drivers', 'applications', 'inspections', 'rides', 'vehicles'],
  finance_admin:      ['earnings', 'accounting'],
  support_agent:      ['complaints', 'riders:read'],
  inspection_officer: ['inspections'],
};

export function canAccess(role, module) {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(module);
}
```

---

## Audit Log Architecture

Audit entries must always be written **server-side**, never from the browser. Use a shared helper:

```js
// lib/audit.js
import { createServerClient } from './supabase/server';

export async function writeAuditLog({ actorId, actorRole, action, entityType, entityId, description, metadata, ipAddress }) {
  const supabase = createServerClient();
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    actor_role: actorRole,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
    metadata,
    ip_address: ipAddress,
  });
}
```

Call `writeAuditLog` inside every API Route or Server Action that mutates data, in the same async operation as the mutation. If the audit write fails, surface the error — do not silently swallow it.

---

## Schema & Migration Rules

- All schema changes live in `/supabase/migrations/` as numbered SQL files: `20260501000001_create_admins.sql`
- Never alter tables directly in the Supabase dashboard in a shared or production environment
- Migrations are forward-only — no rollback files. If a migration needs reverting, write a new migration
- Run `supabase db push` (local) or apply via CI before deploying code that depends on the schema change

---

## Environment Variables

| Variable | Exposed to Browser | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key for auth/realtime |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | Full DB access — server only |

Never reference `SUPABASE_SERVICE_ROLE_KEY` in any file inside the `app/(dashboard)` client subtree or any component with `'use client'`.

---

## Module Boundaries

- Each of the 17 modules maps to one route segment under `app/(dashboard)/`
- Modules do not import from each other's component folders. Shared UI lives in `components/ui/`
- Cross-module data needs (e.g. a complaint page showing ride details) are resolved via API calls, not direct imports

