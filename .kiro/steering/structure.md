# Project Structure

## Root Level
- `src/` - Main application source code
- `tests/` - Test files (smoke tests in `tests/smoke/`)
- `prd/` - Product requirements documents
- `specs/` - Technical specifications and best practices
- `.kiro/` - Kiro IDE configuration and steering rules

## Source Organization (`src/`)

### Core Application
- `main.ts` - Application entry point, mounts Vue app with router
- `App.vue` - Root component with router-view
- `assets/main.css` - Global styles and TailwindCSS imports

### Pages (`src/pages/`)
Page-based routing structure:
- `HomePage.vue` - Landing page with navigation to upload/wordlists
- `UploadPage.vue` - File upload interface
- `ProcessingPage.vue` - Upload progress and processing status
- `ResultPage.vue` - Display generated wordlists
- `SavedWordlistsPage.vue` - Manage saved wordlists

### State Management (`src/state/`)
Reactive state using Vue's Composition API:
- `uploadState.ts` - Upload queue, processing status, and results
- `wordlistsState.ts` - Saved wordlists management

### Services (`src/lib/`)
- `supabase.ts` - Supabase client configuration

### Routing (`src/router/`)
Vue Router configuration for page navigation

## Naming Conventions
- **Pages**: PascalCase with `Page` suffix (e.g., `HomePage.vue`)
- **State files**: camelCase with `State` suffix (e.g., `uploadState.ts`)
- **Components**: PascalCase for Vue components
- **Types**: PascalCase interfaces (e.g., `UploadItem`, `WordPair`)

## Architecture Patterns
- **Composition API**: Use `<script setup>` syntax for all Vue components
- **Reactive State**: Global state managed with `reactive()` and `computed()`
- **Type Safety**: All state and props properly typed with TypeScript
- **Page-based Routing**: Each major view is a separate page component