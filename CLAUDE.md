# Eva-licious.com

Recipe/lifestyle website built with Hono + Vike + React 19 on Bun.

## Commands

- `bun run dev` — Start dev server (port 3000)
- `bun run build` — Build for production
- `bun run preview` — Preview production build
- `bun run db:generate` — Generate Prisma client
- `bun run db:push` — Push schema to database
- `bun run db:migrate` — Run migrations
- `bun run lint` — Check with Biome
- `bun run lint:fix` — Auto-fix with Biome

## Tech Stack

- **Server**: Hono on Bun with Vike SSR
- **UI**: React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **CMS**: Sanity v3 (content) + PostgreSQL via Prisma (user data)
- **Auth**: Better Auth with email/password + Google OAuth
- **Payments**: Stripe Checkout + Webhooks
- **Storage**: Railway bucket, S3-compatible (files), Bunny Stream (video)
- **Email**: AWS SES (eu-central-1, `eva-licious.com` identity)
- **Linting**: Biome (tabs, double quotes, semicolons)
- **Deploy**: Railway (Bun Dockerfile)

## Architecture

- `server/` — Hono API routes and middleware
- `pages/` — Vike file-based routing (SSR)
- `components/` — React components (shadcn/ui in `ui/`)
- `sanity/` — Sanity Studio schemas
- `prisma/` — Database schema and migrations
- `lib/` — Shared utilities, GROQ queries, types
- `types/` — TypeScript type definitions

## Conventions

- Use `@/` path alias for imports from project root
- Use Biome formatting: tabs, double quotes, semicolons
- Use `"use client"` directive for client-side interactive components
- Sanity for content (recipes, blog, products), PostgreSQL for user data
- shadcn/ui components use `cn()` from `@/lib/utils`

## Languages (Slovenian default, English under `/en`)

- URLs: Slovenian at the root, English under `/en/...`. `pages/+onBeforeRoute.ts` strips the prefix and sets `pageContext.locale`. `ENGLISH_ENABLED` in `lib/i18n/config.ts` switches the English site on (off = `/en/*` is a 404 and the switcher is hidden).
- UI text lives in typed dictionaries: `lib/i18n/messages/<area>.sl.ts` (source) and `<area>.en.ts` (must have the same keys; `bun test` checks keys and `{placeholders}`). In components use `const { t, l, locale, formatDate } = useI18n()`; never hard-code visible text. Wrap every internal link in `l("/path")` (not `/api/...`). In non-React code use `translatorFor(locale)` and `localizePath(path, locale)`.
- CMS content: recipes, blog posts, travel entries and the home/about pages are one Sanity document per language (`language`, `translationOf`; English slugs differ). Products, courses and lessons are one document with an `en` override block. Every query in `lib/sanity.queries.ts` takes `$locale`. In Studio, "Create English version" copies a Slovenian document into an unpublished English draft.
- Emails: the free-download email is sent by HAL; English uses the `free-download-requested-en` workflow. Purchase emails use `common.email.*` messages and `order.locale`.
- `scripts/i18n/pipeline.ts` is the one-off pipeline that translated the existing content (extract, check, build, apply).

