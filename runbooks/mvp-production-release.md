# MVP Production Release

This runbook is for the `gauset-com` repo checkout and `https://gauset.com`.

Do not use the `gauset-app` certification runbook as the production release path for this site.

## Scope

This procedure validates the public MVP preview and asset lanes on `gauset.com`.

It does not certify the reconstruction lane, because public reconstruction is still unavailable until a separate GPU worker is connected.

## Required Preconditions

1. Production environment contains `BLOB_READ_WRITE_TOKEN`.
2. `/api/mvp/setup/status` reports:
   - `storage_mode: "blob"`
   - `capabilities.preview.available: true`
   - `capabilities.asset.available: true`
3. `/api/mvp/upload-init` advertises `available: true` with a direct upload transport.
4. The production backend runtime path is the canonical `api/_mvp_backend/vercel_backend/app.py`.

## Canonical Commands

Run from the `gauset-com` repo root:

```bash
node scripts/mvp_release_preflight.mjs
node scripts/mvp_public_canary.mjs
```

Optional target override:

```bash
GAUSET_MVP_BASE_URL=https://gauset.com node scripts/mvp_release_preflight.mjs
GAUSET_MVP_BASE_URL=https://gauset.com node scripts/mvp_public_canary.mjs
python3 scripts/mvp_smoke.py --mode full --web-base-url https://gauset.com --asset-image public/images/hero_render.png --environment-image public/images/hero/interior_daylight.png
```

## What Preflight Checks

- `/api/mvp/health`
- `/api/mvp/deployment`
- `/api/mvp/upload-init`
- `/api/mvp/setup/status`
- `/app/worlds` renders the protected sentence
- `/mvp` renders the project-first launchpad
- `/mvp/preview` redirects back to `/mvp`
- durable storage mode
- truthful lane availability

## What Canary Checks

- direct upload bootstrap plus large-file upload
- environment preview generation
- `metadata.json` fetch
- `splats.ply` HEAD
- scene save
- scene version listing
- asset generation, review shell, and versioned save when `mvp_smoke.py --mode full` is run

## Stop Conditions

Stop the release immediately if:

- `storage_mode` is not `blob`
- preview or asset lane is unavailable
- upload fails
- generated environment artifacts are missing
- scene save or version listing fails

## Expected Output

Both scripts print JSON.

Pass condition:

- `"status": "pass"`

Fail condition:

- `"status": "fail"`

The release is not complete unless preflight and canary pass, and asset-lane validation is only claimed when the smoke script is also run.
