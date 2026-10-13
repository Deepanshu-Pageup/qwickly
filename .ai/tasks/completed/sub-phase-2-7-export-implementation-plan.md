# Sub-phase 2.7 --- PNG, SVG, and PDF Export

## AI Agent Implementation Plan

**Status:** Proposed --- awaiting approval\
**Scope:** QR code file exports\
**Execution rule:** Plan first; do not modify code until this plan is
explicitly approved.

------------------------------------------------------------------------

## 1. Objective

Implement reliable downloads for the currently configured QR code in
three formats:

-   **PNG** --- raster image for common digital use.
-   **SVG** --- scalable vector image.
-   **PDF** --- print-ready document containing the QR code.

All three formats must reflect the current QR payload and supported
design settings. Export must use the existing QR generation and
customization flow rather than creating a separate QR-generation
implementation.

## 2. Project Governance and Agent Workflow

Follow the project's established workflow:

1.  Explore the existing implementation and relevant project rules.
2.  Compare the current code with this approved scope and identify the
    smallest required changes.
3.  Present the implementation plan for approval.
4.  Implement only after explicit approval.
5.  Run relevant automated checks and manual verification.
6.  Review the final diff for scope, regressions, and unintended
    changes.
7.  Report changed files, commands/checks run, results, and any
    limitations.

### Governance constraints

-   Do not implement before approval.
-   Do not change unrelated features or business logic.
-   Do not introduce a new architecture, monorepo, or separate backend.
-   Do not add dependencies until existing packages and capabilities
    have been checked. If an additional package is necessary, explain
    why in the plan or request approval before adding it.
-   Keep the current project conventions, naming, validation, error
    handling, and styling patterns.
-   Do not duplicate QR payload construction or design state.
-   Do not claim that QR scannability can be guaranteed; verify it with
    tests.

## 3. Proposed File Structure

Create a dedicated file-service folder under the existing `src/lib/`
directory. Adapt only if the audited repository uses a different
established source alias or directory convention.

``` text
src/
└── lib/
    └── file-service/
        ├── file-service.ts
        ├── file-service.types.ts
        └── index.ts
```

### Responsibilities

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `file-service.ts`                   Singleton service and export
                                      operations for PNG, SVG, and PDF;
                                      shared validation and download
                                      helpers where appropriate.

  `file-service.types.ts`             Types for export formats, options,
                                      and any structured export
                                      errors/results needed by the
                                      existing conventions.

  `index.ts`                          Public named exports for the
                                      singleton and public types.
  -----------------------------------------------------------------------

Before creating these files, confirm that equivalent files or a suitable
existing service do not already exist. Avoid duplicate abstractions.

## 4. Singleton and Runtime Boundaries

-   Implement a class with a private constructor and a static
    `getInstance()` method.
-   Export one shared instance as a named export, such as `fileService`.
-   Consumers must call the shared instance rather than instantiate the
    class themselves.
-   Keep browser-only APIs and download operations on the client side.
-   Do not execute `document`, `URL.createObjectURL`, canvas APIs, or
    other browser-only operations during server rendering or module
    initialization.
-   Do not add an API route or database persistence for these
    client-side downloads unless the existing architecture or library
    demonstrably requires it.
-   Remember that a singleton is scoped to its JavaScript runtime; it
    does not imply one instance across browser tabs or server processes.

## 5. Public Export API

Use clear, consistently named methods. Proposed names:

-   `exportPNG(...)`
-   `exportSVG(...)`
-   `exportPDF(...)`

The final signatures must fit the existing QR preview/generator API and
TypeScript conventions. Avoid designing a second source of truth for the
QR content or design settings.

### Input requirements

Each export operation should receive or access the current QR output and
the configuration needed to reproduce the visible design. Reuse the
existing QR generator's source of truth, including the current payload,
colors, dimensions, error-correction settings, and supported styling
options.

The service must not silently fall back to stale settings or export a
different QR configuration than the current preview.

## 6. PNG Export Requirements

-   Generate a PNG from the current QR configuration.
-   Use sufficient output resolution for common digital use and the
    existing product's supported size settings.
-   Preserve the QR pattern, colors, and supported design options.
-   Preserve a suitable quiet zone/margin when the current QR
    implementation supports it.
-   Download using a predictable filename, defaulting to `qr-code.png`.
-   Ensure the downloaded content is a valid PNG with the correct
    extension and MIME type.
-   Avoid upscaling a low-resolution preview when the existing QR
    library can render directly at a higher resolution.

Do not promise universal scan reliability. Output quality, contrast,
size, and styling affect scan results.

## 7. SVG Export Requirements

-   Generate a valid SVG from the current QR configuration.
-   Prefer the existing QR library's native SVG output if it supports
    the required design settings.
-   Preserve the QR pattern, colors, supported styling, and quiet
    zone/margin.
-   Include the necessary SVG namespace and sizing/viewBox information
    so the file is scalable and renders in common SVG viewers.
-   Download using a predictable filename, defaulting to `qr-code.svg`.
-   Use the correct SVG MIME type and file extension.
-   Do not export a screenshot or embed a raster preview when genuine
    vector output is supported by the existing implementation.

If any design feature cannot be represented faithfully in SVG, document
the limitation rather than silently changing the design.

## 8. PDF Export Requirements

-   Generate a PDF containing the current QR code only; do not capture
    the entire application UI.
-   Use A4 as the initial default page size unless the existing product
    already defines a print-size convention.
-   Center the QR code on the page with appropriate whitespace and
    preserve its aspect ratio.
-   Preserve sufficient effective resolution for printing. Prefer
    embedding vector QR content when the selected PDF implementation
    supports it; otherwise use an appropriately high-resolution raster
    representation.
-   Preserve the current QR pattern, colors, and supported styling.
-   Download using a predictable filename, defaulting to `qr-code.pdf`.
-   Produce a valid PDF with the correct extension and MIME type.
-   Ensure the PDF does not distort the QR code or crop its quiet zone.
-   Check whether an existing dependency can produce the required PDF
    output before proposing a new dependency.

PDF is a document format, while SVG is a vector image format. They are
separate export targets and should be tested separately.

## 9. Filename and Download Behavior

-   Use predictable defaults: `qr-code.png`, `qr-code.svg`, and
    `qr-code.pdf`.
-   If the application already has a filename convention, reuse it
    consistently across formats.
-   Keep the extension aligned with the actual file content and MIME
    type.
-   Use browser download mechanisms only in a client-side execution
    path.
-   Release temporary object URLs after their use when applicable.
-   Ensure failed generation does not trigger a misleading or empty
    download.
-   Do not add hidden persistence or upload generated files to a server.

## 10. Validation and Error Handling

Before exporting:

-   Confirm QR content exists and is valid according to existing
    validation rules.
-   Confirm the requested format is supported.
-   Confirm required configuration and generated output are available.
-   Avoid exporting stale or incomplete output while generation is in
    progress.

On failure:

-   Return or throw errors in a way consistent with existing project
    conventions.
-   Show a concise, user-friendly error through the application's
    existing notification/error UI.
-   Do not expose stack traces or internal implementation details to
    users.
-   Avoid duplicate error notifications if both the service and caller
    handle the same failure.
-   Keep the existing QR preview usable if an export fails.
-   Ensure loading/disabled states are restored after both success and
    failure.

Do not introduce a new notification library or global error-handling
system for this sub-phase.

## 11. UI Integration

-   Integrate export actions into the existing QR preview/customization
    experience.
-   Provide separate, clearly labelled actions for **PNG**, **SVG**, and
    **PDF**.
-   Reuse the existing component library and design conventions.
-   Keep controls disabled or otherwise safely handled when content is
    empty, invalid, or not yet ready.
-   Make the currently selected design the single source of truth for
    all exports.
-   Provide appropriate progress or disabled feedback if an export is
    asynchronous.
-   Keep the scope limited to export actions; do not redesign the
    broader QR interface.

The agent must identify the actual preview and customization components
during implementation rather than inventing component paths in advance.

## 12. Testing and Verification Plan

### Automated checks

Add or update tests according to the existing test framework and
conventions.

Verify:

-   The singleton accessor returns the same instance within the runtime.
-   Each supported export method handles valid input.
-   Empty or invalid content is rejected safely.
-   Unsupported formats and generation failures are handled correctly.
-   Filenames, extensions, and MIME types are correct.
-   Current configuration is passed to the output-generation path.
-   Temporary browser resources are cleaned up where applicable.
-   Existing tests, type checks, linting, and build checks continue to
    pass.

Mock browser APIs or generation libraries where appropriate; do not
treat mocked tests as proof that files are valid or scannable.

### Manual file verification

For each format:

**PNG** - Download the file. - Open it in an image viewer. - Verify its
dimensions, colors, QR pattern, and quiet zone. - Scan the downloaded
file from a supported scanner/device.

**SVG** - Download the file. - Confirm that it opens in an SVG-capable
viewer or editor. - Validate its SVG structure and viewBox/sizing. -
Scale it up and down to confirm vector rendering. - Scan a rendered copy
at a practical size.

**PDF** - Download and open the PDF. - Confirm it is a valid PDF with
the expected page size. - Verify the QR is centered, proportional,
uncropped, and readable. - Scan the QR code from the rendered or printed
document at a practical size.

Use a representative payload and a non-default design configuration to
confirm that export preserves selected settings. Also test empty content
and a simulated export failure.

### Scan-test limitations

Scan testing demonstrates results for the tested payload, design,
renderer, size, and scanner. It does not guarantee that every exported
QR code will scan under all conditions. Record any failures and correct
them before reporting acceptance.

## 13. Acceptance Criteria

Sub-phase 2.7 is complete when:

-   [ ] PNG, SVG, and PDF are available as separate export actions.
-   [ ] All three files download successfully with predictable filenames
    and correct formats.
-   [ ] Exported output reflects the current payload and supported
    design settings.
-   [ ] PNG resolution is appropriate for intended use.
-   [ ] SVG is valid and scales correctly.
-   [ ] PDF is valid, defaults to A4 unless existing conventions dictate
    otherwise, and contains a properly proportioned QR code.
-   [ ] Empty content, unsupported states, and export failures are
    handled gracefully.
-   [ ] Automated checks pass, including relevant existing regression
    tests.
-   [ ] Actual downloaded files are inspected and scan-tested.
-   [ ] No unrelated business logic or project architecture was changed.
-   [ ] The final diff has been reviewed and the implementation report
    identifies files changed, checks run, results, and known
    limitations.

## 14. Explicitly Out of Scope

Unless separately approved, do not include:

-   QR payload or business-logic redesign.
-   Changes to QR generation semantics or the existing preview
    architecture.
-   Backend routes, file uploads, or database storage for exported
    files.
-   New user accounts, history, or analytics behavior.
-   Bulk export, ZIP downloads, or batch processing.
-   New export customization screens beyond what is required to expose
    the three formats.
-   Unrelated dependency upgrades, refactors, or UI redesign.

## 15. Implementation Sequence After Approval

1.  Inspect existing QR generation, preview, design configuration,
    dependencies, and UI conventions.
2.  Confirm the exact source of truth and the best available output
    mechanism for PNG, SVG, and PDF.
3.  Implement the singleton file service and public exports.
4.  Integrate the three export actions into the existing UI.
5.  Add validation, error handling, and automated tests.
6.  Run tests, type checking, linting, and build checks supported by the
    project.
7.  Perform manual file inspection and scan tests.
8.  Review the final diff and report results.

**Approval gate:** This document defines the proposed implementation. Do
not modify project files until the user explicitly approves the plan.
