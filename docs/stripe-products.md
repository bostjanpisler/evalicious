# Stripe products and prices

Paid shop products are authored in Sanity, mirrored to PostgreSQL, and charged with a
one-time Stripe Price. Use the same Stripe mode everywhere: test IDs with test API keys and
live IDs with live API keys.

## Create a paid product

1. In Stripe Dashboard, switch to the intended mode and create a product.
2. Add a one-time price whose amount and currency exactly match `priceInCents` and `currency`
   in Sanity. Recurring prices are not supported by the checkout flow.
3. Copy the Stripe product ID (`prod_...`) and price ID (`price_...`).
4. In the matching Sanity `product` document, set:
   - `priceInCents` to the smallest currency unit (for example, `1290` for EUR 12.90)
   - `currency` to the three-letter currency code
   - `stripeProductId` and `stripePriceId` to the IDs from the same Stripe mode
   - `r2FileKey` for an ebook that should be delivered from R2
   - `published` only when the product is ready to sell
5. Run `bun run products:sync` with `DATABASE_URL` and the Sanity variables for the target
   environment. The sync skips paid products missing either Stripe ID and unpublishes database
   products no longer returned by Sanity.

Free products use `priceInCents: 0` and do not need Stripe IDs. They still need to be synced so
the application can validate publication and delivery configuration.

## Configure checkout and webhooks

Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` for the same
Stripe mode. Configure Stripe to send `checkout.session.completed` to:

```text
https://<application-host>/api/stripe/webhook
```

For a local test, forward Stripe events and use the webhook secret printed by the Stripe CLI:

```sh
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

`BETTER_AUTH_URL` must be the public application origin because it is used for checkout success
and cancellation URLs.

## Verify a release

1. Run `bun run products:sync` and confirm that no intended paid product is skipped.
2. Sign in as a test customer and purchase a low-value product with a Stripe test card.
3. Confirm the success page reports a completed purchase only after the webhook creates the order.
4. Confirm the delivery email arrives and its expiring ebook link downloads the expected PDF.
5. Open **Nadzorna plošča → Moja naročila**, open the order detail, and verify the amount,
   delivery email, status, product, invoice number (once issued), and re-download/course link. A
   dashboard ebook re-download should contain the purchaser watermark.
6. Retry the Stripe event and confirm it does not create a duplicate order or send a duplicate
   fulfillment email.

Do not perform the paid end-to-end check with live credentials. The automated suite covers order
ownership/enrichment and fulfillment helpers; Stripe, email, R2, and webhook delivery still require
the sandbox smoke test above.
