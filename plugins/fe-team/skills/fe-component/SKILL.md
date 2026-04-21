---
name: fe-component
description: Create a new React component with architecture review, implementation, styling, and tests
user_invocable: true
arguments:
  - name: name
    description: Component name (e.g., "UserCard", "SearchBar")
    required: true
  - name: type
    description: "server or client (default: server)"
    required: false
  - name: feature
    description: Feature area for file placement (e.g., "auth", "dashboard")
    required: false
---

# Create Frontend Component

Build a complete React component through the Expert Pool pipeline.

## Workflow

1. **Architecture** (fe-architect): Design the component spec
   - Determine server vs client component
   - Define prop interfaces and state requirements
   - Plan file structure and data flow

2. **Implementation** (fe-implementer): Build the component
   - Write TypeScript component code
   - Set up Jotai atoms if needed
   - Wire up data fetching (server) or interactivity (client)

3. **Styling** (fe-styler): Apply visual design
   - Add Tailwind classes with responsive breakpoints
   - Ensure dark mode support
   - Verify WCAG AA accessibility

4. **Review** (fe-perf + fe-tester in parallel):
   - fe-perf: Check bundle impact, re-render scope, lazy loading
   - fe-tester: Write Vitest + Testing Library tests

## Arguments

- **name**: `$ARGUMENTS.name` — The component name
- **type**: `$ARGUMENTS.type` — server (default) or client
- **feature**: `$ARGUMENTS.feature` — Feature area for file organization

## Execution

Start by spawning fe-architect with:
```
Design a React component: $ARGUMENTS.name
Type: ${ARGUMENTS.type || "server"}
Feature area: ${ARGUMENTS.feature || "general"}

Provide the component spec, then delegate to fe-implementer for implementation.
After implementation, delegate to fe-styler for styling.
Finally, trigger parallel review with fe-perf and fe-tester.
```
