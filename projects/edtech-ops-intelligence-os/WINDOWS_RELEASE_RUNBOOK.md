# Windows Release and Connector Readiness Runbook

The desktop application is local-first. Release configuration and connector readiness preserve only metadata and secret **references** in the workspace; certificate values, passwords, API keys, and connector tokens must never be persisted in JSON state, audit payloads, source files, or release archives.

| Area | Implemented control | Operator requirement |
|---|---|---|
| Unsigned release | `desktop:package:win:guarded` deliberately disables automatic signing when no certificate environment variables are present. | Use the verified ZIP build for internal evaluation only. |
| Signed release | The guarded package script enables the Electron builder signing path only when both `CSC_LINK` and `CSC_KEY_PASSWORD` are environment-provided. | Supply organization-owned certificate material through the secured build environment. Do not place it in the project folder. |
| Connector credentials | SIS/LMS configuration accepts only `keychain://NAME` or `env://NAME` references. Raw secret-like fields are rejected in the main process. | Store the referenced value in Windows Credential Manager or the managed build/runtime environment. |
| Guarded sync | Every sync request is evaluated against connector type, verified credential reference, canonical mapping, and offline-safe policy. | A local-first build records `offline_safe` or `blocked` runs; it does not call external SIS/LMS endpoints. |
| Reconciliation | A blocked connector run creates or updates an open reconciliation record with the evidence and required correction. | Resolve the credential-reference or mapping issue and revalidate before seeking approval for a managed adapter. |

## Reproducible Release Procedure

Run the following commands from the project root after TypeScript and unit-test verification:

```bash
pnpm check
pnpm test
pnpm desktop:package:win:guarded
```

For a signed organizational release, inject the two required variables only in the protected build environment:

```powershell
$env:CSC_LINK = "<protected certificate reference or file URL>"
$env:CSC_KEY_PASSWORD = "<protected certificate password>"
pnpm desktop:package:win:guarded
```

> The current distribution ZIP is a verified unpacked Windows application. It is not a claim that an organization code-signing certificate has been configured or that a live SIS/LMS adapter has been approved.

## Packaged Accessibility Acceptance

Before organizational rollout, exercise the packaged Windows build with Narrator and NVDA. Verify focus enters and exits each evidence drawer, the close button is announced, disabled analyst-history mutation controls are identified as read-only, dataset/evaluation state changes are announced, and canonical-metric table headers are read with their values. Turn on Windows high-contrast mode and confirm controls, status text, and focus outlines remain distinguishable.
