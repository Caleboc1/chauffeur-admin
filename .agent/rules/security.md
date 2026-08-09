---
trigger: always_on
---

# Security Rules — Chauffeur Admin Dashboard

> Agent instruction file. These are non-negotiable constraints. No feature, shortcut, or deadline justifies bypassing them. Read in full before implementing any auth, data access, or mutation logic.

---

## Threat Model Summary

This dashboard has elevated risk because it:
- Controls the suspension, approval, and banning of real people (drivers and riders)
- Contains sensitive personal and financial data
- Has privileged access to wallet balances and commission records
- Maintains an immutable audit trail that, if corrupted, destroys accountability

Attackers of interest: disgruntled staff, compromised admin accounts, external attackers targeting admin credentials, and insider privilege escalation.

---

## Authentication

### Supabase Auth
- All admin sessions are managed by Supabase Auth. Do not build a custom auth system.
- Session tokens (JWTs) are stored in HTTP-only cookies via the `@supabase/ssr` package — not `localStorage`. This prevents XSS from stealing tokens.
- Session refresh is handled server-side on every request via middleware.

### Middleware (Next.js)
A `middleware.js` at the project root must:
1. Run on every request to `/(dashboard)` routes
2. Verify the Supabase session cookie
3. Redirect unauthenticated requests to `/login`
4. Never cache auth checks — always verify fresh on each request

```js
// middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { /* request/response cookie adapter */ } }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/(dashboard)')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = { matcher: ['/((?!_next|api/public|login).*)'] };
```

### Login Security
- Enforce rate limiting on the login endpoint — maximum 5 failed attempts before a temporary lockout
- Do not reveal whether an email exists in the system on login failure ("Invalid credentials" — not "Email not found")
- Passwords must meet Supabase Auth's minimum policy. Do not weaken this.

---

## Authorisation — Defence in Depth

Authorisation is enforced at three independent layers. All three must be active. A breach of one must not expose data.

### Layer 1 — React UI
- Conditionally render components, routes, nav items, and action buttons based on the admin's role
- This is UX protection only — it is not a security boundary

### Layer 2 — Next.js API Routes / Server Actions
Every mutation endpoint must:
1. Verify a valid session exists
2. Load the admin's role from the `admins` table (do not trust the JWT claim alone — JWTs can be stale)
3. Check the role against the required permission using `lib/rbac.js`
4. Return `401` for unauthenticated requests, `403` for authenticated but unauthorised ones
5. Never return `200` with an empty body to hide a permissions error

```js
// Required pattern for every mutation route
const session = await getAdminSession(request);
if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

const { data: admin } = await supabase.from('admins').select('role').eq('id', session.user.id).single();
if (!canAccess(admin.role, 'drivers')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

### Layer 3 — Supabase Row Level Security (RLS)
- RLS is **enabled on every table** without exception
- The service-role key bypasses RLS — it is used only server-side and never in the browser
- The anon/authenticated key (used client-side) is gated by RLS policies that reflect the RBAC matrix
- Do not disable RLS on any table for convenience. If a query fails due to RLS, fix the policy — do not drop it.

```sql
-- Example: Only super_admin and finance_admin can read earnings_ledger
CREATE POLICY "earnings_read"
  ON earnings_ledger FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('super_admin', 'finance_admin')
  );
```

---

## Secret Management

### Rules
- `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in:
  - Any file with `'use client'`
  - Any component file
  - The browser bundle (check with `next build` output)
  - Any committed file (`.env`, `.env.local`, etc.)
- All secrets go in `.env.local` (gitignored) locally and in the hosting provider's secret store in production
- `.env.example` exists in the repo with placeholder values only — no real keys

### Variable Exposure Rules

| Variable | `NEXT_PUBLIC_` prefix | Safe in browser |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | ✅ Intentional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | ✅ Intentional — limited by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | No | ❌ Server-only, full DB access |

If in doubt, prefix-check: any variable without `NEXT_PUBLIC_` is never exposed to the browser by Next.js.

---

## Input Validation & Sanitisation

- Validate all inputs **server-side** in API Routes before they touch the database. Client-side validation is UX only.
- Use parameterised queries via the Supabase SDK — never string-concatenate SQL
- Reject unexpected fields — only accept explicitly listed properties from request bodies
- Validate enums against the allowed list before writing to the database (e.g. status values, role values)
- File uploads (driver documents): validate MIME type server-side, not just file extension. Accept only: `image/jpeg`, `image/png`, `application/pdf`. Set max file size: 10MB.

```js
// Input validation pattern
const ALLOWED_STATUSES = ['active', 'suspended', 'banned'];
const { status, reason } = await request.json();

if (!ALLOWED_STATUSES.includes(status)) {
  return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
}
if (!reason || reason.trim().length < 5) {
  return NextResponse.json({ error: 'Reason is required (min 5 characters)' }, { status: 400 });
}
```

---

## Audit Log Integrity

The audit log is a security control, not just a feature.

- Audit log writes always use the **service-role Supabase client** (server-side)
- The `audit_logs` table has no `UPDATE` or `DELETE` RLS policy — not even for `super_admin`
- Audit writes happen in the same server-side operation as the mutation — if the mutation succeeds but the audit write fails, surface an error. Do not silently proceed.
- Audit entries must include the admin's IP address — read from `x-forwarded-for` header server-side
- Never allow client-provided data to populate `actor_id` or `actor_role` fields — always derive them from the verified server session

---

## Destructive Actions

Any action that suspends, bans, rejects, deletes, or permanently modifies a record must:

1. Require a reason — validated server-side (not just client-side)
2. Show a confirmation dialog with an explicit description of consequences
3. Be logged in the audit trail with the reason included
4. Be irreversible from the UI unless an explicit "undo" workflow is designed (none currently)

Destructive actions that are **never permitted via the UI** regardless of role:
- Deleting audit log entries
- Deleting wallet transaction records
- Deleting completed ride records

---

## Cross-Site Request Forgery (CSRF)

- Next.js Server Actions include built-in CSRF protection via the `Origin` header check — use Server Actions or API Routes, not raw form POSTs
- All state-mutating requests use `POST`, `PATCH`, or `DELETE` — never `GET`
- The Supabase JWT in the session cookie provides per-request verification

---

## Cross-Site Scripting (XSS)

- React's JSX escapes content by default — never use `dangerouslySetInnerHTML` with user-provided content
- If rich text (e.g. complaint descriptions) must be rendered as HTML, sanitise with a library like `DOMPurify` on the server before storing, and escape on render
- Content Security Policy headers must be configured in `next.config.js` to restrict script sources

```js
// next.config.js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      "img-src 'self' data: blob:",
      "frame-ancestors 'none'",
    ].join('; ')
  }
];
```

---

## Supabase Storage Security

- Driver documents and vehicle photos are stored in **private Supabase Storage buckets** — not public
- Download URLs are signed, short-lived (15 minutes), and generated server-side on demand
- Never store a permanent public URL to a private document in the database
- Bucket policies must restrict upload to authenticated service-role calls only — not direct client uploads

```js
// Generate a signed URL server-side
const { data } = await supabase.storage
  .from('driver-documents')
  .createSignedUrl(`${driverId}/${documentId}.pdf`, 900); // 15 minutes
```

---

## Rate Limiting

- Apply rate limiting to all public-facing API routes (login, password reset)
- Admin API routes should be rate-limited per admin ID to prevent bulk data scraping
- Use a server-side counter (Redis, Supabase, or Upstash) — do not rely on client IP alone (easily spoofed via `x-forwarded-for`)

---

## Logging & Monitoring

- Server errors must be logged to an observability platform (Sentry, Datadog, or similar) — do not rely solely on Vercel/hosting logs
- Never log: passwords, full JWT tokens, service-role keys, or complete PII fields
- Log: request method, route, admin ID, response status code, duration, and error messages

---

## Dependency Security

- Run `npm audit` before every release
- Pin dependency versions in `package.json` — no `^` or `~` floating ranges in production dependencies
- Review the Supabase client library changelog on every upgrade — auth behaviour can change

