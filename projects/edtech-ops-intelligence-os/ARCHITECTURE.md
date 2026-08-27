# EdTech Operations Intelligence OS — Desktop Architecture

The application is a **Windows desktop operations console** built with Electron and a React renderer. Its local-first design stores operational records in a JSON data store within the Windows application data directory. This keeps the demonstration executable without external credentials while preserving an integration-ready boundary: all persistence operations are brokered by the Electron main process, not directly from the renderer.

| Layer | Responsibility | Boundary |
|---|---|---|
| Electron main process | Local state, validation, authorization, state transitions, append-only audit records, CSV import/export | Trusted process; Node and filesystem access only here |
| Preload bridge | Minimal, typed-style IPC methods for approved user interactions | Context-isolated API; no unrestricted Node access in UI |
| React renderer | Desktop-first dashboard, workspaces, forms, filters, visualizations, loading and error states | No direct filesystem or database access |
| Local data store | Persisted workspace, reference records, investigations, SOP versions, saved analyses, and audit entries | Atomic file replacement on each approved mutation |

The product includes four built-in roles: **administrator**, **manager**, **coordinator**, and **analyst**. Read operations are shared across the permitted operational surface, while mutation permissions are enforced in the main process. The desktop profile selector is intentionally visible in the demo to exercise the permission boundary.

Audit records are append-only. The renderer has no update or delete operation for audit events; the main process only adds audit entries after approved domain changes, exports, role changes, and demo resets. Deleting a domain record therefore preserves an immutable capture of the record and the action details.

The default workspace is seeded deterministically with realistic synthetic records spanning healthy, missing, at-risk, stale, escalated, and resolved conditions. Recharts renders all KPI and operational trend visualizations. The app can export filtered views to CSV and import validated student records with duplicate detection.
