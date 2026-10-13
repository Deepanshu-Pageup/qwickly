# Plan: QR Encoding Verification, Scannability & Quality Validation

- **Status**: approved
- **Date**: 2026-10-12
- **Author**: Implementer
- **Target Sub-phase**: 2.2 / Quality Assurance

---

## 1. Problem Statement & Risk Analysis

### Issue
`qrcode.react` (v4.2.0) was integrated into `src/components/studio/qr-preview-canvas.tsx` without an explicit automated test suite verifying encoding quality, SVG geometry, error correction levels, or real-world reader scannability across diverse devices.

### Impact & Risks
1. **Scannability Failure on Tight Quiet Zones**: In `qr-preview-canvas.tsx`, `marginSize` is configured to `2`. The ISO/IEC 18004 QR specification recommends a minimum quiet zone of **4 modules** (`marginSize={4}`). A reduced 2-module margin risks scanner failure when adjacent UI elements or dark containers border the QR code.
2. **Error Correction Adequacy**: Hardcoding `level="M"` (~15% recovery) is optimal for generic URLs, but high payload lengths (up to 2048 chars) or upcoming logo customizations (Sub-phase 2.3) require verified handling of `L`, `M`, `Q`, and `H`.
3. **Absence of Automated Verification**: Currently, tests only validate payload strings via Zod (`tests/studio/payload-validation.test.ts`). There are zero tests asserting that `QRCodeSVG` renders well-formed SVG structures across boundary conditions (max-length URLs, Unicode text, emojis, special characters).

---

## 2. Technical Findings & Dependency Verification

1. **Underlying Engine**:
   - `qrcode.react` v4.2.0 is powered by **Project Nayuki's QR Code Generator** (`qrcodegen`), an industry-standard, ISO/IEC 18004 compliant TypeScript/JavaScript engine.
   - It carries **zero additional runtime dependencies** (`qrcode.react` embeds Nayuki directly), keeping the bundle footprint lean.
2. **Standard Alignment**:
   - **Error Correction Level**:
     - `L` (Low): ~7% damage recovery — lowest density, best for tiny display sizes.
     - `M` (Medium): ~15% damage recovery — standard default balance.
     - `Q` (Quartile): ~25% damage recovery — elevated resistance.
     - `H` (High): ~30% damage recovery — highest density, required when center logos/emblems obscure the matrix.
   - **Quiet Zone**: Standard specifies 4 modules. Increasing `marginSize` from `2` to `4` (or making it customizable with default 4) eliminates border-interference scanning defects.

---

## 3. Proposed Implementation Scope

### Step 1: Update Canvas Quiet Zone & Error Correction Configuration
- File: `src/components/studio/qr-preview-canvas.tsx`
- Changes:
  - Add optional `level?: 'L' | 'M' | 'Q' | 'H'` prop (defaulting to `'M'`) to `QrPreviewCanvasProps`.
  - Add optional `marginSize?: number` prop (defaulting to `4` per ISO/IEC 18004 standard) to ensure compliant quiet zone.
  - Document the rationale inline per Rule 05.

### Step 2: Implement Automated QR Generation Test Suite
- File: `tests/studio/qr-encoding.test.ts`
- Tests to add using `node:test` and `node:assert/strict` (no extra dependencies):
  1. **SVG Structure & Attribute Invariants**:
     - Renders valid `<svg>` element with `viewBox`, `xmlns="http://www.w3.org/2000/svg"`, explicit width/height matching `size`, and accessible `aria-label`.
     - Confirms foreground and background colors (`#000000` / `#ffffff`) and SVG `<path>` module commands.
  2. **Quiet Zone (Margin) Compliance**:
     - Asserts viewBox accounts for `marginSize=4` (module count + 2 * 4).
  3. **Error Correction Level Validation**:
     - Renders identical payloads across levels `L`, `M`, `Q`, and `H`.
     - Asserts increasing module density / viewBox dimensions as error correction increases.
  4. **Payload Boundary & Unicode Stress Testing**:
     - Short URL (`https://qwikly.dev`)
     - Maximum 2048-character link payload
     - Plain text with multi-line newlines (`\n\r`) and leading/trailing indentation
     - Non-ASCII / UTF-8 multi-byte characters (Japanese, Arabic, Cyrillic)
     - Emoji payloads (`🚀✨🔥`) to ensure no character encoding or surrogate pair crashes.

### Step 3: Establish Device & Scanner Verification Protocol
- Provide a clear manual QA protocol covering:
  - iOS Native Camera (iOS 16+)
  - Android Google Lens / Native Camera
  - Third-party barcode scanners (ZXing / Barcode Scanner)
  - Testing under varying brightness and distances.

---

## 4. Verification Commands

All validation commands will be executed to guarantee zero regressions:
```bash
pnpm test
pnpm lint
pnpm tsc --noEmit
pnpm build
```

---

## 5. Explicit Approval Request

In accordance with `AGENTS.md` and Rule 04:
- No application code or dependencies have been modified yet.
- Awaiting explicit user approval to proceed with implementing Step 1, Step 2, and running validation.
