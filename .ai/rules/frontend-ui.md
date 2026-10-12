# Rule: Frontend UI Standards

This rule governs frontend development, visual styling, component architecture, and accessibility for the QR Generator project.

---

## 1. coss UI Component Integration & Boundaries
- Generic UI primitives belong in `src/components/ui/` and follow the `coss` (`@coss` aria-nova) component architecture based on `@base-ui/react`.
- Domain and feature components (e.g., `src/components/studio/`, `src/features/`) consume primitives from `@/components/ui/...`.
- Do not add hardcoded business logic or domain rules inside generic `src/components/ui/` primitives; compose or wrap them instead.

## 2. Tailwind CSS v4 Styling Conventions
- Always use semantic design tokens instead of hardcoded raw values or arbitrary colors:
  - Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`
  - Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-primary-foreground`
  - Accents & Status: `bg-primary`, `bg-secondary`, `bg-destructive`, `bg-success`, `bg-warning`, `bg-info`
  - Borders & Outlines: `border-border`, `border-input`, `ring-ring`
- Merge classes exclusively using the centralized utility `cn(...)` from `@/lib/utils`.

## 3. Typography Standards
- **Geist Sans (`font-sans`, `font-heading`)**: Primary typeface for UI copy, labels, headers, and buttons.
- **Geist Mono (`font-mono`)**: Technical typeface for code snippets, payload previews, request IDs, and character counters.
- Use explicit font weights and line heights (`font-semibold`, `leading-none`, `leading-tight`, `leading-normal`) for readability.

## 4. Hybrid Glassmorphism Visual Direction
- Combine subtle translucent backdrops (`backdrop-blur-md`, `backdrop-blur-xs`) with semi-transparent surfaces (`bg-background/80`, `bg-card/90`, `bg-muted/40`).
- Use delicate translucent borders (`border-border/60`, `border-border/80`) to add depth while maintaining contrast.
- Ensure all text and interactive controls maintain WCAG 2.1 AA contrast against blurred backgrounds in both light and dark themes.

## 5. Design Tokens & Component Composition
- Standardize spacing and corners using theme variables (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-2xl`).
- Utilize `class-variance-authority` (`cva`) for multi-variant interactive components.
- Keep animation durations bounded and accessible (`transition-all duration-150`, respecting `motion-reduce`).

## 6. Responsive Layout & Accessibility (a11y)
- **Mobile-first architecture**: Stack vertically on mobile viewports (`grid-cols-1`), expanding to two-column workstation layouts on desktop (`lg:grid-cols-12`).
- **Touch Targets**: Minimum 44×44px hit targets for interactive elements on coarse pointers (`pointer-coarse:min-h-11`).
- **Semantics & ARIA**:
  - Toggle groups: Container with `role="group"` and `aria-label`; items with `<button type="button" aria-pressed={...}>`.
  - Upcoming or placeholder actions: Mark with `disabled` and `aria-disabled="true"`.
  - Always provide high-contrast visible focus rings (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`).

## 7. Server & Client Component Boundaries
- Default to React Server Components (RSC) whenever possible.
- Use `'use client'` only when client-side state (`useState`, `useReducer`), event handlers, or browser APIs are required.
- Isolate client components as leaf nodes or focused UI boundaries to maximize static pre-rendering.

## 8. State, Validation & Error Presentation
- Form state and payload encoders must validate against strict Zod schemas shared with the backend.
- Display contextual, accessible validation messages adjacent to inputs with `aria-describedby` and `aria-invalid`.
- Never show misleading functional promises on placeholder controls.

## 9. Testing & UI Verification Strategy
- Verify UI registry invariants, data mappers, and pure state utilities using Node's test runner (`pnpm test`).
- Enforce strict typing (`tsc --noEmit`), lint checks (`pnpm lint`), and production build optimization (`pnpm build`).

## 10. Dependency Governance & Scope Protection
- Do not install additional UI libraries, icon packs, or CSS frameworks without explicit user authorization.
- Keep frontend edits isolated from backend route handlers (`src/server/`) and database schemas.
