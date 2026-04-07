---
name: fe-page
description: Create a new Next.js App Router page with layout, loading, and error handling
user_invocable: true
arguments:
  - name: route
    description: "Route path (e.g., '/dashboard', '/settings/profile')"
    required: true
  - name: description
    description: What the page does
    required: true
---

# Create Next.js Page

Build a complete App Router page with all supporting files.

## Workflow

1. **Architecture** (fe-architect):
   - Design the page component hierarchy
   - Plan route groups, layouts, parallel routes if needed
   - Define data fetching strategy (server components, streaming)
   - Determine which sub-components need "use client"

2. **Implementation** (fe-implementer):
   - Create `page.tsx` (server component by default)
   - Create `layout.tsx` if needed
   - Create `loading.tsx` with skeleton UI
   - Create `error.tsx` with error boundary
   - Create `not-found.tsx` if applicable
   - Implement sub-components

3. **Styling** (fe-styler):
   - Apply responsive layout
   - Ensure accessible page structure (landmarks, heading hierarchy)
   - Dark mode support

4. **Review** (fe-perf + fe-tester in parallel):
   - Performance review of the page
   - E2E test for the page route

## Arguments

- **route**: `$ARGUMENTS.route`
- **description**: `$ARGUMENTS.description`

## Files to Generate

For route `$ARGUMENTS.route`:
```
src/app/$ARGUMENTS.route/
  page.tsx        # Main page (server component)
  layout.tsx      # Layout (if new layout needed)
  loading.tsx     # Suspense fallback
  error.tsx       # Error boundary ("use client")
```
