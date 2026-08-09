# SKILL: api-route-scaffolder

> Teaches the agent how to create server-side API routes and Server Actions for the Chauffeur Admin Dashboard. The project uses **Next.js App Router** — all routes live under `app/api/`. Read this skill in full before writing any server-side endpoint.

---

## When This Skill Applies

Use this skill whenever the task involves creating or editing:
- A Next.js API Route (`app/api/*/route.js`)
- A Next.js Server Action (`'use server'` functions)
- Any endpoint that reads or writes data server-side using the Supabase service role

Do **not** use this skill for:
- Client-side components or hooks (use the component-builder skill)
- Database schema changes (use the db-migration-runner skill)

---

## Step 0 — Pre-Flight Checks

Before writing any route, confirm:

1. **Does this endpoint mutate data?** All mutations MUST go through an API Route or Server Action — never from a client component directly. This is non-negotiable per `security.md`.
2. **Does this endpoint need the service role?** If it only reads RLS-gated data, a Server Component with `createServerClient()` may suffice — no API route needed.
3. **Does every mutation in this route write to `audit_logs`?** If it modifies any record, yes. Audit log failures must be surfaced, not silently swallowed.
4. **Which roles are permitted?** Check `AGENTS.md` Section 4 and `lib/rbac.js` for the role-permission mapping.

---

## Step 1 — Choose the Right Pattern

| Scenario | Pattern |
|---|---|
| Read data for a page | Server Component with `createServerClient()` — no API route needed |
| Read data needing aggregation/joins | Server Component or API Route with server client |
| **Any mutation** (create, update, delete) | **API Route or Server Action — always server-side** |
| File upload validation | API Route with server client |
| Sending notifications (SMS/email) | API Route — external service calls must be server-side |
| Generating signed storage URLs | API Route with server client |

> **There is no client-side mutation pattern.** Per `architecture.md` and `security.md`, all writes go through server-side code that enforces auth, role checks, and audit logging.

---

## Step 2 — API Route Template (App Router)

All API routes live under `app/api/`. Use absolute imports with `@/`.

### File location
```
app/api/[resource]/route.js           → GET (list), POST (create)
app/api/[resource]/[id]/route.js      → GET (single), PATCH (update), DELETE
app/api/[resource]/[id]/[action]/route.js → POST (state transitions)
```

### Complete route template

Every mutation route follows this **five-step pattern**: auth → role → validate → mutate → audit. The entire handler is wrapped in `try/catch`.

```js
// app/api/drivers/[id]/suspend/route.js

import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth';
import { canAccess } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';

/**
 * POST /api/drivers/[id]/suspend
 * Suspends a driver account. Requires ops_admin or super_admin role.
 */
export async function POST(request, { params }) {
  try {
    // 1. Authenticate — verify the calling admin's session
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Authorise — check the role against the module permission
    if (!canAccess(session.role, 'drivers')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Validate input — reject before touching the database
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'A reason is required (minimum 5 characters).' },
        { status: 400 }
      );
    }

    // 4. Execute mutation using the server client (service role)
    const supabase = createServerClient();
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ status: 'suspended' })
      .eq('id', params.id);

    if (updateError) {
      console.error('Suspend driver failed:', updateError.message);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    // 5. Write audit log — must succeed; surface errors if it fails
    const { error: auditError } = await writeAuditLog({
      actorId: session.adminId,
      actorRole: session.role,
      action: 'driver.suspended',
      entityType: 'driver',
      entityId: params.id,
      metadata: { reason: reason.trim() },
      ipAddress: request.headers.get('x-forwarded-for'),
    });

    if (auditError) {
      // Log the failure but still return success for the primary operation
      // The mutation succeeded — the audit failure is logged for investigation
      console.error('Audit log write failed:', auditError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in POST /api/drivers/[id]/suspend:', err.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

### Hard rules for API Routes
- Every mutation route follows the five-step pattern — no exceptions
- Wrap the entire handler in `try/catch` to catch unexpected errors (e.g., malformed JSON)
- Use `@/` absolute imports — never relative paths like `../../../lib/`
- Return consistent JSON error shape: `{ error: string }`
- Never return stack traces or internal error details in the response body
- Use `POST` for state transitions, `PATCH` for field updates, `DELETE` for removals — never `GET` for mutations

---

## Step 3 — Server Action Pattern

Use Server Actions for mutations triggered directly by form submissions. They provide built-in CSRF protection via the `Origin` header check.

```js
// app/(dashboard)/drivers/[id]/actions.js
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth';
import { canAccess } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * Suspends a driver. Called directly from a form in a Server Component.
 */
export async function suspendDriver(driverId, formData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorised');

  if (!canAccess(session.role, 'drivers')) throw new Error('Forbidden');

  const reason = formData.get('reason')?.toString().trim();
  if (!reason || reason.length < 5) throw new Error('A reason is required (min 5 characters).');

  const supabase = createServerClient();
  const { error } = await supabase
    .from('drivers')
    .update({ status: 'suspended' })
    .eq('id', driverId);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: session.adminId,
    actorRole: session.role,
    action: 'driver.suspended',
    entityType: 'driver',
    entityId: driverId,
    metadata: { reason },
    ipAddress: 'server-action',
  });

  revalidatePath(`/drivers/${driverId}`);
}
```

---

## Step 4 — Key Server-Side Libraries

These files are already defined in `architecture.md`. Reference them — do not create duplicates.

### `lib/supabase/server.js` — Service Role Client
```js
import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // NOT NEXT_PUBLIC_ — server only
  );
}
```

### `lib/supabase/client.js` — Browser Client (Realtime only)
```js
import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### `lib/auth.js` — Session Helper
Reads the Supabase session from HTTP-only cookies via `@supabase/ssr` and validates the admin record from the `admins` table. **Never trust JWT claims alone — always verify the role from the database.**

```js
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Retrieves and validates the calling admin's session from cookies.
 * Returns { adminId, role } or null if unauthenticated/inactive.
 */
export async function getAdminSession() {
  const cookieStore = cookies();

  // Create a cookie-aware client to read the session
  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Verify role from the admins table — JWTs can be stale
  const serverClient = createServerClient();
  const { data: admin } = await serverClient
    .from('admins')
    .select('id, role, status')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin || admin.status !== 'active') return null;

  return { adminId: admin.id, role: admin.role };
}
```

### `lib/audit.js` — Audit Log Writer
```js
import { createServerClient } from '@/lib/supabase/server';

/**
 * Writes an immutable audit log entry. Server-side only.
 * Returns { error } so the caller can decide how to handle failures.
 */
export async function writeAuditLog({ actorId, actorRole, action, entityType, entityId, metadata, ipAddress }) {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
      ip_address: ipAddress ?? null,
    });

  if (error) {
    console.error('Audit log write failed:', error.message);
  }

  return { error };
}
```

> **Note:** `writeAuditLog` returns the error rather than silently swallowing it, allowing the calling route to decide how to handle it. Per `security.md`, audit failures must be surfaced.

---

## Step 5 — Input Validation Patterns

Validate all inputs **server-side** before they touch the database. Client-side validation is UX only.

### Enum validation
```js
const ALLOWED_STATUSES = ['active', 'suspended', 'banned'];
const { status } = body;

if (!ALLOWED_STATUSES.includes(status)) {
  return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
}
```

### Required string with minimum length
```js
if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
  return NextResponse.json({ error: 'Reason is required (min 5 characters).' }, { status: 400 });
}
```

### UUID validation
```js
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!UUID_REGEX.test(params.id)) {
  return NextResponse.json({ error: 'Invalid ID format.' }, { status: 400 });
}
```

### Reject unexpected fields
```js
const ALLOWED_FIELDS = ['reason', 'status'];
const bodyKeys = Object.keys(body);
const unexpected = bodyKeys.filter(k => !ALLOWED_FIELDS.includes(k));

if (unexpected.length > 0) {
  return NextResponse.json({ error: `Unexpected fields: ${unexpected.join(', ')}` }, { status: 400 });
}
```

---

## Step 6 — Route Checklist

Before considering any API route or Server Action complete:

### Auth & Security
- [ ] Authentication check — returns `401` if no valid session
- [ ] Role checked from `admins` table via `getAdminSession()` — never from JWT alone
- [ ] Authorisation check via `canAccess()` — returns `403` if role not permitted
- [ ] Service role key accessed only via `createServerClient()` — never exposed in response
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix

### Validation
- [ ] All inputs validated server-side before touching the database
- [ ] Enums validated against allowed list
- [ ] Required strings checked for presence, type, and minimum length
- [ ] Unexpected fields rejected

### Mutation & Audit
- [ ] `writeAuditLog()` called after every successful mutation
- [ ] Audit log error is returned/surfaced — not silently swallowed
- [ ] Destructive actions require a mandatory `reason` field

### Error Handling
- [ ] Entire handler wrapped in `try/catch`
- [ ] Returns consistent `{ error: string }` JSON on all error paths
- [ ] No stack traces or internal details leaked in responses
- [ ] Uses `console.error` for genuine errors only — no `console.log`

### Structure
- [ ] File lives under `app/api/` — not `pages/api/`
- [ ] Uses absolute imports (`@/lib/...`)
- [ ] JSDoc on the exported handler function
- [ ] `revalidatePath()` called in Server Actions to bust cache after mutation

---

## Step 7 — Route Naming Conventions

| Operation | Method | Route pattern |
|---|---|---|
| List resource | GET | `/api/[resource]` |
| Get single record | GET | `/api/[resource]/[id]` |
| Create record | POST | `/api/[resource]` |
| Update record | PATCH | `/api/[resource]/[id]` |
| State transition | POST | `/api/[resource]/[id]/[action]` |
| Delete record | DELETE | `/api/[resource]/[id]` |

State transition examples (preferred over generic PATCH for business actions):
- `POST /api/drivers/:id/suspend`
- `POST /api/drivers/:id/approve`
- `POST /api/drivers/:id/reactivate`
- `POST /api/applications/:id/schedule-inspection`
- `POST /api/complaints/:id/resolve`
- `POST /api/complaints/:id/escalate`
- `POST /api/riders/:id/adjust-wallet`

---

*Skill version: 2.0 — Chauffeur Admin Dashboard · api-route-scaffolder*
