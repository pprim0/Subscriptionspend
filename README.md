# subscriptionspend

Track recurring spending in one place, understand where your money goes, and spot subscriptions that are easier to cut than they look.

![subscriptionspend dashboard](docs/screenshot.png)

## Overview

`subscriptionspend` is a full-stack monorepo for managing recurring expenses. It combines a web dashboard, an API, shared contracts, authentication, and a PostgreSQL-backed data layer so you can add subscriptions, group them into categories, and review spend from multiple angles.

## What You Can Do

- Create and manage subscriptions with monthly, weekly, or yearly billing intervals
- Organize subscriptions into categories
- See monthly, yearly, and daily spend summaries
- Review upcoming charges in a calendar view
- Explore category and forecast insights
- Sign up and log in with Better Auth

## Stack

- `TanStack Start` + `React 19` for the web app
- `Bun` + `Hono` for the API
- `PostgreSQL` + `Drizzle ORM` for persistence
- `oRPC` + `Zod` for shared contracts and typed API calls
- `Tailwind CSS 4`, `Radix UI`, and shadcn-style components for the interface
- `pnpm` workspaces for the monorepo
- `Docker Compose` for self-hosting

## Monorepo Structure

```text
apps/
  api/        Hono API runtime
  web/        TanStack Start frontend
packages/
  auth/       Shared auth package
  contracts/  Shared API contracts and client types
  db/         Drizzle schema and migrations
docs/
  screenshot.png
```

## Getting Started

### Requirements

- Node.js `22.15+`
- `pnpm` `10+`
- Bun
- Docker and Docker Compose for the containerized setup

### Local Development

1. Install dependencies:

```sh
pnpm install
```

2. Create your local environment file:

```sh
cp .env.example .env
```

3. Start the app:

```sh
pnpm dev
```

This runs the workspace apps in parallel.

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

### Useful Commands

```sh
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm typecheck
pnpm lint
pnpm format
pnpm db:generate
pnpm db:migrate
pnpm db:push
```

## Self-Hosting With Docker

Bring the full stack up with:

```sh
docker compose up -d
```

This starts:

- PostgreSQL
- database migrations
- API on port `4000`
- web app on port `3000`

For anything beyond local development, set a real `BETTER_AUTH_SECRET` before building or deploying.

If your production web app and API live on different subdomains, also set `BETTER_AUTH_COOKIE_DOMAIN` to the shared parent domain, such as `example.com`, so auth cookies work across both hosts.

## Environment Variables

The repo includes `.env.example` as a safe template. The real `.env` file is intentionally ignored by Git.

Important variables include:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_COOKIE_DOMAIN`
- `VITE_API_URL`
- `VITE_AUTH_URL`
- `API_URL`
- `CORS_ORIGIN`

## Why `.env.example` Is In The Repo

`.env.example` is meant to stay versioned. It documents which environment variables the app needs without exposing real secrets. You should put actual credentials only in `.env`.

## License

No license has been added yet. If you plan to keep the repository public, it is worth choosing one explicitly.
