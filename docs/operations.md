# Operations

## Is the site up? (smoke test)

`.github/workflows/smoke.yml` checks the live site on GitHub Actions:

- every 30 minutes: the critical pages (`/health`, home, recipes, travel, shop, `/en`, ...)
- every night: every URL in the sitemap (about 290 pages), which finds one broken page among hundreds

A failed scheduled run emails the repository owner. Run it by hand with `bun scripts/smoke.ts [--full] [--base URL]`.

## Errors

All server and render errors are logged (`railway logs --service evalicious`). Two optional extras, off until their variable is set on the `evalicious` Railway service:

| Variable | Effect |
|---|---|
| `SENTRY_DSN` | send errors to Sentry (create a free Bun/Node project and paste its DSN) |
| `ALERT_EMAIL` | email a short alert for a 5xx page or API error: at most one per distinct error per hour, ten per hour in total |

## Backups

The database volume is on Railway. As a safety net that does not depend on it, the server writes a nightly logical backup to the private file bucket: `backups/YYYY-MM-DD.json.gz` (kept for 30 days). It is checked every six hours, so a restart never skips a day.

It contains users, accounts (password hashes and OAuth tokens), products, orders, course access and progress, favourites, lists and free-download consent records. Sessions and one-time tokens are left out. Content lives in Sanity and payments in Stripe, so they are not part of it.

To inspect or restore a backup, download the file from the bucket (`railway bucket credentials --bucket downloads` gives S3 access), `gunzip` it, and read `tables.<model>`: each is the array of rows of the Prisma model of the same name. Restoring means `createMany` per model, parents first (user, product, order). Check the dashboard of Railway's own volume backups as well; this export is the second line of defence.

## Environment

Set on the `evalicious` service: database, Better Auth, Sanity, Stripe, Space Invoices, `STORAGE_*` (bucket), `SES_*` and `EMAIL_FROM` (email), `HAL_API_KEY`. Optional: `SENTRY_DSN`, `ALERT_EMAIL`, `HAL_CRM_STAGE_ID`.
