# QR Generator — Custom Logo Upload Implementation Plan

## Objective

Inspect the existing QR Generator codebase and prepare a detailed implementation plan for adding client-side custom logo upload to the existing QR customization interface.

**This is a planning-only task. Do not implement changes or modify any files.**

## 1. Confirmed Product Requirement

Replace the previously removed custom-logo-by-URL functionality with a local image-upload flow.

The required user flow is:

1. User clicks **Upload Logo**.
2. User selects an image from their device.
3. The selected image appears as a logo in the existing QR preview.
4. User downloads the generated QR code in PNG or SVG format.

The logo must be included in the downloaded file.

## 2. Implementation Constraints

- Use client-side image handling only.
- Do not send the uploaded image to a Next.js Route Handler or external service.
- Do not introduce server-side uploads, database storage, or storage dependencies.
- Do not introduce new APIs, Prisma models, or backend changes.
- Do not persist the uploaded logo in local storage or session storage.
- Keep the image in browser memory during the current page session.
- Reuse the existing QR preview, customization state, and export functionality.
- Follow existing project architecture, coding conventions, and AI rules.
- Avoid unnecessary abstractions, dependencies, or unrelated refactoring.
- Preserve all existing QR generation and export behavior when no logo is selected.

## 3. Required Functionality

### A. Logo Upload

- Add an Upload Logo control to the existing QR customization interface.
- Allow selection of supported image formats.
- Validate the file type and size.
- Display a clear error when the selected file is invalid.
- Allow the user to replace or remove the selected logo.

### B. QR Preview

- Display the selected logo in the existing QR preview.
- Preserve the logo's aspect ratio.
- Handle image-loading failures gracefully.
- Ensure other QR customization settings remain unchanged when a logo is uploaded, replaced, or removed.

### C. PNG Export

- Inspect the existing PNG export implementation.
- Determine how to include the uploaded logo in the exported image.
- Ensure export waits for the image to load successfully.
- Ensure the downloaded PNG contains the logo rather than only the underlying QR code.

### D. SVG Export

- Inspect the existing SVG export implementation.
- Ensure the exported SVG contains the logo image itself.
- Use an embedded image representation where appropriate.
- Do not reference temporary browser object URLs, local filesystem paths, or external URLs that may become unavailable.
- Verify that the downloaded SVG remains usable after the page is refreshed or closed.

### E. Image Resource Cleanup

- Clean up temporary browser object URLs when a logo is replaced, removed, or the component unmounts.
- Avoid memory leaks and stale image references.
- Keep the uploaded logo in memory only; do not persist it across page reloads.

### F. QR Scannability

- Inspect the existing QR error-correction and logo-placement behavior.
- Recommend appropriate logo-size or placement constraints if necessary.
- Identify any relevant scanning risks without claiming that successful scanning can be guaranteed.

## 4. Codebase Exploration

Inspect the existing implementation before proposing changes.

Identify the actual files responsible for:

- QR customization and design state.
- The current or previously removed logo-upload functionality.
- QR preview and rendering.
- PNG export.
- SVG export.
- Relevant image validation and existing tests.

Do not assume file paths or create duplicate components without justification.

## 5. Required Report

Return a structured implementation plan containing:

1. Executive summary.
2. Current implementation findings with actual file paths.
3. Proposed logo-upload workflow.
4. File-by-file changes and their responsibilities.
5. Image validation and resource-cleanup strategy.
6. PNG and SVG export implementation approach.
7. Testing and regression-validation plan.
8. Risks, dependencies, and unresolved decisions.
9. Implementation sequence and exit criteria.

For each proposed file change, explain why it is required and whether an existing component or utility can be reused.

## 6. Testing and Exit Criteria

The plan must cover tests for:

- Uploading a valid image.
- Rejecting unsupported or oversized files.
- Displaying the logo in the QR preview.
- Replacing and removing a logo.
- Exporting PNG with the logo included.
- Exporting SVG with the logo embedded.
- Handling image-loading failures.
- Cleaning up temporary resources.
- Preserving existing QR functionality when no logo is selected.

Also include relevant TypeScript, lint, build, and regression checks.

## 7. Mandatory Workflow

Follow the project's established workflow:

1. Explore the codebase.
2. Document current implementation findings.
3. Prepare the implementation plan.
4. Identify affected files and dependencies.
5. Wait for explicit approval.
6. Implement only after approval.
7. Test and review the final diff.

**This task ends after delivering the implementation plan. Do not modify source files, tests, dependencies, configuration, schemas, or documentation. Do not begin implementation without explicit approval.**