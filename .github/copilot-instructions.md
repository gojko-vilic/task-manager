# Copilot Instructions — MetaStack Architecture

Follow these rules when generating or modifying code in this project.

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite** (`@vitejs/plugin-react`)
- **React Router v7** — `createBrowserRouter` + `RouterProvider`
- **@tanstack/react-query v5** — server state management
- **Zustand v5** — client-only UI state, `persist` middleware when needed
- **react-hook-form** — all form state
- **Axios** — custom `http` instance from `@/lib/axios`
- **@ebay/nice-modal-react** — modal management with register pattern
- **Tailwind CSS v4** — with `clsx` + `tailwind-merge` via `cn()` helper
- **@dnd-kit** — drag and drop (core, sortable, utilities)
- **Vitest** + **Testing Library** — testing
- **dayjs** — date handling
- **await-to-js** — async error handling (`[err, result] = await to(promise)`)
- **uuid** — unique ID generation

---

## Folder Structure Rules

```
src/
├── components/          # Shared/global components
│   ├── ui/              # Primitive UI (Button, Input, Select, Modal, Toggle)
│   ├── modals/          # Shared modals
│   └── MainLayout.tsx   # Root layout with <Outlet />
├── config/              # API_URL, LIMIT, env helpers
├── constants.ts         # App-wide constants & enums
├── features/            # ⭐ Feature modules (domain-driven)
│   └── [feature-name]/  # One folder per domain
├── hooks/               # Shared custom hooks
├── lib/                 # Third-party wrappers (axios.ts, queryClient.ts)
├── test/                # Test utilities
├── types/               # Global TS types (PaginatedResponse, Nullable)
├── utils/               # Shared utilities (cn.ts, storage.ts, invariant.ts)
├── global-modals-register.ts
├── main.tsx
├── router.tsx           # createBrowserRouter config
├── routes.ts            # Route path constants (AppRoutes)
└── index.css
```

---

## Feature Module Structure

Every domain feature lives in `src/features/[name]/` with this structure:

```
features/[feature-name]/
├── [feature].types.ts          # Domain types & interfaces
├── [feature].constants.ts      # Feature constants, option arrays
├── [feature].query-keys.ts     # React Query cache key factory
├── [feature].repo.ts           # API calls (data access layer)
├── [feature].service.ts        # Business logic (pure functions, NO side effects)
├── [feature].service.test.ts   # Service tests
├── use[Feature].ts             # React Query hook — single item
├── use[Features].ts            # React Query hook — list/paginated
├── use[Feature]Store.ts        # Zustand store (only when needed for client state)
├── components/                 # Feature-specific UI components
├── pages/                      # Route-level page components
│   └── [Feature]Page/
│       ├── [Feature]Page.tsx
│       ├── [Feature]Page.helpers.tsx
│       └── index.ts
├── modals/
│   ├── constants.ts            # Modal ID string constants
│   └── register.ts             # NiceModal.register() calls
└── index.ts                    # Barrel export (public API)
```

---

## Repo / Service Pattern

### Repo (Data Access)

- Located in `[feature].repo.ts`
- Contains **only** HTTP calls using the `http` Axios instance
- Returns Axios promises directly
- Exported as a single object: `export const featureRepo = { getAll, details, create, update, remove }`
- Uses `http.get<unknown, ResponseType>()` pattern (response interceptor unwraps `.data`)

### Service (Business Logic)

- Located in `[feature].service.ts`
- Contains **only** pure functions — NO side effects, NO API calls
- Handles: data transformation, form parsing, label lookups, sorting, filtering, validation
- Exported as a single object: `export const featureService = { parseFormToPayload, getStatusLabel, ... }`

### Hooks (React Query v5)

- `use[Feature].ts` — single item query using `useQuery` from `@tanstack/react-query`
- `use[Features].ts` — list/paginated query using `useInfiniteQuery`
- `useMutate[Feature].ts` — mutations using `useMutation` (optional, for reusable mutations)
- Wire repo methods to React Query's `queryFn`
- Use query keys from `[feature].query-keys.ts`
- v5 uses `isPending` instead of `isLoading` for initial loads

---

## State Management Rules

| State Type        | Tool            | Location                       |
| ----------------- | --------------- | ------------------------------ |
| Server data (API) | React Query     | `use[Feature].ts` hooks → repo |
| Client-only state | Zustand         | `use[Feature]Store.ts`         |
| Form state        | react-hook-form | Inside form components         |
| URL state         | React Router    | `useParams`, `useSearchParams` |

- **NEVER** store server data in Zustand — always use React Query
- Zustand is for client-only concerns: selected team, UI preferences, sidebar state

---

## Page Pattern (Read — Detail Page)

```typescript
// Pages use: query hooks (fetch), service (transform), store (client state), modals
import { useParams } from 'react-router-dom';
import { useModal } from '@ebay/nice-modal-react';
import { useErrorRedirect } from '@/hooks';
import { invariant } from '@/utils/invariant';
import { featureService, useFeature, FEATURE_MODAL } from '@/features/feature';

export const FeaturePage = () => {
  const { id } = useParams();
  invariant(id, 'ID is required');
  const { data, error, isPending } = useFeature(parseInt(id)); // v5 uses isPending
  useErrorRedirect(error);
  // Use featureService for display logic
  // Use useModal for modal triggers
};
```

---

## Form Pattern (Write — Create/Edit)

```typescript
// Forms use: react-hook-form (state), service (transform), repo (API), queryClient (invalidate)
import to from 'await-to-js';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { featureRepo, featureService, featureKey } from '@/features/feature';

const queryClient = useQueryClient();

const onSubmit = async (data) => {
  const payload = featureService.parseFormToPayload(data); // service transforms
  const [err, response] = await to(featureRepo.create(payload)); // repo calls API
  queryClient.invalidateQueries({ queryKey: featureKey.lists() }); // invalidate cache
};
```

---

## Query Keys Pattern

Always use a factory pattern in `[feature].query-keys.ts`:

```typescript
export const featureKey = {
  all: ['feature'] as const,
  lists: () => [...featureKey.all, 'list'] as const,
  list: (params?: object) => [...featureKey.lists(), { params }],
  details: () => [...featureKey.all, 'detail'],
  detail: (id: number) => [...featureKey.details(), id],
};
```

---

## Code Style Rules

1. **Imports** — use `@/` path alias for all imports from `src/`
2. **Import order** — React/libraries → `@/components` → `@/hooks` → `@/utils` → feature imports → relative imports
3. **Barrel exports** — every feature has `index.ts` exporting public API
4. **Feature isolation** — features import other features only via barrel `index.ts`
5. **Async errors** — use `await-to-js`: `const [err, result] = await to(promise)`
6. **CSS classes** — use `cn()` helper from `@/utils/cn` for conditional classes
7. **Env vars** — use `APP_` prefix (not `VITE_`), access via `import.meta.env`
8. **Modals** — register with `@ebay/nice-modal-react`, modal IDs in `modals/constants.ts`
9. **Constants** — typed enums in types file, label/option arrays in constants file
10. **No default exports** — use named exports everywhere

---

## Testing Rules

1. **Service tests** — highest priority, pure functions, easy to test
2. **Utility tests** — pure helper functions
3. **Hook tests** — custom hooks with business logic
4. **Component tests** — UI components with meaningful behavior
5. **Test setup** — root `test.setup.ts` with `@testing-library/jest-dom`
6. **Test location** — service tests next to service file, component tests next to component

---

## Performance Optimization (Vercel Engineering Best Practices)

Apply these rules across all 7 priority levels when writing React code:

> **Note:** Server-Side Performance (Category 3 in the Vercel guide) is omitted — this project is a Vite SPA, not SSR/Next.js.

### 1. Eliminating Waterfalls (CRITICAL)

- **Move await into branches** — Don't await all data upfront if some branches don't need it
- **Use Promise.all()** — Fetch independent data in parallel, not sequentially

```typescript
// ❌ Sequential — second call waits for first
const users = await userRepo.getAll();
const teams = await teamRepo.getAll();

// ✅ Parallel — both fire at once
const [users, teams] = await Promise.all([userRepo.getAll(), teamRepo.getAll()]);
```

- **Use Suspense boundaries** — Stream content progressively instead of waiting for all data

### 2. Bundle Size Optimization (CRITICAL)

- **Avoid barrel imports for third-party libs** — Import directly: `import { format } from 'date-fns/format'` not `from 'date-fns'`
- **Within a feature, import directly** — Don't go through your own barrel: `import { taskRepo } from '../task.repo'`
- **Cross-feature imports use barrel** — `import { useTeamStore } from '@/features/team'` (via `index.ts`)
- **Dynamic imports for heavy components** — Use lazy loading for components not needed on first paint

```typescript
import { lazy, Suspense } from 'react';

// ✅ Lazy load heavy route pages
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);

// In router config
{
  path: AppRoutes.Dashboard,
  element: (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPage />
    </Suspense>
  ),
}
```

- **Defer third-party scripts** — Load analytics, logging, tracking after hydration (use `useEffect`)
- **Conditional module loading** — Load modules only when feature is activated
- **Preload on interaction** — Preload resources on hover/focus for perceived speed

### 3. Client-Side Data Fetching (MEDIUM-HIGH)

- **Automatic request deduplication** — React Query v3 deduplicates requests in-flight (built-in via `queryFn`)
- **Deduplicate global event listeners** — Register listeners once, clean up in effect return
- **Use passive event listeners** — Add `{ passive: true }` to scroll/touch listeners unless `preventDefault()` is needed
- **Cache localStorage reads** — Read once into a variable, don't call `localStorage.getItem()` repeatedly

### 4. Re-render Optimization (MEDIUM)

- **Don't subscribe to state only used in callbacks** — Use refs for stable callbacks instead of state dependencies
- **Extract expensive work into memoized components** — Use `React.memo()` for components with expensive render logic
- **Use primitive dependencies** — In useEffect, depend on primitives not objects/arrays
- **Subscribe to derived values** — Use selectors to subscribe to specific computed booleans, not raw state
- **Functional setState** — `setState(prev => prev + 1)` for stable callbacks in useCallback

```typescript
// ❌ Requires `count` in dependency array, recreates callback on every change
const increment = useCallback(() => setCount(count + 1), [count]);

// ✅ No dependency needed, callback is stable
const increment = useCallback(() => setCount((prev) => prev + 1), []);
```

- **Lazy state initialization** — `useState(() => expensiveComputation())` to defer expensive setup
- **Use useTransition** — Wrap non-urgent updates to prevent UI jank

### 5. Rendering Performance (MEDIUM)

- **Animate wrapper divs, not SVG** — Animate a div containing SVG, not SVG elements directly
- **Use content-visibility** — CSS property for long lists: `content-visibility: auto` skips rendering offscreen items

```css
/* Apply to list items or card grids with many offscreen items */
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px; /* estimated height to prevent layout shift */
}
```

- **Extract static JSX** — Move JSX that doesn't change outside component definition
- **Reduce SVG precision** — Round SVG coordinates to fewer decimal places
- **Use ternary for conditionals** — Avoid `&&` for rendering (can cause double-render)

### 6. JavaScript Performance (LOW-MEDIUM)

- **Batch DOM/CSS changes** — Use classes or `cssText` instead of setting individual styles in loops
- **Use Map for lookups** — Build `Map` for O(1) lookups in repeated operations
- **Cache object properties** — Store frequently accessed properties in variables
- **Cache function results** — Use module-level `Map` to cache expensive function results
- **Cache localStorage reads** — Read once, store in variable for repeated access
- **Combine iterations** — Merge multiple `filter`/`map` into one loop
- **Check length first** — Validate array length before expensive comparisons
- **Return early** — Exit functions as soon as condition is met
- **Hoist RegExp** — Define regex outside loops
- **Use Set/Map for lookups** — O(1) instead of O(n) array includes
- **Use toSorted()** — Immutable sorting instead of mutable `sort()`

### 7. Advanced Patterns (LOW)

- **Store event handlers in refs** — Use `useRef` to avoid recreating handlers on every render
- **useLatest pattern** — Ref-based hook to get latest value without triggering effects

```typescript
// useLatest hook — avoids stale closures without adding dependencies
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// Usage: stable callback that always reads latest state
const latestFilters = useLatest(filters);
const onScroll = useCallback(() => {
  console.log(latestFilters.current); // always fresh, no re-renders
}, []); // empty deps — never recreated
```

---

## Import Pattern

```typescript
// 1. React & third-party
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import to from 'await-to-js';

// 2. Shared app modules
import { Button, Input } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { cn } from '@/utils/cn';
import { queryClient } from '@/lib/queryClient';

// 3. Other features (via barrel)
import { useTeamStore } from '@/features/team';

// 4. Own feature (via barrel)
import { featureRepo, featureService, featureKey } from '@/features/feature';

// 5. Relative (components, helpers within same feature)
import { FeatureForm } from '../components';
import '../modals/register';
```

---

## Do NOT

- Use `react-query` v3 — use `@tanstack/react-query` v5
- Use `isLoading` for initial load state — use `isPending` (React Query v5)
- Store server data in Zustand — use React Query
- Put API calls in service files — API calls go in repo only
- Put business logic in repo files — logic goes in service only
- Use `VITE_` env prefix — use `APP_`
- Use default exports — use named exports
- Skip the barrel `index.ts` in features
- Put feature-specific components in `src/components/` — keep them in the feature folder
- Use `.sort()` on arrays — use `.toSorted()` to avoid mutation bugs in React state
- Use `&&` for conditional rendering with numbers — use ternary to prevent rendering `0`
- Add scroll/touch listeners without `{ passive: true }` — unless you need `preventDefault()`
- Read `localStorage`/`sessionStorage` repeatedly — cache reads in a variable
- Use `array.includes()` in loops — use `Set.has()` for O(1) lookups
- Mutate props or state arrays/objects — always create new references
- Import entire third-party libs via barrel — import from specific entry points

---

## Barrel Import Clarification

Feature barrel files (`index.ts`) are for **cross-feature imports only**. Within a feature, import directly:

```typescript
// ✅ Cross-feature: use barrel
import { useTeamStore } from '@/features/team';

// ✅ Within same feature: import directly
import { taskRepo } from '../task.repo';
import { taskService } from '../task.service';

// ❌ Within same feature: don't go through barrel
import { taskRepo } from '@/features/task';

// ✅ Third-party: direct entry point
import { format } from 'date-fns/format';

// ❌ Third-party: barrel import (loads entire library)
import { format } from 'date-fns';
```

---

## Error Handling Pattern

Always use `await-to-js` with toast feedback in form handlers:

```typescript
import to from 'await-to-js';
import { Toast, ShowGenericToastError } from '@/components';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const onSubmit = async (formData: FormValues) => {
  const payload = featureService.parseFormToPayload(formData);
  const [err, response] = await to(featureRepo.create(payload));

  if (err) {
    ShowGenericToastError();
    return;
  }

  queryClient.invalidateQueries({ queryKey: featureKey.lists() });
  Toast.fire('Item created');
  navigate(AppRoutes.FeatureList);
};
```

---

## Event Listener Rules

```typescript
// ✅ Passive listeners for scroll/touch (no preventDefault needed)
window.addEventListener('scroll', handler, { passive: true });
window.addEventListener('touchstart', handler, { passive: true });

// ✅ Always clean up in useEffect return
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// ✅ Cache localStorage reads
const cachedTheme = localStorage.getItem('app_theme');
// reuse cachedTheme variable, don't call getItem again
```
