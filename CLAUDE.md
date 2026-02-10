# Eva-Licious.com

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
- **Storage**: Cloudflare R2 (files), Bunny Stream (video)
- **Email**: Resend
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
