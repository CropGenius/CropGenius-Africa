# Crush Configuration for CropGenius-Africa

## Build Commands
```bash
npm run build          # Full production build with image optimization and PWA assets
npm run build:dev      # Development build
npm run build:analyze  # Build with bundle analysis
```

## Development Commands
```bash
npm run dev            # Start development server
npm run preview        # Preview production build locally
```

## Linting Commands
```bash
npm run lint           # Run ESLint on all files
```

## Testing Commands
```bash
npm run test           # Run all tests with vitest
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:onboarding # Run onboarding tests with Jest
npm run test:onboarding:watch    # Run onboarding tests in watch mode
npm run test:onboarding:coverage # Run onboarding tests with coverage
npm run test:disease   # Run specific crop disease tests
npm run test:api       # Run API health tests
```

## Database Commands
```bash
npm run db:setup       # Setup database
npm run db:migrate     # Run database migrations
npm run db:reset       # Reset database
npm run db:seed        # Seed database
npm run db:all         # Migrate and seed database
```

## Code Style Guidelines

### Imports
- Use absolute imports with `@/*` alias for src directory
- Group imports in order: external libraries, internal modules, type imports
- Use type-only imports: `import type { TypeName } from './module'`

### TypeScript
- Use branded types for IDs: `type UserId = Brand<string, 'UserId'>`
- Prefer types over interfaces unless interface merging is required
- Strict mode disabled but still use explicit typing

### Formatting
- Prettier is configured for automatic formatting
- 2-space indentation
- No trailing commas in function parameters
- Semicolon terminated statements

### Naming Conventions
- React components in PascalCase
- Hooks prefixed with `use`
- Services suffixed with `Service`
- Types in PascalCase
- Constants in UPPER_SNAKE_CASE

### Error Handling
- Use AppError class for structured errors
- Include context and retry logic in errors
- Implement graceful degradation for external API failures
- Log errors appropriately without exposing sensitive data

### Testing Best Practices
- Co-locate unit tests with source files (*.spec.ts)
- Separate pure logic unit tests from integration tests
- Prefer integration tests over heavy mocking
- Use strong assertions (toEqual) over weak ones (toBeGreaterThanOrEqual)
- Test edge cases, boundaries, and unexpected inputs
- Parameterize test inputs; avoid hardcoded literals

### React Patterns
- Follow existing component patterns in the codebase
- Use React.memo for performance optimization
- Implement error boundaries for component isolation
- Use context for state that spans multiple components
- Prefer small, composable, testable functions

### AI/Supabase Integration
- Implement fallbacks for AI service failures
- Use BulletproofSupabase client for resilient database operations
- Follow RLS (Row Level Security) patterns for data isolation
- Handle offline scenarios gracefully with local storage

## Specialized Tools
```bash
npm run generate-pwa-assets  # Generate PWA icons and splash screens
npm run optimize-images      # Optimize images in public directory
npm run perf:audit          # Run Lighthouse performance audit
```