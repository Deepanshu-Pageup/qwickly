# Sub-phase 2.7 --- Export and Logo Preview Corrections

## AI Agent Implementation Plan

**Status:** Proposed --- awaiting approval\
**Scope:** Review and correct the existing PNG, SVG, and PDF export
implementation; investigate and fix the PNG logo URL preview issue.\
**Execution rule:** Do not modify code until this correction plan is
explicitly approved.

------------------------------------------------------------------------

## 1. Context

The first implementation of Sub-phase 2.7 added a singleton file
service, export actions, PNG/SVG/PDF generation, and tests. The
implementation report stated that the existing test suite, TypeScript
typecheck, and lint checks passed.

Two follow-up corrections are now requested:

1.  Evaluate replacing custom file-generation and download mechanics
    with suitable third-party libraries where they provide a clear
    reliability or maintenance benefit.
2.  Investigate why adding a PNG logo URL does not make the logo appear
    in the QR preview, and fix the root cause.

This is a focused correction to the existing implementation, not a
redesign or rewrite of the QR Generator.

## 2. Governance and AI Agent Workflow

Follow the project workflow:

1.  Explore the current codebase and applicable `AGENTS.md` / `.ai`
    rules.
2.  Inspect the current implementation, dependency versions, and Git
    diff.
3.  Reproduce and diagnose the logo-preview issue.
4.  Prepare or refine a concrete implementation plan and identify any
    proposed dependency changes.
5.  Wait for explicit approval.
6.  Implement only the approved changes.
7.  Run automated checks and manual verification.
8.  Review the final diff and report changed files, checks, results, and
    known limitations.

### Constraints

-   Do not change code before approval of this correction plan.
-   Do not interrupt or overwrite unrelated work in progress. Start only
    after the current agent's work is complete and its final diff is
    available.
-   Do not discard the current implementation without evaluating it.
-   Do not add dependencies until the existing QR library, installed
    packages, and project conventions have been inspected.
-   Do not change QR payload/business logic, routing, persistence, or
    unrelated UI.
-   Preserve `src/lib/file-service/` and its singleton/public
    named-export API unless inspection proves a change is necessary and
    it is approved.
-   Keep client-only browser APIs out of
    server-render/module-initialization paths.
-   Do not claim universal QR scannability; verify representative output
    using real files and scanners.

## 3. Phase A --- Inspect the Existing Implementation

Inspect at minimum:

-   `src/lib/file-service/file-service.ts`
-   `src/lib/file-service/file-service.types.ts`
-   `src/lib/file-service/index.ts`
-   `src/components/studio/export-actions.tsx`
-   `src/app/page.tsx`
-   `tests/studio/file-service.test.ts`
-   QR preview, logo input/configuration, design settings, and
    QR-generation components/modules
-   `package.json` and the relevant lockfile
-   Project instructions in `AGENTS.md` and applicable `.ai/` files

Confirm:

-   Which QR-generation library is installed and which output formats it
    supports.
-   How the preview receives the current payload, design settings, and
    logo configuration.
-   Whether export code regenerates the QR from the same source of truth
    as the preview.
-   Whether custom PDF generation and download handling have edge cases
    not covered by the current tests.
-   Whether a PDF or download library already exists in the dependency
    tree.
-   Whether the working tree contains unrelated changes that must be
    preserved.

Do not assume paths, APIs, or dependency versions; verify them in the
repository.

## 4. Phase B --- Library-Based Export Review

### 4.1 General approach

Retain the `FileService` singleton as the stable application-facing API.
UI components should continue to call methods such as:

-   `fileService.exportPNG(...)`
-   `fileService.exportSVG(...)`
-   `fileService.exportPDF(...)`

Components should not need to know how files are generated or
downloaded.

Prefer established libraries for generation or downloading when they
demonstrably reduce custom code and satisfy the current design
requirements. Reuse installed dependencies where practical. Do not add a
library merely to replace a few safe lines of code.

### 4.2 PNG generation

-   Check whether the existing QR library can generate PNG output
    directly at a requested resolution.
-   Compare its capabilities with the current canvas-based
    rasterization.
-   Preserve the current payload, foreground/background colors,
    error-correction level, quiet zone, and supported logo styling.
-   Preserve sufficient output resolution and avoid unintended
    low-resolution upscaling.
-   Retain canvas rendering if it is the most reliable compatible path
    for required design features; document the reason.

### 4.3 SVG generation

-   Check whether the existing QR library provides native SVG output.
-   Prefer native SVG generation if it preserves the supported design
    settings and logo treatment.
-   Verify the SVG namespace, dimensions/viewBox, quiet zone, and
    rendering in common viewers.
-   If the logo is embedded in SVG, verify that the result is
    self-contained where possible and that it renders correctly.
-   Avoid custom SVG construction only where the library's output meets
    requirements. Do not sacrifice required functionality for library
    usage alone.

### 4.4 PDF generation

-   Review the current hand-built PDF 1.4 implementation, including
    binary content, object offsets, cross-reference table, trailer,
    image embedding, and error handling.
-   Evaluate an established PDF library such as `jsPDF`, unless a
    suitable library is already installed.
-   Prefer a maintained library over manual PDF serialization if it can
    produce a valid PDF and preserve the QR design.
-   Default to A4 unless the existing application already defines a
    print-size convention.
-   Center the QR code, preserve aspect ratio and quiet zone, and
    provide sufficient effective resolution for printing.
-   Prefer vector embedding if supported reliably; otherwise use a
    sufficiently high-resolution raster image.
-   Verify logo rendering and color preservation in the resulting PDF.

### 4.5 Download handling

-   Evaluate `file-saver` or an existing project utility for consistent
    browser downloads.
-   Check whether it is necessary for the supported browsers and current
    download flow; do not add it if native download handling is already
    small, reliable, and sufficient.
-   Ensure filenames and MIME types match the actual content:
    -   `qr-code.png`
    -   `qr-code.svg`
    -   `qr-code.pdf`
-   Ensure temporary resources are cleaned up where applicable.
-   Prevent a failed generation from triggering an empty or misleading
    download.

### 4.6 Dependency decision gate

Before adding or replacing dependencies, document:

-   Existing library and version.
-   Candidate library and version, if needed.
-   Exact functionality it will replace.
-   Browser/client compatibility.
-   Logo and styling compatibility.
-   Bundle-size and maintenance implications, to the extent reasonably
    assessable.
-   Tests needed to demonstrate equivalent or improved behavior.

Add only dependencies that are justified by the findings and approved.
Update the lockfile using the project's package manager and existing
conventions.

## 5. Phase C --- Diagnose the PNG Logo URL Preview Bug

### 5.1 Reproduce the problem

Using the existing UI and source of truth:

1.  Open the QR customization/preview interface.
2.  Enter a valid, publicly accessible PNG image URL in the logo field.
3.  Observe whether the URL is stored and whether the preview updates.
4.  Change the URL to another valid image and confirm whether the
    preview changes.
5.  Try a deliberately invalid or inaccessible URL to observe error
    handling.
6.  Record the actual behavior and the reproducible root cause before
    changing code.

The previously shared Jumpshare link returned "File Not Found" when
checked, so it does not establish the exact failure. Reproduce the issue
using the application's actual logo input and a known-valid PNG URL.

### 5.2 Inspect the full data flow

Trace the logo from input to preview and export:

-   Logo URL input and validation.
-   State/configuration update.
-   Prop or state flow into the QR preview component.
-   Image loading and rendering.
-   QR generation/renderer options for the logo.
-   Any derived or memoized preview state.
-   Error/loading handling.
-   Logo handling in PNG, SVG, and PDF export paths.

Compare the preview's configuration with the configuration passed to
`FileService`. Check for mismatched property names, stale state, missing
updates, invalid URL assumptions, or preview renderers that do not
support the supplied logo format.

### 5.3 Investigate likely failure categories

Investigate rather than assume any one cause:

-   URL does not resolve to an image or returns an HTML/error page
    instead of PNG data.
-   URL requires authentication, expires, redirects unexpectedly, or is
    inaccessible from the browser.
-   Browser CORS restrictions affect canvas or image processing.
-   Image loading is asynchronous but the preview renders before the
    image is ready.
-   State updates or memoization prevent the preview from refreshing.
-   The preview renderer does not support URL-based logos or expects a
    different data format.
-   Logo dimensions, transparency, or positioning cause the logo to be
    invisible.
-   Export and preview paths interpret logo configuration differently.

Do not bypass browser security or introduce a proxy/server route without
a demonstrated need and separate approval.

### 5.4 Fix requirements

Implement the smallest root-cause fix that follows the existing
architecture:

-   A valid supported PNG URL should load and appear in the QR preview.
-   Updating or removing the logo should update the preview without
    requiring a page reload.
-   Loading and failure states should be understandable and should not
    break the QR preview.
-   Invalid URLs, non-image responses, or unsupported image formats
    should fail gracefully.
-   Do not expose internal errors or stack traces in the UI.
-   Avoid introducing a new image-upload or asset-storage system.
-   Keep the current logo configuration contract unless a necessary
    change is justified and approved.
-   Preserve existing supported logo styling, dimensions, and
    positioning.

If the browser cannot access a particular external image because of that
host's policy or authentication, explain the limitation clearly rather
than promising every URL will work.

## 6. Phase D --- Preview and Export Consistency

The preview and export paths should use the same current QR payload and
supported design configuration.

Verify consistency for:

-   QR payload/type.
-   Foreground and background colors.
-   Error-correction level.
-   Quiet zone/margin.
-   Logo URL or supported logo source.
-   Logo size and placement.
-   Other design options that are currently supported.

Do not silently remove the logo from one output format. If a particular
renderer cannot support a design feature faithfully, document that
limitation and propose the smallest compatible approach before changing
behavior.

## 7. Testing Plan

### 7.1 Automated tests

Extend existing tests using the repository's current test framework.

Cover:

-   `FileService` singleton behavior and public exports remain stable.
-   PNG, SVG, and PDF generation succeeds for valid input.
-   Filenames, MIME types, and format content are correct.
-   Empty/invalid payloads and unsupported states are handled.
-   Generation/download failures do not create misleading downloads.
-   The selected design configuration reaches each format generator.
-   PDF output is valid using an appropriate parser or independent
    validation mechanism, not only string assertions.
-   SVG output is valid and has the expected dimensions/viewBox and logo
    treatment.
-   PNG output is a valid image with expected dimensions.
-   Valid logo URL state reaches the preview renderer.
-   Changing/removing the logo updates the preview configuration.
-   Invalid or failed logo loading is handled without breaking the rest
    of the preview.
-   Any async image-loading behavior is tested deterministically.
-   Browser-only code does not run during server-side rendering.

Mocking is useful for unit tests, but mocked tests alone do not prove
that downloaded files are valid or scannable.

### 7.2 Manual verification

Test actual downloaded files using a representative payload and
non-default design settings.

**PNG** - Open the file and verify resolution, colors, QR pattern, quiet
zone, and logo. - Scan the downloaded file.

**SVG** - Open the file in a viewer/editor, inspect scaling, and verify
the logo renders. - Scan a rendered copy at a practical size.

**PDF** - Open the PDF and verify it is valid, uses the expected page
size, and does not crop or distort the QR code. - Confirm the logo
renders and the QR remains readable. - Scan the QR from the rendered or
printed document at a practical size.

**Logo preview** - Test a known-valid public PNG URL. - Test changing
the logo URL. - Test removing the logo. - Test a broken URL and an
inaccessible URL. - Test a transparent PNG if supported. - Confirm the
preview updates without reloading the page.

Record any scan failures. A successful test demonstrates behavior for
the tested file, design, and scanner; it does not guarantee universal
scannability.

## 8. Regression and Quality Checks

Run the project's applicable checks, using its existing scripts and
package manager:

-   Relevant unit/component tests.
-   Full test suite.
-   TypeScript typecheck.
-   Lint.
-   Production build.
-   Git diff and changed-file audit.

The prior implementation report stated that 91 tests across 33 suites
passed, TypeScript had no errors, and lint had no errors or warnings.
Re-run the relevant checks after the correction; do not treat previous
results as proof that the revised code passes.

Confirm that no unrelated business logic, page flows, or project
architecture changed.

## 9. Acceptance Criteria

### Export corrections

-   [ ] `FileService` remains the shared singleton API with named
    exports.
-   [ ] Library selection is based on repository inspection and
    justified capability, not preference alone.
-   [ ] PNG, SVG, and PDF still download successfully.
-   [ ] All formats preserve the current payload and supported design
    settings.
-   [ ] PDF is valid and print-ready, with proportional placement and
    suitable resolution.
-   [ ] SVG is valid and scalable.
-   [ ] Filenames, MIME types, errors, and cleanup behavior are correct.
-   [ ] No unnecessary dependency was added.

### Logo preview correction

-   [ ] The root cause has been reproduced and documented.
-   [ ] A valid supported PNG URL appears in the live preview.
-   [ ] Changing/removing the logo updates the preview correctly.
-   [ ] Invalid or inaccessible URLs fail gracefully.
-   [ ] Preview and exports use consistent current logo/design
    configuration.
-   [ ] Logo behavior is verified in PNG, SVG, and PDF where supported.
-   [ ] Automated regression tests cover the issue.

### Final quality

-   [ ] Relevant tests, typecheck, lint, and build pass.
-   [ ] Actual exported files have been inspected and scan-tested.
-   [ ] Final diff contains only approved, relevant changes.
-   [ ] Final report lists files changed, dependency decisions, checks
    and results, and known limitations.

## 10. Out of Scope

Unless separately approved, do not:

-   Redesign the QR generator or customization UI.
-   Change QR payload semantics or business logic.
-   Add backend upload/proxy routes or persistent logo storage.
-   Introduce user accounts, history, or analytics changes.
-   Add bulk export or ZIP downloads.
-   Perform unrelated refactors or dependency upgrades.
-   Promise that every external image URL will work regardless of its
    host's access policies.
-   Promise guaranteed QR scannability.

## 11. Implementation Sequence After Approval

1.  Wait for the current implementation work to finish and inspect its
    final diff.
2.  Inspect the QR library, export implementation, dependencies, logo
    input, and preview data flow.
3.  Reproduce and document the logo URL preview failure.
4.  Finalize dependency decisions for QR output, PDF generation, and
    downloading.
5.  Implement only the approved library-based improvements and
    root-cause logo fix.
6.  Add regression tests for export behavior and logo preview behavior.
7.  Run automated checks and inspect actual downloaded files.
8.  Perform scan tests on representative outputs.
9.  Review the final diff and report outcomes and limitations.

**Approval gate:** This is a correction plan only. Do not modify project
files until the user explicitly approves it.
