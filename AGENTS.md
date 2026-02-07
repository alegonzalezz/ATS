# AGENTS.md - Coding Guidelines for ATS

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build            # Production build to dist/
npm run preview          # Preview production build locally

# Lint
npm run lint             # Run ESLint on all TypeScript files

# Deploy
npm run deploy           # Deploy to GitHub Pages
npm run predeploy        # Runs build before deploy

# Note: No test framework is currently configured in this project.
# If adding tests, consider Vitest or Jest for React testing.
```

## Project Overview

- **Framework**: React 19 + TypeScript 5.9 + Vite 7
- **UI Library**: shadcn/ui (New York style) + Tailwind CSS 3.4
- **Icons**: Lucide React
- **State**: React hooks (no external state management)
- **Module System**: ESM (`"type": "module"`)

## Path Aliases

```typescript
@/components    → ./src/components
@/components/ui → ./src/components/ui
@/hooks         → ./src/hooks
@/lib           → ./src/lib
@/types         → ./src/types
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with explicit types for props and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions and mapped types
- Import types with `import type { Foo }` when possible

```typescript
// Good
interface CandidateProps {
  candidate: Candidate;
  onUpdate: (id: string) => void;
}

// Good
export type CandidateStatus = 'nuevo' | 'en_revision' | 'entrevista';
```

### Imports Order

1. React imports
2. Third-party libraries
3. Local components (`@/components/*`)
4. Hooks (`@/hooks/*`)
5. Utilities (`@/lib/*`)
6. Types (`@/types/*` or `import type`)

```typescript
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useCandidates } from '@/hooks/useCandidates';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/types';
```

### Naming Conventions

- **Components**: PascalCase (e.g., `CandidateCard`, `SettingsDialog`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCandidates`, `useLinkedInSync`)
- **Types/Interfaces**: PascalCase (e.g., `Candidate`, `SearchFilters`)
- **Props interfaces**: PascalCase with `Props` suffix (e.g., `CandidateProps`)
- **Utility functions**: camelCase (e.g., `formatDate`, `generateId`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### Component Structure

- Use functional components with hooks
- Props destructuring in function parameters
- Export both component and related types/variants
- Use forwardRef when needed for ref forwarding

```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'default',
  children 
}: ButtonProps) {
  return <button className={cn(...)}>{children}</button>;
}
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui patterns for component variants using `cva`
- Group related classes logically

```typescript
import { cn } from '@/lib/utils';

// Good
<div className={cn(
  'flex items-center gap-2',
  'rounded-lg border p-4',
  isActive && 'bg-primary text-primary-foreground'
)}>
```

### Error Handling

- Use try/catch for async operations
- Use toast notifications for user feedback (sonner library)
- Log errors to console for debugging
- Handle edge cases explicitly

```typescript
try {
  await importFromCV(file, onProgress);
  toast.success('CV importado correctamente');
} catch (error) {
  console.error('Error importing CV:', error);
  toast.error('Error al importar el CV');
  throw error;
}
```

### State Management

- Use `useState` for local component state
- Use custom hooks for reusable state logic
- Keep state close to where it's used
- Derive computed values rather than storing in state

### File Organization

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (auto-generated)
│   ├── *.tsx         # Domain components
├── hooks/
│   └── use*.ts       # Custom React hooks
├── lib/
│   └── utils.ts      # Utility functions (cn, formatters, etc.)
├── types/
│   └── index.ts      # TypeScript types/interfaces
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

### shadcn/ui Components

- Install new components via CLI: `npx shadcn add <component>`
- Customize in `@/components/ui/` directory
- Follow existing patterns for variants and composition
- Use Radix UI primitives as base when extending

### Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Support focus management

### Language

- UI text in Spanish (app is localized for Spanish users)
- Comments and documentation in English
- Variable names in English

## ESLint Configuration

- Uses `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`
- Ignores `dist/` directory
- Runs on `**/*.{ts,tsx}` files

## Git Workflow

- Feature branches for new work
- Main branch for production-ready code
- GitHub Actions for automated deployment
