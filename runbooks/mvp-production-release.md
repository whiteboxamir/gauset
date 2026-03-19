# MVP Production Release

This runbook is for `/Users/amirboz/gauset` and `https://gauset.com`.

Do not use the `gauset-app` certification runbook as the production release path for this site.

## Scope

This procedure validates the public MVP preview and asset lanes on `gauset.com`.

It does not certify the reconstruction lane, because public reconstruction is still unavailable until a separate GPU worker is connected.

## Required Preconditions

1. Production environment contains `BLOB_READ_WRITE_TOKEN`.
2. `/api/mvp/setup/status` reports:
   - `storage_mode: "blob"`
   - `storage.public_write_safe: true`
   - `capabilities.preview.available: true`
   - `capabilities.asset.available: true`
3. The production backend runtime path is the canonical `api/_mvp_backend/vercel_backend/app.py`.

## Canonical Commands

Run from `/Users/amirboz/gauset`:

```bash
node scripts/mvp_release_preflight.mjs
node scripts/mvp_public_canary.mjs
```

Optional target override:

```bash
GAUSET_MVP_BASE_URL=https://gauset.com node scripts/mvp_release_preflight.mjs
GAUSET_MVP_BASE_URL=https://gauset.com node scripts/mvp_public_canary.mjs
```

## What Preflight Checks

- `/api/mvp/health`
- `/api/mvp/deployment`
- `/api/mvp/setup/status`
- durable storage mode
- truthful lane availability

## What Canary Checks

- upload
- environment preview generation
- `metadata.json` fetch
- `splats.ply` HEAD
- scene save
- scene version listing

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

The release is not complete unless both pass.
