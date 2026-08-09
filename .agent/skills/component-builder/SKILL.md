# SKILL: component-builder

> Teaches the agent how to create React UI components for the Chauffeur Admin Dashboard correctly — from primitives to full page-level modules. Read this skill in full before writing a single line of JSX.

---

## When This Skill Applies

Use this skill whenever the task involves creating or editing:
- A shared UI primitive (`Button`, `StatusBadge`, `DataTable`, `Modal`, `Input`, `EmptyState`)
- A layout component (`Sidebar`, `TopNav`, `PageWrapper`)
- A module-specific component (`DriverCard`, `ApplicationQueue`, `InspectionForm`, `ComplaintDetail`)
- A custom hook that a component depends on
- A CSS module file for any of the above

---

## Step 0 — Pre-Flight Checks

Before writing any code, answer all of the following:

1. **Does this component already exist?** Check `components/ui/`, `components/layout/`, and `components/modules/`. Do not duplicate.
2. **Server vs. Client Component?** Default to Server Components. Add `'use client'` ONLY if it uses browser APIs, React state, event listeners, or Supabase Realtime. Never make a full page a Client Component just to handle a button click.
3. **Does this component fetch data?** Fetch data in Server Components and pass it as props.
4. **Does this component mutate data?** Client components MUST NOT write directly to Supabase. All mutations must go through Next.js API Routes (`app/api/...`), which handle role checks, the DB mutation, and the audit log sequentially.

---

## Step 1 — Determine the File Location

| Component type | Destination |
|---|---|
| Primitive (Button, Badge, Modal, Table) | `components/ui/ComponentName.jsx` + `ComponentName.module.css` |
| Layout (Sidebar, TopNav) | `components/layout/ComponentName.jsx` + `ComponentName.module.css` |
| Module-specific | `components/modules/ComponentName.jsx` + `ComponentName.module.css` |
| Custom hook | `hooks/useHookName.js` |
| Page component (Server) | `app/(dashboard)/[module]/page.jsx` |

---

## Step 2 — Write the Component File

### Example 1: Server Component (Data Fetching)
By default, pages and data-heavy layouts are Server Components.

```jsx
// ─── 1. External imports ─────────────────────────────────────────────────────
// No 'use client' directive needed

// ─── 2. Internal imports — lib, utils ────────────────────────────────────────
import { createServerClient } from '@/lib/supabase/server';
import { canAccess } from '@/lib/rbac';

// ─── 3. Internal imports — components ────────────────────────────────────────
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import DriverActions from '@/components/modules/DriverActions';

// ─── 4. CSS module ────────────────────────────────────────────────────────────
import styles from './DriversPage.module.css';

/**
 * Server Component: Fetches drivers and passes them to client components.
 */
export default async function DriversPage() {
  const supabase = createServerClient();
  
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });

  if (!drivers?.length) {
    return <EmptyState icon="👤" message="No drivers found." />;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Drivers</h1>
      {/* Pass data to a pure UI component */}
      <DataTable data={drivers} />
      {/* Pass minimal data to an interactive Client Component */}
      <DriverActions driverId={drivers[0].id} />
    </div>
  );
}
```

### Example 2: Client Component (Interactivity & Mutations)
Use Client Components for interactivity. Mutations must call API Routes.

```jsx
'use client'; // Required for interactivity

// ─── 1. External imports ─────────────────────────────────────────────────────
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── 2. Internal imports — lib, hooks, utils ─────────────────────────────────
// NEVER import `createServerClient` or `writeAuditLog` here!

// ─── 3. Internal imports — components ────────────────────────────────────────
import ConfirmModal from '@/components/ui/ConfirmModal';

// ─── 4. CSS module ────────────────────────────────────────────────────────────
import styles from './DriverActions.module.css';

/**
 * Client Component: Handles interactive elements like modals and form submissions.
 */
export default function DriverActions({ driverId }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Mutation handlers — ALWAYS call an API route, never mutate directly
  async function handleSuspend() {
    if (!reason.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/drivers/${driverId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to suspend driver');
      }

      setModalOpen(false);
      router.refresh(); // Refresh server components to fetch updated data
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.actions}>
      <button 
        className={styles.buttonDestructive} 
        onClick={() => setModalOpen(true)}
      >
        Suspend Driver
      </button>

      {modalOpen && (
        <ConfirmModal
          title="Suspend Driver"
          message="You are about to suspend this driver. This will immediately restrict their access."
          reasonRequired
          reason={reason}
          onReasonChange={setReason}
          onConfirm={handleSuspend}
          onCancel={() => { setModalOpen(false); setReason(''); setError(null); }}
          confirmLabel="Confirm Suspension"
          destructive
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
}
```

### Hard rules for Components
- `export default function` for Page and Layout components. `export default function` or `export function` for generic UI components depending on existing project patterns.
- Hooks at the very top.
- No JSX logic inline — extract to variables or small functions.
- Every `async` fetch handler is wrapped in `try/catch`.
- Use absolute imports (`@/components/...`).

---

## Step 3 — Write the CSS Module

Create `ComponentName.module.css` in the same folder as the component.

### Rules
- All spacing uses `var(--spacing-N)` (e.g., `var(--spacing-6)`).
- All colours use `var(--color-*)` (e.g., `var(--color-layer-2)`, `var(--color-neutral-100)`).
- All borders and radii use `var(--stroke-N)` (e.g., `var(--stroke-2)`).
- Class names are camelCase: `.tableWrapper`, `.statusBadge`.
- No hardcoded hex values, no `px` for spacing/fonts, no `!important`.

### Starter template

```css
/* ComponentName.module.css */

.wrapper {
  background: var(--color-layer-2);
  border: var(--stroke-0) solid var(--color-neutral-alpha-10);
  border-radius: var(--stroke-2);
  padding: var(--spacing-6);
  box-shadow: var(--effect-e2);
}

.title {
  color: var(--color-neutral-100);
  font-size: var(--typography-headings-h-6-fontsize);
  font-weight: var(--typography-headings-h-6-fontweight);
  line-height: var(--typography-headings-h-6-lineheight);
  margin-bottom: var(--spacing-4);
}

.empty {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-neutral-600);
  font-size: var(--typography-body-b-2-fontsize);
}
```

---

## Step 4 — Role-Gating Pattern

Conditionally render components, routes, and nav items based on the admin's role.
**Remember:** Client-side role gating is for UX only. True security happens in the API Route.

```jsx
// Example in a Server Component
import { canAccess } from '@/lib/rbac';

export default function DashboardPage({ adminRole }) {
  return (
    <div>
      {canAccess(adminRole, 'accounting') && <FinancialSummary />}
      <DriverList />
    </div>
  );
}
```

---

## Step 5 — Destructive Action Pattern

Any action that suspends, rejects, removes, bans, or permanently modifies a record must:
1. Show a `ConfirmModal` with an explicit description of consequences.
2. Require a text reason before enabling the confirm button.
3. Use a `danger` variant button for the confirm action and a `secondary` button for cancel.
4. Be processed via an API route that follows the five-step pattern: auth → role → validate → mutate → audit.

> See the `DriverActions` Client Component in Step 2 (Example 2) for the full implementation of this pattern, including modal state management, API call, error handling, and `router.refresh()`.

---

## Step 6 — Checklist Before Submitting the Component

Run through every item before considering the component done:

### Structure
- [ ] File is in the correct folder (`app/`, `components/ui/`, `components/layout/`, `components/modules/`).
- [ ] Absolute imports are used (`@/lib/...`, `@/components/...`), grouped in order: React/Next → third-party → lib/utils → components → styles, separated by blank lines.
- [ ] `'use client'` directive is at the very top if using state, effects, or handlers.

### Security
- [ ] No client-side database mutations — all writes go to `/api/...` routes.
- [ ] No client-side audit logging — `writeAuditLog` is never imported in a `'use client'` file.
- [ ] `createServerClient` and `SUPABASE_SERVICE_ROLE_KEY` are never referenced in a `'use client'` file.
- [ ] Role-gating applied to sensitive data and destructive actions.
- [ ] All destructive actions go through `ConfirmModal` with a mandatory reason.

### Styling
- [ ] CSS module file exists alongside the component.
- [ ] All colours, spacing, borders, and typography use design system tokens (`var(--color-*)`, `var(--spacing-*)`, `var(--stroke-*)`, `var(--typography-*)`).
- [ ] No hardcoded hex values, no arbitrary `px` for spacing or font sizes.

### States & UX
- [ ] Loading state renders correctly (spinner or skeleton, not a blank screen).
- [ ] Error state renders correctly and is visible to the user.
- [ ] Empty state uses the shared `EmptyState` component with an icon and message.
- [ ] All form inputs are controlled components — no uncontrolled refs.

### Code Quality
- [ ] No `console.log` — use `console.error` only for genuine errors.
- [ ] No hardcoded status strings — use constants from `utils/constants.js`.
- [ ] Every `async` handler is wrapped in `try/catch` with user-visible error feedback.

---

*Skill version: 2.0 — Chauffeur Admin Dashboard · component-builder*
