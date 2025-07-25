# Agent Guidelines for google-define

## Build/Test Commands

- `bun run dev` - Start development server with turbopack
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run tsc` - TypeScript type checking
- No test framework configured - check with user before adding tests

## Code Style

- **Formatting**: 4-space tabs, Prettier with Tailwind plugin and import sorting
- **Imports**: Use `@/` alias for src imports, sort imports automatically
- **Types**: Strict TypeScript, use proper typing, avoid `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: React functional components with TypeScript, use `React.FC` with props interface
- **Error Handling**: Use try-catch blocks, log errors with `console.log(e)`
- **State**: Use React hooks (useState, useEffect), TanStack Query for server state
- **Styling**: Tailwind CSS classes, use `cn()` utility for conditional classes
- **API**: tRPC for type-safe API calls, Next.js API routes for external endpoints
- **Database**: Drizzle ORM with PostgreSQL
- **Auth**: Custom auth implementation with JWT tokens

## Project Structure

- Next.js 15 app router in `src/app/`
- Components in `src/app/components/` and `src/components/ui/`
- tRPC setup in `src/app/trpc/`
- Database schema in `src/db/`
