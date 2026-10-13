# Plan: Sub-phase 2.3 — Remaining QR Types & Design Customization (Revised)

- **Status**: implemented
- **Date**: 2026-10-12
- **Author**: Implementer
- **Target Sub-phase**: 2.3

---

## 1. Scope Boundaries & Architectural Placement

### 1.1 Resolution: PDF & Image Hosting Placement (Sub-phase 2.3 vs Sub-phase 2.4)
- **Definitive Clarification**:
  - **Binary File Upload & Cloud Hosting belongs strictly in Sub-phase 2.4**.
  - **Direct Public URL Mode for PDF and Image belongs in Sub-phase 2.3**.
- **Architectural Rationale**:
  1. **Phase 1 Database Gate**: In `.ai/AI_CONTEXT.md`, database migrations are recorded as `GATED / PENDING credentials`. Introducing binary file uploads and server-side shortlink redirect records before database authorization violates Rule 01 and Phase 1 gates.
  2. **Static Workstation Boundary**: Phase 2.1–2.3 is explicitly designed as a zero-persistence, client-side workstation that does not require database records, server storage, virus scanning, or authentication.
  3. **Sub-phase 2.3 Implementation for PDF & Image**:
     - Both types accept valid, direct HTTPS URLs pointing to an existing online file (e.g., `https://example.com/menu.pdf`, `https://cdn.example.com/flyer.png`).
     - Client-side validation checks HTTPS URL syntax only. It does **not** claim to prove server reachability, file existence, or true MIME type.
     - Preserves all legitimate query parameters (e.g. signed URLs with SAS tokens or S3 signatures) and fragment hashes.
     - Form includes an active badge: `"Direct URL Mode (Static)"` and an informational notice: `"File Upload & Cloud Hosting will be activated in Sub-phase 2.4"`.

---

## 2. Contrast & Scannability Specification

### 2.1 Contrast Threshold as a Warning Heuristic
- **Threshold**: Standard relative luminance contrast ratio of **4.5:1** ($(\text{L1} + 0.05) / (\text{L2} + 0.05)$).
- **Behavior**:
  - Purely advisory, non-blocking visual warning indicator in the Design Customization panel.
  - Does **not** disable preview generation or block user input.
- **Explicit Limitations & Disclaimers**:
  1. **Human Legibility vs. Computer Vision**: The 4.5:1 ratio is a WCAG 2.1 metric designed for human typographic readability on backlit monitors. It does not model barcode binarization algorithms (e.g., Otsu's thresholding, adaptive thresholding).
  2. **Inverted QR Codes**: Light foreground modules on dark backgrounds can have high contrast (>10:1) yet remain completely un-scannable by standard physical laser/CCD scanners and many basic mobile camera apps that expect dark finder patterns.
  3. **Real-world Variables**: Screen glare, low ambient light, camera lens distortion, and display angles cannot be detected or guaranteed by client-side math.
  4. **Strict Disclaimer**: The contrast calculation is a design heuristic to discourage obvious low-contrast combinations (e.g., light gray on white); **it does not guarantee physical or optical scannability**.

---

## 3. Normalized Payload Contracts for Remaining 7 Types

All schemas reside in `src/schemas/qr-payload.ts` and output deterministic strings. Existing validation primitives (`linkPayloadSchema` URL resolution) are reused to prevent logic duplication.

### 3.1 WhatsApp (`whatsapp`)
- **Input Contract**:
  - `phone`: String containing country code and subscriber digits (e.g., `"+1 (555) 019-2834"` or `"44 7911 123456"`).
  - `message`: Optional string (max 500 characters).
- **Normalization & Validation**:
  - Strip all non-digit characters (`val.replace(/\D/g, '')`).
  - Validation: Cleaned digits must match `/^\d{7,15}$/` (ITU-T E.164 standard without leading `+`).
  - Message: Trimmed. If non-empty, encoded via `encodeURIComponent`.
- **Output Contract**:
  - If message present: `https://wa.me/${cleanDigits}?text=${encodeURIComponent(trimmedMessage)}`
  - If message empty: `https://wa.me/${cleanDigits}`

### 3.2 Social Media (`social`)
- **Supported Platforms**:
  - `instagram`: `https://instagram.com/${cleanHandle}/`
  - `x`: `https://x.com/${cleanHandle}`
  - `linkedin`: `https://linkedin.com/in/${cleanHandle}/`
  - `youtube`: `https://youtube.com/@${cleanHandle}`
  - `facebook`: `https://facebook.com/${cleanHandle}`
  - `tiktok`: `https://tiktok.com/@${cleanHandle}`
  - `github`: `https://github.com/${cleanHandle}`
  - `custom`: Direct user-provided URL.
- **Normalization & Validation**:
  - For standard platforms: Input can be a handle (`@johndoe` or `johndoe`) or full URL. If full URL, extract path slug. Validate handle characters (`/^[a-zA-Z0-9_.-]+$/`).
  - For `custom`: Strictly validate HTTP/HTTPS web URL using the shared `linkPayloadSchema` transformation logic. Reject non-web schemes (`javascript:`, `data:`, `file:`).
- **Output Contract**: Canonical full profile URL.

### 3.3 Map Address (`map`)
- **Input Contract**:
  - Mode toggle: `'address'` | `'coordinates'`
  - Address mode: `query` string (1–300 characters).
  - Coordinates mode: `latitude` (number between -90 and 90, up to 6 decimals) and `longitude` (number between -180 and 180, up to 6 decimals).
- **Normalization & Validation**:
  - Address: Trimmed and encoded via `encodeURIComponent`.
  - Coordinates: Validated bounds; formatted deterministically as `${lat},${lng}`.
- **Output Contract**:
  - Address: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  - Coordinates: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

### 3.4 Coupon (`coupon`)
- **Input Contract**:
  - `code`: Required string (1–32 characters, uppercase alphanumeric, hyphens, underscores).
  - `description`: Required string (1–100 characters).
  - `terms`: Optional string (max 200 characters).
  - `redeemUrl`: Optional string.
- **Deterministic Choice**:
  - **Rule**: When `redeemUrl` is supplied and valid, the output contract is a web link with the coupon injected as a standard query parameter. When `redeemUrl` is omitted, the output is a defined, structured plain-text coupon card.
- **Output Contract**:
  - If `redeemUrl` present: Appends or merges `coupon=${encodeURIComponent(code)}` to `redeemUrl` (validated via `linkPayloadSchema`).
  - If `redeemUrl` omitted: Deterministic multi-line string:
    ```
    COUPON: ${code}
    OFFER: ${description}
    TERMS: ${terms} (only if non-empty)
    ```

### 3.5 App Link (`app`)
- **Input Contract**:
  - Mode toggle: `'ios'` | `'android'`
  - iOS Input: Numeric App ID (`^\d{9,11}$`) or full `apps.apple.com` URL.
  - Android Input: Package name (Reverse-DNS format `^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$`) or full `play.google.com` URL.
- **Normalization & Validation**:
  - Extract identifier if full URL is pasted. Validate identifier format.
- **Output Contract**:
  - iOS: `https://apps.apple.com/app/id${appId}`
  - Android: `https://play.google.com/store/apps/details?id=${packageName}`

### 3.6 PDF Direct URL (`pdf`)
- **Input Contract**: Direct web URL string.
- **Normalization & Validation**:
  - Reuses shared `linkPayloadSchema` HTTPS requirement.
  - Preserves legitimate query parameters (e.g. S3 presigned signatures, SAS tokens) and hash anchors.
  - Explicit non-blocking guidance if URL path does not end with `.pdf`.
- **Output Contract**: Validated HTTPS URL string.

### 3.7 Image Direct URL (`image`)
- **Input Contract**: Direct web URL string.
- **Normalization & Validation**:
  - Reuses shared `linkPayloadSchema` HTTPS requirement.
  - Preserves legitimate query parameters and hash anchors.
  - Explicit non-blocking guidance if URL path does not end with common image extensions (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`).
- **Output Contract**: Validated HTTPS URL string.

---

## 4. Logo & QR Design Safety

### 4.1 Verification of `qrcode.react` (v4.2.0) API
- `QRCodeSVG` accepts `imageSettings?: ImageSettings`:
  ```ts
  type ImageSettings = {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
    x?: number;
    y?: number;
    opacity?: number;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  };
  ```

### 4.2 Conservative Logo Size & Boundary Limits
- **Size Constraint**: Embedded logo width/height must not exceed **20%** of total QR code size (e.g., max 44px for a 220px QR code).
- **Excavation Policy**: `excavate: true` is permanently enabled when a logo is active to prevent module collision and foreground interference.

### 4.3 Error-Correction Locking Policy
- When an embedded logo is active, error correction is strictly locked to **`Q` (25%) or `H` (30%)** (defaulting to `H`).
- If the user had previously selected `L` (7%) or `M` (15%), the system automatically elevates to `H` and presents an informative notice: *"Error correction elevated to High (30%) to maintain scannability with embedded logo"*.

### 4.4 Quiet Zone (Margin) Policy
- Default remains **4 modules** per ISO/IEC 18004.
- If the user selects a margin below 4 modules (0 to 3), the UI displays an advisory warning: *"Margins below 4 modules violate ISO/IEC 18004 quiet zone standards and may fail on dark or textured surfaces"*.

### 4.5 Customization Invariants & Limitations
- **Immutability of Payload**: Customization settings (`fgColor`, `bgColor`, `level`, `marginSize`, `imageSettings`) affect **only** visual rendering and **never mutate** the underlying normalized payload string.
- **External Logo URL Limitations**:
  - In SVG mode, `<image href="..." />` relies on client browser resolution.
  - If an external image fails to load or is blocked by CORS/CSP, the excised center modules rely on Reed-Solomon error correction for recovery.
  - In Sub-phase 2.3, preset built-in SVG icons (encoded as inline data URIs or local assets) will be provided alongside custom URL input to ensure reliable rendering.

---

## 5. Architecture & State Isolation

### 5.1 Workstation Boundary & Architecture
- Single Next.js application, preserving App Router architecture.
- Strictly client-side state; no database models, migrations, API routes, or server actions.
- Uses existing CrossUI / shadcn design tokens and CSS variables.

### 5.2 Independent Type State Model
To prevent stale previews, state contamination, or cross-type leaks when switching:
- Maintain an explicit, strongly typed state record:
  ```ts
  type StudioFormState = {
    raw: Record<string, string>;
    encoded: string | null;
    isValid: boolean;
  };

  type StudioState = Record<QrType, StudioFormState>;
  ```
- Selecting a tab loads strictly `studioState[selectedType]`.
- If `isValid` is false, the canvas strictly renders the placeholder finder pattern shell without stale data.

---

## 6. Staged Implementation & Testing Checkpoints

### Checkpoint 1: Payload Schemas & Contract Tests
- **Files**: `src/schemas/qr-payload.ts`, `tests/studio/payload-remaining.test.ts`.
- **Scope**: Implement Zod schemas and normalization transforms for all 7 types.
- **Tests**:
  - WhatsApp phone cleaning and query encoding.
  - Social media handle expansion and custom URL HTTP/HTTPS enforcement.
  - Map address URL encoding and coordinate bounds.
  - Coupon deterministic redeem URL vs plain text fallback.
  - App Store ID and Google Play package name validation.
  - PDF/Image HTTPS preservation with query tokens.
- **Acceptance Criteria**: 100% test pass on schema suite; zero TypeScript errors.

### Checkpoint 2: Form Components & Studio Integration
- **Files**:
  - `src/components/studio/forms/whatsapp-form.tsx`
  - `src/components/studio/forms/social-form.tsx`
  - `src/components/studio/forms/map-form.tsx`
  - `src/components/studio/forms/coupon-form.tsx`
  - `src/components/studio/forms/app-form.tsx`
  - `src/components/studio/forms/pdf-form.tsx`
  - `src/components/studio/forms/image-form.tsx`
  - `src/app/page.tsx`
- **Scope**: Build accessible forms using existing UI components (`Card`, `Input`, `Field`, `Badge`). Wire state into `page.tsx`.
- **Tests**: `tests/studio/state-isolation.test.ts` verifying independent state per type and absence of stale preview bleeding.
- **Acceptance Criteria**: Switching between all 9 types displays correct form and live preview without state bleeding.

### Checkpoint 3: Design Customization & Preview Canvas Integration
- **Files**:
  - `src/schemas/qr-design.ts`
  - `src/components/studio/customization/design-customization-panel.tsx`
  - `src/components/studio/qr-preview-canvas.tsx`
  - `tests/studio/qr-design.test.ts`
- **Scope**:
  - Implement design schema (`fgColor`, `bgColor`, `level`, `marginSize`, `logoSettings`).
  - Calculate 4.5:1 contrast heuristic with advisory warning.
  - Implement logo size bounds (max 20%), excavation, and auto-elevation to `H`.
  - Quiet zone default 4 with sub-4 warning.
- **Tests**:
  - Contrast ratio calculation and warning threshold test.
  - Logo excavation prop assertion.
  - Auto-elevation logic assertion.
  - Custom colors SVG output assertion (without claiming physical scannability).
- **Acceptance Criteria**: Customizations dynamically apply to SVG; underlying payload remains untouched.

### Checkpoint 4: Full Validation, Git Diff Review & Scanner Verification
- **Scope**: Run full suite of validation commands:
  ```bash
  pnpm test
  pnpm exec tsc --noEmit
  pnpm lint
  pnpm build
  ```
- **Review**: Independent Git diff review to ensure zero unintended changes or unapproved dependencies.
- **Manual QA Matrix**: Physical device testing across iOS Camera and Android Google Lens.

---

## 7. Explicitly Unresolved Decisions for User Confirmation

1. **Coupon Plain-Text Layout**: Confirm whether the plain-text fallback format (`COUPON: ...\nOFFER: ...\nTERMS: ...`) matches the desired offline display format.
2. **Social Media Platform List**: Confirm whether the 7 platforms (Instagram, X, LinkedIn, YouTube, Facebook, TikTok, GitHub) plus Custom cover all intended profiles for this phase.
3. **Map Provider**: Confirm that Google Maps standard search URL (`https://www.google.com/maps/search/?api=1&query=...`) is the preferred universal format over platform-specific `geo:` URIs or Apple Maps.

---

*This document is a revised plan only. No code changes, package installations, or project file modifications have been made.*
