# Cardwise — optimize my cards

A browser-only monthly rewards planner for credit cards you already own. React, TypeScript and Vite, with a separate rewards engine and issuer-sourced card catalog. Built for Azure Static Web Apps.

## Run

Requires Node.js 24+ and pnpm 11.25.0.

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## Features

- Eligible spending by category, with rent entered separately.
- Bilt Palladium, Chase Sapphire Preferred, Capital One Savor and Wells Fargo Active Cash.
- Custom uncapped cards with editable base/category rates.
- Estimated-value or single-program points optimization.
- Cross-card category splits and Bilt housing-tier comparisons.
- Recurring forecasts or existing-balance rent calculations.
- Optional save/load/delete on this device. No accounts, analytics, bank connections or server submission. Fonts are requested from Google Fonts; spending data is not transmitted.

See [methodology](docs/rewards-methodology.md) for included rules and limits.

## Deploy to Azure

1. Create an Azure Static Web Apps resource for this GitHub repository.
2. Store its deployment token in the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Never commit the token.
3. Run the **Publish to Azure Static Web Apps** workflow manually. It tests and builds, then uploads `dist/`.
4. After reviewing deployment, enable a push trigger on `main` if desired. If Azure creates another deployment workflow, use one deployment workflow to avoid duplicate builds.

`public/staticwebapp.config.json` is copied into the deployment output. Hosting requires no backend or database for this version.
