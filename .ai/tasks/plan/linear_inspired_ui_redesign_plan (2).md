# Implementation Plan: Linear-Inspired UI Redesign

**Status:** Proposed — approval required before implementation  
**Project:** QR Generator  
**Scope:** Presentation-layer redesign only

## 1. Objective

Redesign the existing QR Generator interface around a consistent, Linear-inspired UI standard with subtle glassmorphism and full light/dark theme compatibility.

Keep the current technology stack:

- Next.js
- TypeScript
- Tailwind CSS v4
- coss UI

Do not replace the UI library or introduce new dependencies. Preserve existing routes, QR types, validation, integrations, state behavior, and business logic.

## 2. Project Rules and Constraints

Before implementation, review and follow:

- `AGENTS.md`
- `.ai/AI_CONTEXT.md`
- `.ai/rules/frontend-ui.md`

Implementation must follow the project's established workflow:

1. Explore the existing code and architecture.
2. Implement only after explicit approval of this plan.
3. Validate the changes.
4. Review the final diff for unintended changes.
5. Report changed files, validation results, and known issues.

Additional constraints:

- Do not add features or dependencies.
- Do not modify API behavior, QR payload generation, schemas, or business logic.
- Avoid unrelated files and refactors.
- Keep the existing `.dark` class-based theme mechanism; do not add a theme toggle as part of this work.
- Do not claim that a QR code is guaranteed to scan. Use accurate readiness language based on valid payload and rendered preview.

## 3. Design Direction

### Visual principles

- **Linear-inspired:** clean hierarchy, restrained surfaces, compact controls, clear spacing, and minimal decoration.
- **Subtle glassmorphism:** reserve translucency and backdrop blur for appropriate shell surfaces.
- **Accessible contrast:** readable text, visible focus states, and clear disabled/error states.
- **Consistent behavior:** shared components should use the same visual language and interaction states.
- **Responsive layout:** maintain usability on narrow screens, tablets, and desktop displays.

### Where to use glass

Use subtle glass effects only for suitable surfaces, such as:

- Header or navigation shell
- Toolbars
- Menus
- Dialogs, where appropriate

Keep these surfaces opaque or solid where readability and output fidelity matter:

- Form inputs and textareas
- QR preview canvas and its white quiet zone
- Important content surfaces that would lose contrast through transparency

Provide a solid-color fallback when backdrop blur is unavailable. Respect `prefers-reduced-motion`.

## 4. Typography

### Required font choices

- **Manrope:** primary UI font across the application.
- **Geist Mono:** technical values where appropriate, such as code-like payloads or technical identifiers.

Manrope should be used consistently for:

- Body text and headings
- Navigation and labels
- Buttons and selectors
- Form fields
- Badges
- Dialogs, menus, and notifications

### Implementation approach

1. Inspect the existing font loading and CSS variable setup in `src/app/layout.tsx` and `src/app/globals.css`.
2. Replace the primary UI font mapping with Manrope using the project's existing Next.js font-loading approach where practical.
3. Map the UI font variable consistently through the root layout and Tailwind v4 theme.
4. Remove unintended Geist Sans overrides that cause the old UI font to remain in use.
5. Retain Geist Mono only for technical values that benefit from a monospaced typeface.

Do not add a font package or other dependency. If remote font loading is unsuitable for the build environment, use an already-approved project-compatible alternative and report the choice.

## 5. Design Tokens and Theme

Update the global design system in `src/app/globals.css`, along with root font configuration in `src/app/layout.tsx` as needed.

Use semantic OKLCH tokens through Tailwind CSS v4's `@theme inline` approach.

Define coherent light and dark values for relevant semantic roles, including:

- Background and foreground
- Card and popover surfaces
- Muted surfaces and muted text
- Borders and input borders
- Primary and accent colors
- Focus ring
- Success, warning, and destructive states
- Glass surface and glass border

Requirements:

- Preserve the current `.dark` class-based theme behavior.
- Check contrast in both themes.
- Use a consistent 4px-based spacing scale.
- Standardize control radii around 6–8px and card radii around 12px, consistent with the existing design where practical.
- Keep transitions restrained, typically around 120–180ms.
- Disable or reduce nonessential motion when `prefers-reduced-motion: reduce` is active.
- Avoid broad CSS selectors or overrides that unintentionally affect unrelated components.

## 6. Implementation Checkpoints

### Checkpoint 1 — Global tokens and typography

**Likely files:**

- `src/app/globals.css`
- `src/app/layout.tsx`

Tasks:

- Audit existing tokens, theme selectors, font variables, and Tailwind v4 mappings.
- Establish consistent light/dark semantic tokens.
- Apply Manrope as the application-wide UI font.
- Retain Geist Mono for suitable technical values.
- Add restrained global focus, transition, and reduced-motion behavior without overriding component-specific states.

### Checkpoint 2 — Shared coss UI primitives

Audit and standardize the existing shared primitives, focusing on the components used by the active QR Studio UI. Expected candidates include:

- Button
- Card
- Badge
- Input and field
- Tabs
- Select
- Dialog
- Menu
- Tooltip
- Toast or notification components

Use the actual existing component inventory to determine which files require changes. Do not recreate components or replace coss UI.

Standardize:

- Sizes and radii
- Typography
- Border and surface treatment
- Hover, active, focus-visible, disabled, loading, and error states
- Light/dark compatibility

Only modify components that are relevant to the current application and necessary for consistency.

### Checkpoint 3 — Header and QR type selector

**Likely files:**

- `src/app/page.tsx`
- `src/components/studio/qr-type-selector.tsx`

Tasks:

- Apply the shared design tokens and component styles.
- Make the type selector compact and icon-led while preserving all nine QR types.
- Improve hierarchy and spacing without changing selection behavior.
- Keep the header restrained, using glass only if it improves the shell without harming readability.

### Checkpoint 4 — Forms and design customization

**Likely areas:**

- `src/components/studio/forms/*.tsx`
- `src/components/studio/design-customization-panel.tsx`

Tasks:

- Apply consistent field spacing, labels, help text, validation feedback, and focus states.
- Ensure forms and controls remain solid and readable.
- Standardize customization controls with the shared component system.
- Preserve existing schemas, validation, payload generation, and state isolation between QR types.

Do not change QR type functionality or add new form behavior.

### Checkpoint 5 — QR preview and export presentation

**Likely areas:**

- `src/components/studio/qr-preview-canvas.tsx`
- `src/components/studio/studio-placeholders.tsx`
- Relevant existing preview/export components

Tasks:

- Keep the QR preview on a solid, high-contrast surface with a clear quiet zone.
- Align preview, customization, and export controls with the new design system.
- Improve responsive layout and empty/loading/error states where they already exist.
- Use accurate status language: a readiness state may indicate that the payload is valid and the preview has rendered, but must not promise successful scanning in every environment.

Do not change QR encoding or export behavior.

### Checkpoint 6 — Responsive, accessibility, and validation review

Verify the redesign across:

- Light and dark theme class states
- Narrow mobile, tablet, and desktop widths
- Keyboard navigation and visible focus
- Labels and accessible names
- Text and control contrast
- Disabled and validation-error states
- Reduced-motion preferences
- QR preview contrast and quiet zone

## 7. Validation Plan

Run the project's established validation commands:

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Requirements:

- Verify the actual test count and results; do not rely on a previously reported count.
- Run all required commands after implementation.
- If full lint reports known pre-existing failures in unrelated scaffold/vendor files, identify them separately from regressions and do not silently change unrelated files.
- Fix regressions caused by this redesign.
- Inspect the final diff for business-logic changes, accidental dependency changes, and unrelated edits.

## 8. Acceptance Criteria

The work is complete only when:

- Manrope is visibly and consistently used as the primary UI font throughout the application.
- Geist Mono remains limited to appropriate technical values.
- Light and dark themes use consistent semantic tokens and readable contrast.
- coss UI and Tailwind CSS v4 remain in place.
- Glass effects are subtle and limited to suitable shell surfaces.
- Inputs and QR preview remain solid and readable.
- The QR Studio is responsive and visually consistent.
- All nine QR types and existing behavior remain unchanged.
- No new dependencies or features have been introduced.
- Tests, type checking, lint, and build results are reported accurately.
- The final diff contains no unrelated changes.

## 9. Expected Final Report

After implementation, report:

1. Summary of the visual changes.
2. Files changed and the purpose of each change.
3. How Manrope and Geist Mono are applied.
4. Light/dark and responsive checks performed.
5. Exact results of tests, type checking, lint, and build.
6. Any pre-existing issues or limitations.
7. Confirmation that QR behavior and business logic were preserved.

---

**Approval gate:** This document is a proposal only. Do not modify project files until the user explicitly approves this plan.
