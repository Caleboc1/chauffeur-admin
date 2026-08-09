---
trigger: always_on
---

# Code Style Rules — Chauffeur Admin Dashboard

> Agent instruction file. Apply these conventions to every file you create or modify. Consistency is non-negotiable on a shared codebase.

---

## Language & Syntax

- **JavaScript ES2020+** — no TypeScript unless explicitly instructed
- **No `var`** — use `const` by default, `let` only when reassignment is necessary
- **Arrow functions** for callbacks and anonymous functions; named function declarations for top-level and exported functions
- **Async/await** over `.then()/.catch()` chains
- **Optional chaining** (`?.`) and nullish coalescing (`??`) are preferred over verbose null guards
- **Destructuring** — destructure props, function parameters, and object returns where it aids clarity
- **Template literals** over string concatenation

```js
// ✅ Correct
const { driverId, status } = params;
const label = `Driver #${driverId} — ${status ?? 'unknown'}`;

// ❌ Avoid
const label = 'Driver #' + params.driverId + ' — ' + (params.status || 'unknown');
```

---

## React Conventions

### Component Structure
All components are **functional**. No class components.

File structure order (top to bottom):
1. Imports
2. Constants / config defined outside the component
3. Component function
4. Sub-components (only if tightly coupled and not reused elsewhere)
5. Default export

```jsx
import { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './DriverCard.module.css';

const STATUS_LABELS = { active: 'Active', suspended: 'Suspended' };

export default function DriverCard({ driver }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <StatusBadge status={driver.status} label={STATUS_LABELS[driver.status]} />
      {/* ... */}
    </div>
  );
}
```

### Props
- Destructure props in the function signature
- Always supply a `key` prop on list-rendered elements; use stable IDs (UUID), never array index
- Prop names are camelCase

### State
- `useState` for local UI state (open/closed, selected tab, form fields)
- Avoid deep state objects — split into granular `useState` calls
- Server state (data from Supabase) lives in Server Components and is passed as props — do not re-fetch in Client Components unless using Realtime

### Hooks
- Custom hooks live in `/hooks/`. File name: `use<HookName>.js`
- Hooks must not contain JSX
- Name hooks `use` + PascalCase noun: `useDriverStatus`, `useAuditLog`

---

## File & Folder Naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `DriverTable.jsx` |
| Pages (Next.js) | `page.jsx` | `app/(dashboard)/drivers/page.jsx` |
| Layouts | `layout.jsx` | `app/(dashboard)/layout.jsx` |
| API Routes | `route.js` | `app/api/drivers/[id]/route.js` |
| Hooks | `use` + camelCase | `useDriverStatus.js` |
| Utilities | camelCase | `formatCurrency.js` |
| CSS Modules | PascalCase matching component | `DriverTable.module.css` |
| Supabase migrations | timestamp prefix | `20260501000001_create_admins.sql` |

---

## Imports

- Absolute imports using the `@/` alias (configured in `jsconfig.json`)
- Group imports in this order, separated by a blank line:
  1. React and Next.js
  2. Third-party libraries
  3. Internal: lib/utils
  4. Internal: components
  5. Internal: styles

```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';

import { createServerClient } from '@/lib/supabase/server';
import { writeAuditLog } from '@/lib/audit';

import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';

import styles from './DriversPage.module.css';
```

- No barrel files (`index.js` re-exports) inside module-specific folders — they create implicit coupling
- Do not use default exports for utility functions; use named exports

---

## API Routes

Every API Route follows this pattern:

```js
// app/api/drivers/[id]/suspend/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { writeAuditLog } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';
import { canAccess } from '@/lib/rbac';

export async function POST(request, { params }) {
  // 1. Auth check
  const session = await getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  // 2. Role check
  if (!canAccess(session.role, 'drivers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Input validation
  const { reason } = await request.json();
  if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 });

  // 4. Mutation
  const supabase = createServerClient();
  const { error } = await supabase
    .from('drivers')
    .update({ status: 'suspended' })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 5. Audit log — always after a successful mutation
  await writeAuditLog({
    actorId: session.id,
    actorRole: session.role,
    action: 'driver.suspended',
    entityType: 'driver',
    entityId: params.id,
    description: `Driver suspended. Reason: ${reason}`,
    ipAddress: request.headers.get('x-forwarded-for'),
  });

  return NextResponse.json({ success: true });
}
```

The five-step pattern (auth → role → validate → mutate → audit) is mandatory for every mutation route.

---

## Error Handling

- All async operations are wrapped in `try/catch`
- API Routes return consistent JSON error shapes: `{ error: string }`
- Client-side fetch errors surface in UI — never swallow silently with empty `catch` blocks
- Do not use `console.log` in production code paths; use `console.error` only for genuine errors, and remove debug logs before committing

```js
// ✅ Correct
try {
  const res = await fetch('/api/drivers/123/suspend', { method: 'POST', body: JSON.stringify({ reason }) });
  if (!res.ok) throw new Error((await res.json()).error);
} catch (err) {
  setError(err.message);
}

// ❌ Avoid
fetch('/api/...').then(r => r.json()).then(setData).catch(() => {});
```

---

## CSS & Styling

- **CSS Modules** for all component styles. File collocated with the component.
- **Global styles** (resets, CSS custom properties, typography) in `styles/globals.css` only
- **No inline styles** except for truly dynamic values (e.g. calculated widths)
- **No Tailwind** unless explicitly instructed
- Class names in CSS Modules are camelCase: `.statusBadge`, `.tableRow`
- CSS custom properties (design tokens) are defined in `styles/globals.css` and referenced via `var(--token-name)` — see `design-system.md`

---

## Comments & Documentation

- Write comments to explain **why**, not **what**. The code explains what.
- JSDoc on all exported utility functions and hooks:

```js
/**
 * Checks whether an admin role has access to a given dashboard module.
 * @param {string} role - The admin's role key (e.g. 'finance_admin')
 * @param {string} module - The module identifier (e.g. 'earnings')
 * @returns {boolean}
 */
export function canAccess(role, module) { ... }
```

- Avoid commented-out code in committed files. Delete it — git history preserves it.

---

## Constants & Magic Values

- No magic strings or numbers inline — extract to named constants
- Module-scoped constants go at the top of the file, above the component
- Shared constants go in `utils/constants.js`

```js
// ✅ Correct
const REJECTION_REASONS = ['incomplete_documents', 'failed_inspection', 'criminal_record', 'other'];

// ❌ Avoid
<select options={['incomplete_documents', 'failed_inspection', ...]} />
```

---

## Commits (guidance for agents generating code)

When producing code that will be committed:
- One logical change per file set — do not bundle unrelated changes
- Do not modify migration files after they have been applied
- Do not alter `.env` files — only `.env.example` with placeholder values

