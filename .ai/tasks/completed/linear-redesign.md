# Implementation Plan: Linear-Inspired UI Redesign

**Status**: proposed  
**Date**: 2026-10-12  
**Framework**: Next.js App Router (Turbopack), Tailwind CSS v4, Coss UI (`@base-ui/react`), Geist Fonts  
**Scope**: Project-wide visual redesign, shared OKLCH semantic tokens, subtle glassmorphism on selected overlays, Coss UI component standardization, and QR Generator interface overhaul.

---

## 1. Project-Wide Audit & Inventory

### 1.1 Governance & Architecture Context
- **`AGENTS.md`**: Mandatory workflow: Explore -> Plan (`.ai/tasks/plan/`, status: proposed) -> Explicit User Approval -> Implement -> Validate -> Review Diff -> Report. Prohibits state-changing Git commands without explicit approval and automated ADR creation.
- **`.ai/AI_CONTEXT.md`**: Active project state is QR Generator Studio. CrossUI/Coss UI integration. All Foundation baseline criteria verified exit code 0.
- **`.ai/rules/frontend-ui.md`**: Coss UI architecture based on `@base-ui/react`. Tailwind CSS v4 semantic tokens (`bg-background`, `bg-card`, `bg-popover`, `bg-muted`, etc.). Merging classes via `cn(...)`. Geist Sans & Geist Mono typefaces. Mobile-first layout (`grid-cols-1` -> `lg:grid-cols-12`). AA contrast, visible focus rings, bounded accessible transitions.
- **Theme Mechanism**: Handled via `.dark` CSS class hierarchy on `html`/`body` using Tailwind `@custom-variant dark (&:is(.dark *));`. There is currently **no user-facing theme toggle** in `src/app/page.tsx` or `src/app/layout.tsx`. As instructed, **no theme toggle will be added** unless separately requested.

### 1.2 Route & Layout Inventory
- **`src/app/layout.tsx`**: Root layout configuring Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`), `h-full antialiased`, `min-h-full flex flex-col`.
- **`src/app/page.tsx`**: The sole primary user-facing page (QR Studio workstation). Contains the studio header, responsive two-column layout (`lg:grid-cols-12`), type selector, 9 payload configuration forms, design customization panel, live preview canvas, and export actions card.
- **`src/app/api/v1/health/route.ts`**: Backend REST API health endpoint (presentation untouched; preserved).
- **`src/app/favicon.ico`**: Favicon asset.

### 1.3 Component Inventory Requiring Visual Updates
1. **Shared Styles**:
   - `src/app/globals.css`: Token definitions, dark variant, `@theme inline`, and typography baseline.
2. **Coss UI Shared Primitives (`src/components/ui/`)**:
   - `card.tsx`: Card, CardHeader, CardTitle, CardDescription, CardContent/Panel, CardFooter.
   - `button.tsx`: Primary, secondary, outline, ghost, destructive, destructive-outline variants; sizing, loading spinner, and hit targets.
   - `badge.tsx`: Default, secondary, outline, success, warning, error, info variants.
   - `input.tsx`: Input field wrapper and control states (focus, invalid, autofill).
   - `tabs.tsx`: Segmented control / tab list and indicators.
   - `dialog.tsx`: DialogPopup, backdrop with subtle glass blur, headers, footers.
   - `menu.tsx`: Dropdown menus, submenus, popup glass/shadow styling.
   - `tooltip.tsx`: Crisp tooltip popup and viewport.
   - `toast.tsx`: Toast container, alert icons, action buttons, stacked card transforms.
   - `select.tsx`: Select trigger, popup list, scroll arrows, and indicators.
3. **QR Studio Domain Components (`src/components/studio/`)**:
   - `qr-type-selector.tsx`: 9-item QR type selection grid/list.
   - `qr-preview-canvas.tsx`: Live vector QR preview card, contrast heuristics, quiet zone notices, opaque canvas frame.
   - `studio-placeholders.tsx`: Export & Download action card, placeholder components.
   - `customization/design-customization-panel.tsx`: Color swatches, error correction buttons, margin buttons, logo options.
   - `forms/link-form.tsx`: Link URL destination input.
   - `forms/text-form.tsx`: Byte-exact text area input.
   - `forms/whatsapp-form.tsx`: Phone number & pre-filled message inputs.
   - `forms/social-form.tsx`: Platform selector & handle/URL input.
   - `forms/map-form.tsx`: Mode switcher (Address vs GPS) & coordinate fields.
   - `forms/coupon-form.tsx`: Promo code, description, terms, and checkout URL fields.
   - `forms/app-form.tsx`: Store switcher (iOS vs Android) & identifier field.
   - `forms/pdf-form.tsx`: Direct HTTPS PDF link input.
   - `forms/image-form.tsx`: Direct HTTPS Image link input.

---

## 2. Complete Semantic Design System Specification

### 2.1 Color Palette & OKLCH Token Definition
All tokens will be mapped in `src/app/globals.css` with `@theme inline` mappings and appropriate `:root` (light) and `.dark` (dark) values.

| Semantic Token | Light Mode Value (Clean Off-White) | Dark Mode Value (Neutral Charcoal) | Usage / Intent |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(0.985 0.002 250)` | `oklch(0.130 0.005 260)` | Base application background |
| `--surface` (`--card`) | `oklch(1.000 0.000 0)` | `oklch(0.165 0.005 260)` | Primary work panels, cards |
| `--surface-elevated` (`--popover`) | `oklch(0.995 0.001 250)` | `oklch(0.195 0.006 260)` | Menus, popovers, dialogs |
| `--foreground` | `oklch(0.145 0.005 260)` | `oklch(0.960 0.002 260)` | Primary high-contrast body text |
| `--foreground-muted` (`--muted-foreground`)| `oklch(0.480 0.010 260)` | `oklch(0.620 0.005 260)` | Secondary labels, descriptions |
| `--border` | `oklch(0.915 0.004 260)` | `oklch(1.000 0.000 0 / 8%)` | Quiet, low-contrast section divider |
| `--input` | `oklch(0.915 0.004 260)` | `oklch(1.000 0.000 0 / 12%)`| Form control border outline |
| `--accent` | `oklch(0.950 0.004 260)` | `oklch(0.220 0.006 260)` | Interactive hover & subtle selection |
| `--accent-foreground` | `oklch(0.145 0.005 260)` | `oklch(0.960 0.002 260)` | Text on accent surfaces |
| `--primary` (Restrained Accent) | `oklch(0.205 0.010 260)` | `oklch(0.920 0.005 260)` | Primary buttons, active indicators |
| `--primary-foreground` | `oklch(0.985 0.000 0)` | `oklch(0.165 0.005 260)` | Text inside primary actions |
| `--ring` (Focus Outline) | `oklch(0.550 0.040 250)` | `oklch(0.650 0.040 250)` | Restrained blue/neutral focus ring |
| `--glass` | `oklch(1.000 0.000 0 / 75%)` | `oklch(0.165 0.005 260 / 75%)`| Header & modal translucent fill |
| `--glass-border` | `oklch(0.915 0.004 260 / 80%)`| `oklch(1.000 0.000 0 / 10%)` | Translucent glass border |
| `--glass-shadow` | `0 4px 16px -2px oklch(0 0 0 / 5%)`| `0 8px 24px -4px oklch(0 0 0 / 30%)` | Calm soft elevation shadow |
| `--success` / `--success-foreground` | `oklch(0.62 0.16 145)` / `oklch(0.35 0.12 145)` | `oklch(0.70 0.15 145)` / `oklch(0.95 0.05 145)` | Valid status / scan-ready badge |
| `--warning` / `--warning-foreground` | `oklch(0.70 0.15 75)` / `oklch(0.40 0.12 75)` | `oklch(0.78 0.14 75)` / `oklch(0.95 0.05 75)` | Scannability / advisory warnings |
| `--destructive` / `--destructive-foreground`| `oklch(0.58 0.22 25)` / `oklch(0.40 0.18 25)` | `oklch(0.68 0.20 25)` / `oklch(0.95 0.05 25)` | Error states, validation failures |

### 2.2 Typography Scale & Rhythm
- Primary Typeface: Geist Sans (`font-sans`, `font-heading`).
- Code / Technical Typeface: Geist Mono (`font-mono`) for payloads, byte counters, hex colors.
- Title: 24–28px (`text-2xl font-semibold tracking-tight`).
- Section Headings: 16–18px (`text-base font-medium tracking-tight`).
- Primary Controls & Body: 14px (`text-sm font-normal text-foreground`).
- Secondary Labels & Helper Text: 12px (`text-xs text-muted-foreground`).
- Micro Indicators & Tags: 10–11px (`text-[11px] font-medium`).

### 2.3 Radii, Spacing & Motion Scale
- Standard Control & Panel Radii: 6–8px (`--radius: 0.5rem`, `--radius-md: 0.375rem`, `--radius-lg: 0.5rem`).
- Spacing Scale: Predominantly 16–24px gaps (`gap-4`, `gap-6`, `space-y-6`).
- Transitions: 120–180ms ease (`transition-all duration-150 ease-out`).
- Accessibility: `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`.
- Backdrop Blur Fallback: `@supports not (backdrop-filter: blur(1px)) { .backdrop-glass { background-color: var(--surface) !important; } }`.

---

## 3. Shared Coss UI Component Standards

### 3.1 Buttons (`src/components/ui/button.tsx`)
- **Primary (`variant="default"`)**: High-contrast solid treatment with subtle border, no harsh glow.
- **Secondary (`variant="secondary"`)**: Subtle solid background (`bg-secondary`), text `text-secondary-foreground`.
- **Outline (`variant="outline"`)**: 1px low-contrast border `border-input`, quiet hover `hover:bg-accent/60`.
- **Ghost (`variant="ghost"`)**: Borderless, quiet hover `hover:bg-accent/60`.
- **Destructive (`variant="destructive"`)**: Restrained crimson fill, text white.
- **States**: Consistent `hover`, `focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1`, `disabled:opacity-50 disabled:pointer-events-none`, and `data-loading` with embedded `Spinner`.

### 3.2 Cards (`src/components/ui/card.tsx`)
- Replace bulky double-borders and inset borders with a single clean 1px `border-border/80`, background `bg-card`, calm corner radius `rounded-xl` (8–12px), and restrained shadow `shadow-xs`.
- Clear header/content padding (`p-5 sm:p-6`).

### 3.3 Inputs & Textareas (`src/components/ui/input.tsx`, `textarea.tsx`, `field.tsx`)
- Clean 1px border `border-input`, calm background `bg-background dark:bg-card/40`.
- Active focus: `focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring`.
- Error state: `aria-invalid="true"` applies `border-destructive focus-visible:ring-destructive`.

### 3.4 Badges (`src/components/ui/badge.tsx`)
- Height 20–22px, padding `px-2 py-0.5`, font `text-[11px] font-medium`, subtle border.
- Variant treatments: `outline` (calm neutral), `success` (soft emerald tint), `warning` (soft amber tint), `destructive` (soft red tint).

### 3.5 Tabs & Segmented Controls (`src/components/ui/tabs.tsx`)
- Compact container `bg-muted/50 p-0.5 rounded-lg border border-border/40`.
- Active item: Solid elevated pill `bg-background shadow-xs text-foreground font-medium`.

### 3.6 Tooltips, Menus & Dialogs (`tooltip.tsx`, `menu.tsx`, `dialog.tsx`)
- Subtle glass backdrop on overlays (`backdrop-blur-md bg-popover/90 border border-border/80 shadow-lg`).
- Accessible naming on icon-only controls.

---

## 4. QR Studio Redesign Specification

### 4.1 Header (`src/app/page.tsx`)
- Subtle glass header: `bg-background/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-30`.
- Restrained Linear-style brand mark: Monochromatic 28x28px tile, `font-semibold text-sm` title ("Qwikly Studio"), subtle muted subtitle.
- Remove internal milestone tags (`"9 Types Activated"` badge removed).

### 4.2 Type Selector (`src/components/studio/qr-type-selector.tsx`)
- Replace border-heavy card grid with a compact, icon-led selection group.
- Clean visual grid (`grid-cols-3` on desktop, `grid-cols-2` or `grid-cols-3` on tablet).
- **Active State**: Distinctive subtle background (`bg-primary/10 border-primary text-foreground ring-1 ring-primary/30`), with a checkmark or indicator dot. Unmistakable without heavy dark fills.
- **Inactive State**: Quiet neutral border `border-border/60 bg-card hover:border-border hover:bg-accent/40`.
- Remove developer badges like `"9 Types Available"`.

### 4.3 Form Configuration Panels (`src/components/studio/forms/*-form.tsx`)
- Remove developer milestone badges (`"Sub-phase 2.2"`, `"Sub-phase 2.4 Notice"`).
- Keep clear functional badges where helpful to users (e.g., `"Direct Chat"`, `"Google Maps"`, `"Promo Code"`).
- Clean section headers (16px), aligned form labels (14px), clear character counters, concise helper descriptions (12px), and accessible error states.
- Preserve 100% of existing validation schemas (`qr-payload.ts`), live Zod rules, and exact byte preservation.

### 4.4 Design Customization Panel (`src/components/studio/customization/design-customization-panel.tsx`)
- Compact color swatches with clean 1px ring indicators.
- Segmented control styling for Error Correction (`L`, `M`, `Q`, `H`) and Quiet Zone (`0m`, `2m`, `4m`, `6m`).
- Logo embedding selector with clean icon presets and URL field.
- Maintain contrast calculation and ISO margin advisory notices.

### 4.5 Live Preview Canvas (`src/components/studio/qr-preview-canvas.tsx`)
- Right column workstation preview: `lg:sticky lg:top-20`.
- **Absolute Scannability Guarantee**: The QR code canvas frame is rendered on a guaranteed 100% solid, opaque, high-contrast surface (`backgroundColor: bgColor ?? '#ffffff'`). **Never apply glass, blur, opacity, or gradients to the QR modules or quiet zone.**
- ISO/IEC 18004 quiet zone preserved.
- Status badge: `"Ready to Scan"` (success) or `"Awaiting Input"` (muted).
- Stable layout that stacks seamlessly on mobile viewports without horizontal overflow.

### 4.6 Export Actions (`src/components/studio/studio-placeholders.tsx`)
- Clean export action buttons (`Download PNG`, `Download SVG`).
- Remove internal development tags (`"Sub-phase 2.4"`).

---

## 5. Scope Safeguards & Implementation Boundaries
- **No Dependency Additions**: Rely exclusively on Tailwind CSS v4 and existing `@base-ui/react` primitives.
- **No Architectural or Backend Changes**: Leave `src/server/`, `src/app/api/`, Prisma schemas, and Next.js proxy untouched.
- **No Unrequested Features**: No new marketing sections, analytics, or unrequested features.
- **No Theme Toggle**: Theme is defined via CSS variables and `.dark` class support. No toggle UI will be introduced unless explicitly requested.
- **Preserve Business Logic**: Retain state isolation, schema validation, payload normalization, error handling, and test invariants.

---

## 6. Implementation Checkpoints & Expected File Changes

| Stage | Files to Modify | Expected Changes |
| :--- | :--- | :--- |
| **Stage 1: Design Tokens & CSS Foundation** | `src/app/globals.css` | Define OKLCH tokens for light/dark, glass tokens, typography baseline, transition rules, and reduced motion fallback. |
| **Stage 2: Coss UI Shared Primitives** | `src/components/ui/card.tsx`<br>`src/components/ui/button.tsx`<br>`src/components/ui/badge.tsx`<br>`src/components/ui/input.tsx` | Simplify card borders and padding; standardize button variants and hover/active states; refine badge and input styles. |
| **Stage 3: QR Studio Type Selector & Workstation Header** | `src/app/page.tsx`<br>`src/components/studio/qr-type-selector.tsx` | Header glassmorphism; clean icon-led type selector with distinct active indicator; remove internal developer badges. |
| **Stage 4: Configuration Forms & Customization Panel** | `src/components/studio/forms/*.tsx`<br>`src/components/studio/customization/design-customization-panel.tsx` | Clean headings, aligned labels, remove milestone badges, refine color presets and segmented controls. |
| **Stage 5: Live Preview Canvas & Export Card** | `src/components/studio/qr-preview-canvas.tsx`<br>`src/components/studio/studio-placeholders.tsx` | Sticky desktop positioning, opaque scannable preview tile, clean export buttons without developer tags. |
| **Stage 6: Validation & Diff Audit** | All touched files | Run verification commands (`test`, `tsc`, `lint`, `build`), audit git diff, report results. |

---

## 7. Acceptance Criteria & Verification Matrix

### 7.1 Quantitative Verification Matrix
| Verification Command | Target Result | Purpose |
| :--- | :--- | :--- |
| `pnpm test` | **Pass (81 / 81 tests)** | Verify zero regressions across QR payload normalization, state isolation, contrast heuristics, and SVG geometry. |
| `pnpm exec tsc --noEmit` | **0 errors (Exit code 0)** | Verify complete TypeScript type safety across all components and props. |
| `pnpm eslint src/app src/components/studio src/components/ui` | **0 errors (Exit code 0)** | Verify adherence to Next.js and React coding standards in touched files. |
| `pnpm build` | **Clean build (Exit code 0)** | Verify production Turbopack compilation and static page generation. |

### 7.2 Qualitative Design Acceptance Criteria
- [ ] **Linear-Inspired Hierarchy**: Calm, low-contrast neutral charcoal in dark mode and clean white/light-gray in light mode. No harsh neon borders or excessive card nesting.
- [ ] **Subtle Glassmorphism**: Restricted to header, menus, and overlays; backdrop-blur 12–16px; solid fallback when unsupported.
- [ ] **Unmistakable Selection**: Selected QR type is immediately obvious via clear styling and indicator without relying on raw text or color alone.
- [ ] **Scannability Protection**: QR preview remains 100% solid, opaque, and ISO-compliant with 4-module quiet zone. No blur or translucency on QR code itself.
- [ ] **Customer-Facing Polish**: All developer milestone tags (`"Sub-phase 2.2"`, `"Sub-phase 2.4 Notice"`, `"9 Types Activated"`) are removed from user-facing UI.
- [ ] **Responsive & Accessible**: Seamless stacking on narrow viewports (<640px) without horizontal scrolling; WCAG AA contrast; visible focus rings; keyboard navigable.

---

*This plan is strictly proposed for review. Implementation will begin only upon explicit user authorization.*
