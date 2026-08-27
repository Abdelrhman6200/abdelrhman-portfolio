# PRD Workflow Accessibility Acceptance

The canonical PRD workflows use the application’s existing keyboard-accessible buttons, visible focus treatment, semantic labels, and persistent error feedback. This acceptance record defines the validation protocol for the packaged Windows build.

| Workflow | Implemented accessibility state | Acceptance check |
|---|---|---|
| Canonical record tables | Every row retains an explicit **View record** control; analyst-history edit and delete controls are disabled and labelled as read-only evidence records. | Use `Tab` and `Shift+Tab` to reach the view action, then press `Enter` to open the evidence-first drawer. Confirm disabled controls cannot receive an actionable mutation. |
| Evidence-first drawers | Detail drawers have descriptive `aria-label` values and explicit close buttons. Transcript quotations, limitations, provenance, and safe-failure messages remain text content rather than color-only signals. | With Narrator or NVDA, confirm the drawer name, close control, section headings, quotations, and safe-failure limitation text are announced in order. |
| Dataset profile and commit | Profile and commit actions are native buttons with disabled states while a workflow is running or not eligible to commit. Mapping, duplicate count, and required-field count are written as text. | Verify focus reaches profile before commit. Confirm a profile with missing fields cannot enable an inappropriate commit action. |
| Evaluation preparation and calibration | The create action requests only session and rubric IDs; calibration actions state whether the record can be approved or returned. Evidence excerpts are rendered as quotations with source identifiers. | Use the keyboard to prepare and then open an evaluation. Confirm quoted transcript evidence and the absence of opaque scores are announced. |
| Grounded analyst | The question-and-scope dialog is the only creation surface. Result records are read-only and show scope, source IDs, observed facts, interpretation, hypotheses, limitations, and recommendation. | Request a run with no local provider. Confirm `safe_failure`, provider limitation, and evidence boundary remain readable without relying on badge color. |
| Business review | The canonical metrics table uses table headers for metric, actual, and target. Approval and regeneration controls have visible labels. | Use a screen reader’s table navigation to hear headers and values, then verify approval is reachable by keyboard. |

> The local-first demo uses synthetic data. The packaged build should be exercised with Narrator and NVDA in the target Windows environment before any organization-specific deployment, configuration, or data onboarding.
