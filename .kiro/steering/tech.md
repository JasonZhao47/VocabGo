# Tech Stack

## Frontend Framework
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Vue Router 4** for client-side routing
- **TailwindCSS** for styling

## Build System
- **Vite** as build tool and dev server
- **pnpm** as package manager (required - see `packageManager` in package.json)
- **vue-tsc** for TypeScript compilation

## Backend Services
- **Supabase** for database and backend services
- **GLM-Flash** LLM model for AI processing

## Testing
- **Vitest** for unit testing
- **@vue/test-utils** for Vue component testing
- **jsdom** for DOM simulation

## Common Commands
```bash
# Development
pnpm dev              # Start dev server on port 5173

# Building
pnpm build            # Type check + build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests once
pnpm test:ui          # Run tests with UI

# Type Checking
pnpm type-check       # TypeScript validation without emit
```

## Development Notes
- Uses `@` alias for `src/` directory imports
- Dev server runs on port 5173
- All dependencies managed through pnpm lockfile