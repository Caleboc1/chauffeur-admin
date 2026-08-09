---
trigger: always_on
---

# Design System Rules — Chauffeur Admin Dashboard

> Agent instruction file. Use these tokens for every UI element. Do not introduce new colour, spacing, or type values — extend the system only.

---

## Design Philosophy

Operational dashboard — not a marketing site. Always prioritise:
- Information density over whitespace
- Status visibility at a glance
- Consistency over creativity

---

## Token Source

Copy the full `:root {}` block below verbatim into `styles/globals.css`. Always reference values via `var(--token)` — never hardcode hex, px, or font names in component CSS.

```css
:root {
  --color-primary: #005629;
  --color-primary-100: #e5f2eb;
  --color-primary-200: #b3d7c2;
  --color-primary-300: #80bc98;
  --color-primary-400: #005629;
  --color-primary-500: #003d1d;
  --color-primary-alpha-10: rgba(0, 86, 41, 0.1);
  --color-primary-alpha-20: rgba(0, 86, 41, 0.2);
  --color-secondary-100: rgb(196, 170, 255);
  --color-secondary-200: rgb(136, 85, 255);
  --color-secondary-300: rgb(77, 0, 255);
  --color-secondary-400: rgb(244, 197, 72);
  --color-secondary-500: rgb(42, 0, 140);
  --color-secondary-alpha-10: rgba(77, 0, 255, 0.1);
  --color-neutral-100: rgb(255, 255, 255);
  --color-neutral-200: rgb(243, 243, 243);
  --color-neutral-300: rgb(210, 210, 210);
  --color-neutral-400: rgb(187, 187, 187);
  --color-neutral-500: rgb(164, 164, 164);
  --color-neutral-600: rgb(142, 142, 142);
  --color-neutral-700: rgb(119, 119, 119);
  --color-neutral-800: rgb(96, 96, 96);
  --color-neutral-900: rgb(74, 74, 74);
  --color-neutral-1000: rgb(51, 51, 51);
  --color-neutral-alpha-10: rgba(51, 51, 51, 0.1);
  --color-red-100: rgb(251, 55, 72);
  --color-red-200: rgb(208, 4, 22);
  --color-red-alpha-10: rgba(251, 55, 72, 0.1);
  --color-yellow-100: rgb(255, 219, 67);
  --color-yellow-200: rgb(223, 180, 0);
  --color-yellow-alpha-10: rgba(255, 219, 67, 0.1);
  --color-green-100: rgb(132, 235, 180);
  --color-green-200: rgb(31, 193, 107);
  --color-green-alpha-10: rgba(31, 193, 107, 0.1);
  --color-layer-1: rgb(13, 13, 13);
  --color-layer-2: rgb(25, 25, 25);
  --color-layer-3: rgb(48, 48, 48);
  --spacing-0: 2px;   --spacing-1: 4px;   --spacing-2: 8px;
  --spacing-3: 12px;  --spacing-4: 16px;  --spacing-5: 20px;
  --spacing-6: 24px;  --spacing-7: 32px;  --spacing-8: 40px;
  --spacing-9: 48px;  --spacing-10: 56px;
  --stroke-0: 1px;  --stroke-1: 2px;  --stroke-2: 4px;  --stroke-3: 6px;
  --effect-e0: 0px 0px 0px 0px #1b1c1d00;
  --effect-e1: 0px 2px 4px 0px #1b1c1d0a;
  --effect-e2: 0px 16px 32px -12px #585c5f1a;
  --effect-e3: 0px 16px 40px -8px #585c5f29;
  --typography-button-texts-fontsize: 14px;
  --typography-button-texts-fontfamily: Inter;
  --typography-button-texts-fontweight: 700;
  --typography-button-texts-lineheight: 21px;
  --typography-headings-h-5-fontsize: 28px;
  --typography-headings-h-5-fontweight: 700;
  --typography-headings-h-5-lineheight: 36px;
  --typography-headings-h-6-fontsize: 24px;
  --typography-headings-h-6-fontweight: 700;
  --typography-headings-h-6-lineheight: 36px;
  --typography-headings-h-7-fontsize: 20px;
  --typography-headings-h-7-fontweight: 600;
  --typography-headings-h-7-lineheight: 24px;
  --typography-body-b-1-fontsize: 16px;
  --typography-body-b-1-fontweight: 500;
  --typography-body-b-1-lineheight: 24px;
  --typography-body-b-2-fontsize: 14px;
  --typography-body-b-2-fontweight: 500;
  --typography-body-b-2-lineheight: 21px;
  --typography-body-b-3-fontsize: 12px;
  --typography-body-b-3-fontweight: 400;
  --typography-body-b-3-lineheight: 18px;
  --typography-body-b-4-fontsize: 10px;
  --typography-body-b-4-fontweight: 500;
  --typography-body-b-4-lineheight: 14px;
  --typography-body-b-5-fontsize: 8px;
  --typography-body-b-5-fontweight: 500;
  --typography-body-b-5-lineheight: 12px;
}
```

> h-1 through h-4 (58px–34px) are defined in the full token file but are **not used** in the dashboard. Omitted here for brevity — add them to `globals.css` only if needed.

---

## Colour Usage

### Layers
| Token | Use |
|---|---|
| `--color-layer-1` | Page background |
| `--color-layer-2` | Cards, sidebar, panels |
| `--color-layer-3` | Modals, dropdowns, row hover |

### Primary (Green)
| Token | Use |
|---|---|
| `--color-primary-400` for dark mode, while color-primary-300' for light mode| Active nav, focus rings, primary buttons |
| `--color-primary-500` | Hover on primary buttons |
| `--color-primary-alpha-10` | Active sidebar item background, selected row tint |
| `--color-primary-alpha-20` | Stronger hover/focus backgrounds |

### Secondary (Purple / Amber)
| Token | Use |
|---|---|
| `--color-secondary-200` | Secondary actions, info badge text, links |
| `--color-secondary-400` | Amber — earnings and financial callouts |
| `--color-secondary-alpha-10` | Info badge background |

### Neutrals
| Token | Use |
|---|---|
| `--color-neutral-100` | Primary text on dark surfaces |
| `--color-neutral-400` | Table cell values, secondary text |
| `--color-neutral-600` | Muted labels, placeholders, disabled |
| `--color-neutral-alpha-10` | Borders, dividers, hairlines |

### Semantic Status — Use these exclusively for status communication
| State | Text | Background |
|---|---|---|
| Active / Approved / Pass | `--color-green-200` | `--color-green-alpha-10` |
| Pending / Correction / Warning | `--color-yellow-100` | `--color-yellow-alpha-10` |
| Rejected / Banned / SOS / Error | `--color-red-100` | `--color-red-alpha-10` |
| Scheduled / In Review / Info | `--color-secondary-200` | `--color-secondary-alpha-10` |
| Offline / Inactive / Neutral | `--color-neutral-600` | `--color-neutral-alpha-10` |

---

## Typography Usage

Font family: **Inter** across all levels. No other typefaces.

| Scale | Size | Weight | Line-h | Use in dashboard |
|---|---|---|---|---|
| h-5 | 28px | 700 | 36px | KPI values, major modal titles |
| h-6 | 24px | 700 | 36px | Page titles |
| h-7 | 20px | 600 | 24px | Card headings, section labels |
| b-1 | 16px | 500 | 24px | Primary body, input values |
| b-2 | 14px | 500 | 21px | Table cells, form labels |
| b-3 | 12px | 400 | 18px | Metadata, timestamps, helper text |
| b-4 | 10px | 500 | 14px | Badges, tags, micro-labels |
| b-5 | 8px  | 500 | 12px | Use only when b-4 doesn't fit |
| btn | 14px | 700 | 21px | All button labels |

---

## Spacing & Stroke Reference

Spacing: `--spacing-0` (2px) → `--spacing-10` (56px). Use tokens only — no arbitrary px values.
Strokes: `--stroke-0` (1px) default borders · `--stroke-2` (4px) active nav accent · `--stroke-3` (6px) modal radius.
Border colour default: `--color-neutral-alpha-10` · Focus/active: `--color-primary-300`

---

## Components

### Status Badges
Use a shared `StatusBadge` component — never one-off coloured spans. Apply `b-4` type, `text-transform: uppercase`, `letter-spacing: 0.05em`. Padding: `--spacing-0` vertical, `--spacing-2` horizontal. Border-radius: `--stroke-2`.

Status → variant mapping:
- `active / approved / compliant / pass / paid / verified` → success
- `pending / submitted / in_review / correction_requested` → warning
- `rejected / banned / suspended / fail / sos_active` → danger
- `inspection_scheduled / document_review / in_progress` → info
- `offline / inactive / closed / unpaid / unverified` → neutral

### Buttons — 4 variants only
| Variant | Background | Text | Hover |
|---|---|---|---|
| `primary` | `--color-primary-300` | `--color-layer-1` | `--color-primary-500` | `--color-primary-400
| `secondary` | `--color-layer-3` | `--color-neutral-200` | `--color-layer-2` |
| `danger` | `--color-red-100` | `--color-neutral-100` | `--color-red-200` |
| `ghost` | transparent | `--color-neutral-600` | `--color-neutral-alpha-10` bg |

All buttons: `b-2` type weight 700, `min-height: 36px`, `border-radius: --stroke-2`, `padding: --spacing-2 --spacing-4`. Disabled: `opacity: 0.4`.

### Inputs
Background: `--color-layer-3` · Border: `--stroke-0 --color-neutral-alpha-10` · Focus border: `--color-primary-300` · Placeholder: `--color-neutral-600` · Text: `--color-neutral-200` · Type: `b-2` · Padding: `--spacing-2 --spacing-3` · Radius: `--stroke-2`.

Labels above inputs always — never placeholder-only. Required fields marked `*`. Error text: `b-3`, `--color-red-100`.

### Data Tables
Shared `DataTable` component only — no one-off tables. Header: `b-4` uppercase, `--color-neutral-600`, sticky, `--color-layer-2` bg. Cells: `b-2`, `--color-neutral-400`. Row hover: `--color-layer-3`. Dividers: `--stroke-0 --color-neutral-alpha-10`. Every table needs: search + status filter + page size selector + pagination. No infinite scroll. Empty state required.

### KPI Cards
`--color-layer-2` bg · `--stroke-0 --color-neutral-alpha-10` border · `--effect-e2` shadow · `--spacing-6` padding. Value: `h-5`, `--color-neutral-100`. Label: `b-3`, `--color-neutral-600`. Trend up: `--color-green-200` / down: `--color-red-100`. 4-column grid on wide, 2 on medium.

### Sidebar
`--color-layer-2` bg · Active: `border-left: --stroke-2 --color-primary-300`, `--color-primary-alpha-10` bg, `--color-neutral-100` label · Hover: `--color-layer-3` · Inactive label: `b-2`, `--color-neutral-600`. Role-gated items must not render — not disabled, not hidden with CSS, not rendered at all.

### Modals
Backdrop: `rgba(13,13,13,0.85)` · Panel: `--color-layer-3`, `--effect-e3`, `border-radius: --stroke-3`, `padding: --spacing-6`. Max width: 480px confirmations / 680px forms. Destructive confirmations must: describe the consequence, require a reason before enabling confirm, use `danger` button to confirm, `secondary` to cancel.

---

## Shadows
| Token | Use |
|---|---|
| `--effect-e0` | No shadow — flat same-layer surfaces |
| `--effect-e1` | Subtle lift — hovered rows, tooltips |
| `--effect-e2` | Cards and panels |
| `--effect-e3` | Modals and dropdowns |

---

## Accessibility
- Status badges always include a text label — colour alone is never sufficient
- Do not suppress `:focus-visible` — use `--color-primary-300` outline
- All interactive elements keyboard-navigable
- Icon-only buttons require `aria-label`
- Table headers use `<th scope="col">`
- Modals trap focus while open
