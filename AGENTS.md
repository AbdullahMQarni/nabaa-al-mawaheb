# AGENTS.md — Nabaa Al-Mawaheb

## Project Overview

Next.js 16 (App Router) + TypeScript + Prisma stadium booking app. Arabic-language (RTL) client-facing UI with an LTR admin dashboard. PostgreSQL for all environments.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (no Prettier installed)
npx prisma generate  # Regenerate Prisma client (runs postinstall)
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma database GUI
```

### Running a Single Test

**No test framework is installed.** There are no `*.test.ts`/`*.spec.ts` files, no Jest/Vitest config, and no test script in package.json. To add tests, install Jest or Vitest first. An ad-hoc manual test script exists at `test.mjs` (creates a test booking via Prisma directly — not a real test).

## Code Style

### Imports
- Path alias `@/*` maps to `./src/*` (e.g., `@/lib/prisma`, `@/components/RiyalIcon`)
- Third-party imports use double quotes; local imports use single quotes
- Use `import type` for type-only imports (e.g., `import type { Metadata } from "next"`)
- Group imports: third-party first, then `@/` aliases, then relative imports

### Formatting
- **Indentation:** 4 spaces (not 2, not tabs)
- **Semicolons:** Always
- **String quotes:** Single quotes for JS/TS, double quotes in JSX attributes
- **Max line length:** No explicit limit enforced (no Prettier)

### TypeScript
- `strict: true` in tsconfig — no `any` unless unavoidable
- Target: ES2017, module: ESNext, moduleResolution: bundler
- JSX: `react-jsx`
- Use inline type annotations for component props: `function Foo({ a, b }: { a: string, b: number })`
- Use `Readonly<{ children: React.ReactNode }>` for layout props

### Naming Conventions
- **Components:** PascalCase (`SplashLogin`, `RiyalIcon`, `Wizard`)
- **Files:**
  - Pages: `page.tsx`
  - Layouts: `layout.tsx`
  - Route handlers: `route.ts`
  - Client components: `*Client.tsx` suffix (e.g., `QueueClient.tsx`)
  - Shared components: PascalCase (e.g., `AdminSearch.tsx`)
- **Variables/functions:** camelCase
- **API route exports:** `export async function POST/GET/PUT/DELETE`
- **CSS classes:** kebab-case (e.g., `.animate-slide-up`, `.status-pending`)

### React Patterns
- Functional components only (no class components)
- Server components are the default — use `"use client"` only when needed (hooks, browser APIs, event handlers)
- `async` server components can directly `await` Prisma queries
- Client components use React hooks (`useState`, `useRouter`)
- Heavy use of inline `style={{}}` alongside CSS classes — prefer CSS classes when possible

### Error Handling
- API routes: wrap logic in `try/catch`, return appropriate HTTP status codes
- Return `NextResponse.json({ error: 'message' }, { status: NNN })` for errors
- Log errors with `console.error('Context:', error)`
- Validation: check required fields early, return 400 for missing/invalid input
- Auth: check session cookie, return 401 if missing or user not found

### Database (Prisma)
- Single Prisma client in `src/lib/prisma.ts` with dev hot-reload prevention
- Models: `User`, `Stadium`, `Booking`, `Cost`
- Use `npx prisma generate` after schema changes
- Database: PostgreSQL (via `DATABASE_URL` env var)

### Styling
- **Vanilla CSS only** — no Tailwind, no CSS-in-JS, no SCSS
- Global styles in `src/app/globals.css` with CSS custom properties
- Rich animation system with keyframes and utility classes (`.animate-fade-in`, `.stagger-*`)
- Font: IBM Plex Sans Arabic (Google Fonts)
- Client-facing: RTL direction; Admin: LTR
- Component-scoped CSS via co-located `.css` files (e.g., `admin/admin.css`)

### Environment Variables
- See `.env.example` for template
- `DATABASE_URL` is required
- Session stored via `session_userId` cookie

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers
│   ├── admin/              # Admin dashboard (stats, queue, analytics, costs)
│   ├── dashboard/          # Client dashboard (booking history)
│   ├── home/               # Stadium discovery + search
│   ├── stadiums/[id]/book/ # Booking wizard
│   └── layout.tsx          # Root layout
├── components/             # Shared React components
└── lib/                    # Utilities (prisma client)
prisma/
└── schema.prisma           # Database schema
```
