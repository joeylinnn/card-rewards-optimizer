# Architecture

The React frontend lives in `apps/web`. Its inputs are ephemeral React state, with explicit browser-local scenario persistence. The UI calls the pure TypeScript rewards engine in `packages/rewards-engine`; the engine imports shared card and category types from `packages/card-catalog`.

The catalog is code-reviewed source data with issuer URLs and verification dates. The engine is synchronous, side-effect-free and usable from future server APIs. It returns explicit allocations, separate reward currencies, Bilt Cash earned/consumed, housing rewards and an objective score. UI explanation and methodology documentation disclose supported rules and exclusions.

No backend, database, login or banking integration is needed for the first version. No secrets are present in the frontend. GitHub Actions validate calculations and build a static `dist/` directory; a manually triggered Azure Static Web Apps workflow publishes it after a deployment secret is configured.

Future extensions should introduce capped-category state and accelerator timing in the engine before expanding the catalog to cards requiring those rules. CSV parsing can remain client-side. Accounts and bank connections would require authenticated APIs and server-side secret storage.
