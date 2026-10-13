# PR Review Remediation Tasks --- QR Generator

**Status:** Proposed task list for AI agent\
**Purpose:** Address the PR review findings before merge.\
**Execution rule:** Follow `AGENTS.md` and the project's AI workflow.
Inspect first, prepare an implementation plan, and wait for explicit
approval before modifying code.

------------------------------------------------------------------------

## 1. Agent Workflow and Governance

The agent must follow this sequence:

1.  Read `AGENTS.md` and the applicable `.ai/` rules and reviewer
    instructions.
2.  Inspect the PR diff, affected files, existing architecture, schemas,
    dependencies, and tests.
3.  Map each review finding to concrete files and code paths.
    Distinguish confirmed defects from risks that still need
    verification.
4.  Prepare a prioritized implementation plan with proposed changes,
    dependencies, and verification commands.
5.  Wait for explicit approval before implementing.
6.  Implement only the approved scope; do not make unrelated refactors.
7.  Run focused tests, the full available test suite, typecheck, lint,
    build, and any relevant security/accessibility/scannability checks.
8.  Review the final diff and report completed tasks, test results,
    remaining risks, and any items that require a decision.

### Constraints

-   Do not assume every review concern is a confirmed bug; verify it
    against the code.
-   Do not weaken or delete tests merely to get a passing result.
-   Do not add dependencies without checking whether existing
    dependencies can meet the requirement and explaining the trade-off.
-   Preserve current product behavior and backward compatibility unless
    a change is explicitly approved.
-   Do not claim QR scannability is guaranteed. Verify representative
    outputs with an actual decoder.
-   Do not commit or merge unless explicitly instructed.
-   If the repository, PR diff, or a required test tool is unavailable,
    report the limitation rather than inventing results.

------------------------------------------------------------------------

## 2. Priority 0 --- Blocking Risks

### Task P0.1 --- Social and WhatsApp Payload Encoding and Security

**Review concern:** Malformed or incorrectly encoded input could create
broken URLs, truncated messages, or injection risks.

Tasks:

-   [ ] Inspect `SocialForm`, `WhatsAppForm`, related URL builders,
    payload construction, and all sinks that place user-controlled data
    into URLs or HTML.
-   [ ] Centralize URL and query-parameter construction in an
    appropriate existing utility/module where this reduces duplication.
-   [ ] Use `URL` / `URLSearchParams` or `encodeURIComponent`
    appropriately for each context; do not double-encode values.
-   [ ] Keep URL encoding distinct from HTML escaping and sanitization.
    Avoid unsafe HTML injection APIs for user-controlled values.
-   [ ] Verify each supported social platform's expected URL format and
    parameter names.
-   [ ] Add deterministic tests for spaces, `&`, `%`, `+`, emoji,
    diacritics, non-Latin scripts, RTL text, empty strings, and long
    inputs.
-   [ ] Add tests for URL injection attempts, malformed URLs, and
    special characters in each relevant field.
-   [ ] Document any platform-specific message length/truncation
    limitations and apply existing validation conventions.
-   [ ] Record security-review findings and confirm whether each issue
    is fixed or demonstrably not applicable.

**Acceptance criteria:**

-   [ ] User input cannot alter URL structure through unencoded query
    data.
-   [ ] Supported characters survive the URL-building process correctly.
-   [ ] No untrusted input is inserted into HTML unsafely.
-   [ ] Tests cover the supported platform URL patterns and relevant
    edge cases.

### Task P0.2 --- WhatsApp Phone-Number Parsing and Normalization

**Review concern:** Incorrect number handling can produce invalid
WhatsApp links or accept unsupported input.

Tasks:

-   [ ] Trace phone-number input, country selection/defaults,
    validation, normalization, and WhatsApp URL generation.
-   [ ] Determine whether the current code uses a vetted phone-number
    parser and whether it is configured correctly.
-   [ ] If current handling is inadequate, evaluate `libphonenumber-js`
    or another suitable maintained library before proposing a
    dependency.
-   [ ] Define the expected user input contract, including whether users
    must choose a country or supply an international dialing prefix.
-   [ ] Normalize valid numbers into the format required by WhatsApp
    links; do not include formatting characters or extensions in the URL
    phone field.
-   [ ] Reject invalid or ambiguous numbers with clear, actionable UI
    feedback. Do not silently guess a country when the product contract
    does not support that behavior.
-   [ ] Add test vectors across multiple countries, national and
    international formats, leading `+`, spaces, punctuation, missing
    country information, invalid lengths, and extensions.
-   [ ] Verify the resulting URL uses the expected phone-number
    representation.
-   [ ] Determine whether server-side validation is applicable to actual
    backend flows; do not add a backend solely for this client-side
    feature.

**Acceptance criteria:**

-   [ ] Valid numbers are normalized according to the documented input
    contract.
-   [ ] Invalid or ambiguous numbers are rejected with clear feedback.
-   [ ] Tests cover representative international formats and edge cases.
-   [ ] Any new dependency is justified and approved.

### Task P0.3 --- QR Scannability, Contrast, and Error Correction

**Review concern:** Design options and error-correction changes may
create QR codes that are difficult or impossible to scan.

Tasks:

-   [ ] Inspect the QR design schema, validation rules, QR renderer
    configuration, color controls, error-correction settings, quiet-zone
    handling, and logo/overlay behavior.
-   [ ] Identify supported design combinations and any constraints
    already enforced by the application.
-   [ ] Add integration tests that generate actual QR images for
    representative valid combinations, including default and non-default
    foreground/background colors and each supported error-correction
    level.
-   [ ] Use an available QR decoder (for example, ZXing or another
    maintained decoder) to decode generated output and assert that the
    decoded payload exactly matches the source payload.
-   [ ] Include representative payload types and special characters
    where appropriate.
-   [ ] Test high-risk combinations such as low contrast,
    transparent/colored backgrounds, logo overlays, and styling options
    that may obscure modules.
-   [ ] Where practical, measure contrast and reject or warn about
    combinations that violate documented minimum requirements. Do not
    rely on contrast alone as proof of scannability.
-   [ ] Confirm the quiet zone and error-correction configuration are
    preserved in generated output.
-   [ ] Document limitations and the test environment/decoder version.
-   [ ] If the decoder tool is unavailable in CI, propose a reproducible
    setup and clearly separate automated coverage from manual
    verification.

**Acceptance criteria:**

-   [ ] Representative generated QR files decode to the exact original
    payload.
-   [ ] Tests cover the supported error-correction levels and
    representative design options.
-   [ ] Known unsafe combinations are rejected, constrained, or clearly
    warned about according to the approved product behavior.
-   [ ] No claim of universal scan reliability is made.

### Task P0.4 --- QR Design Schema Compatibility and Migration

**Review concern:** Schema or payload-shape changes could break older
saved configurations or consumers.

Tasks:

-   [ ] Determine whether the QR design schema is persisted, transmitted
    through APIs, stored in browser storage, or consumed by other
    modules.
-   [ ] Identify any changed fields, required properties, enum values,
    defaults, and serialized shapes introduced by the PR.
-   [ ] Trace all consumers and existing data sources for compatibility
    risks.
-   [ ] If compatibility is needed, define explicit defaults and safe
    parsing for older/missing fields.
-   [ ] Add schema versioning or a migration only if justified by the
    actual persistence/contract requirements.
-   [ ] Add tests for legacy/minimal configurations, current
    configurations, invalid values, and migration behavior if a
    migration is required.
-   [ ] Document any unavoidable breaking change and obtain approval
    before implementing it.

**Acceptance criteria:**

-   [ ] Existing saved data and consumers remain compatible, or a
    documented and tested migration is provided.
-   [ ] Missing optional design values receive safe, consistent
    defaults.
-   [ ] Schema changes and compatibility assumptions are documented.

------------------------------------------------------------------------

## 3. Priority 1 --- Quality and UX Risks

### Task P1.1 --- Test Reliability and Coverage

Tasks:

-   [ ] Inspect new and modified tests for timing dependence,
    browser-pixel brittleness, network calls, environment assumptions,
    and nondeterministic fixtures.
-   [ ] Make tests deterministic and isolate external services.
-   [ ] Use stable fixtures and deterministic seeds where randomness is
    necessary.
-   [ ] Avoid real network dependencies in ordinary unit tests.
-   [ ] Run the relevant test suite repeatedly to identify flaky
    failures.
-   [ ] Fix flaky tests without reducing meaningful coverage.
-   [ ] Run the full CI-equivalent checks available in the repository
    and record exact commands/results.

**Acceptance criteria:**

-   [ ] Tests are deterministic under the project's supported test
    environment.
-   [ ] Repeated runs do not reveal unexplained failures.
-   [ ] Full available test suite and quality checks pass, or remaining
    failures are clearly reported.

### Task P1.2 --- Internationalization and Message Lengths

Tasks:

-   [ ] Add or verify tests for emoji, accented characters, non-Latin
    scripts, RTL text, plus signs, ampersands, percent signs, and long
    messages.
-   [ ] Confirm correct encoding for each supported platform's URL
    format.
-   [ ] Verify that length limits or platform-side truncation are
    handled or documented.
-   [ ] Provide validation or a clear warning if the product's own
    constraints are exceeded.
-   [ ] Ensure validation messages remain understandable for invalid
    input.

**Acceptance criteria:**

-   [ ] Supported international text is encoded correctly.
-   [ ] Length limitations are explicit rather than silently ignored
    where they can be detected.
-   [ ] No unsupported localization framework or unrelated UI change is
    introduced.

### Task P1.3 --- Accessibility and UX Review

Tasks:

-   [ ] Inspect labels, accessible names, descriptions, error
    associations, focus order, keyboard operation, and visible focus
    states for the affected forms and QR design controls.
-   [ ] Run an available automated accessibility checker, such as axe,
    or the repository's existing equivalent.
-   [ ] Run Lighthouse accessibility checks if supported by the project
    environment.
-   [ ] Manually verify keyboard navigation and focus behavior.
-   [ ] Check contrast for text, form controls, errors, and focus
    indicators. Treat QR-code color contrast as a separate scannability
    concern.
-   [ ] Fix accessibility-critical issues in the approved scope and
    report non-blocking issues.

**Acceptance criteria:**

-   [ ] Critical form controls have accessible names and usable keyboard
    interaction.
-   [ ] Validation errors are communicated accessibly.
-   [ ] Accessibility checks and manual review results are recorded.

### Task P1.4 --- Client Bundle Size and Rendering Performance

Tasks:

-   [ ] Inspect dependencies added or changed by the PR and estimate
    their client bundle impact using the project's available
    build/analyze tooling.
-   [ ] Check whether phone-number parsing or QR generation libraries
    are unnecessarily included in unrelated routes or initial bundles.
-   [ ] Consider lazy-loading heavy modules only if it fits the existing
    architecture and measurably benefits loading or interaction.
-   [ ] Inspect repeated QR generation and expensive render paths for
    avoidable work.
-   [ ] Apply memoization only when justified by measured or clearly
    identifiable repeated computation; avoid premature optimization.
-   [ ] Record before/after bundle information when the tooling makes it
    available.

**Acceptance criteria:**

-   [ ] No clearly unnecessary dependency or heavy module is introduced.
-   [ ] Any material bundle/performance regression is addressed or
    explicitly justified.
-   [ ] No unrelated architectural change is made.

------------------------------------------------------------------------

## 4. Priority 2 --- Non-Blocking Follow-Ups

### Task P2.1 --- Visual and Styling Regression Review

-   [ ] Run the existing visual regression or Storybook checks if
    available.
-   [ ] Inspect the new/modified forms and QR design controls at
    supported viewport sizes.
-   [ ] Check layout, spacing, responsive behavior, and disabled/error
    states.
-   [ ] Fix visible regressions introduced by the PR.
-   [ ] Record low-impact issues that are safe to track separately.

### Task P2.2 --- Linting, Formatting, and Minor Test Quality

-   [ ] Run the repository's configured linter and formatter checks.
-   [ ] Correct relevant lint/format issues in changed files.
-   [ ] Review assertions for meaningful behavioral coverage rather than
    implementation-only details.
-   [ ] Do not make unrelated style-only edits outside the approved
    scope.

### Task P2.3 --- Rare Locale and Browser Edge Cases

-   [ ] Identify any supported-browser or locale edge cases discovered
    during review.
-   [ ] Reproduce and fix issues that affect supported usage or
    security.
-   [ ] Add non-critical, low-frequency issues to the existing issue
    tracker/backlog if appropriate.
-   [ ] Do not claim compatibility with untested browsers or locales.

------------------------------------------------------------------------

## 5. Cross-Cutting Verification

After approved changes are implemented:

-   [ ] Run focused tests for social URL construction and WhatsApp phone
    parsing.
-   [ ] Run QR generation/scannability integration tests using actual
    generated files and a decoder.
-   [ ] Run schema compatibility/migration tests as applicable.
-   [ ] Run the full unit/integration test suite.
-   [ ] Run TypeScript typecheck.
-   [ ] Run lint and formatting checks.
-   [ ] Run the production build.
-   [ ] Run automated accessibility checks where available.
-   [ ] Review bundle-size output if available.
-   [ ] Inspect `git diff --check`, `git status`, and the complete final
    diff.
-   [ ] Confirm no unrelated files or business logic changed.
-   [ ] Repeat relevant test runs to check reliability.

Do not report a check as passing unless the agent actually ran it and
observed a successful result. If tooling is missing, report that
explicitly.

------------------------------------------------------------------------

## 6. Merge-Blocking Checklist

The agent must report each item as **Pass**, **Fail**, **Not applicable
(with reason)**, or **Blocked (with reason)**.

-   [ ] CI-equivalent unit and integration tests are green.
-   [ ] Social and WhatsApp input encoding/security review is complete.
-   [ ] Phone-number parsing/normalization is vetted and covered by test
    vectors.
-   [ ] Representative QR scannability integration tests pass using an
    actual decoder.
-   [ ] QR design schema compatibility/migration requirements are
    resolved and documented.
-   [ ] Typecheck, lint, and production build pass.
-   [ ] No unresolved high-severity security or data-compatibility issue
    remains.

Do not recommend merging while a confirmed high-risk item remains
unresolved. If a blocker cannot be resolved because of missing
infrastructure or a product decision, report it explicitly and do not
mark it as passed.

------------------------------------------------------------------------

## 7. Final Agent Report

After implementation and verification, provide:

1.  **Summary** --- what was fixed and why.
2.  **Findings** --- which review risks were confirmed, not applicable,
    or disproven by inspection.
3.  **Files changed** --- file path, change, and purpose.
4.  **Dependencies** --- additions/removals and justification.
5.  **Tests and commands** --- exact commands and actual outcomes.
6.  **Scannability evidence** --- decoder/tool used, representative
    cases, and results.
7.  **Security and compatibility** --- encoding review, phone-number
    behavior, and schema/migration decisions.
8.  **Accessibility and performance** --- checks performed and findings.
9.  **Remaining risks** --- blockers and follow-up items, clearly
    separated.
10. **Final diff review** --- confirm that only approved, relevant
    changes were made.

**Final instruction:** This file is a task plan. Inspect first and wait
for explicit approval before editing project files. Do not commit or
merge without explicit instruction.
