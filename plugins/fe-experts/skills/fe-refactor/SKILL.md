---
name: fe-refactor
description: Refactor components for better performance, accessibility, or architecture
user_invocable: true
arguments:
  - name: path
    description: File or directory path to refactor
    required: true
  - name: goal
    description: "What to optimize (e.g., 'performance', 'accessibility', 'server-components', 'state-management')"
    required: true
---

# Frontend Refactor

Refactor existing code with a specific optimization goal.

## Workflow

1. **Analysis** (fe-architect):
   - Read current code at `$ARGUMENTS.path`
   - Analyze against goal: `$ARGUMENTS.goal`
   - Design the refactored architecture
   - Identify breaking changes

2. **Implementation** (fe-implementer):
   - Apply the refactoring changes
   - Maintain backwards compatibility where possible
   - Update imports and dependent files

3. **Goal-Specific Review**:
   - If goal is `performance` → fe-perf validates improvements
   - If goal is `accessibility` → fe-styler validates WCAG compliance
   - If goal is `server-components` → fe-perf validates client/server boundaries
   - If goal is `state-management` → fe-architect validates Jotai patterns

4. **Testing** (fe-tester):
   - Update existing tests for refactored code
   - Ensure no regressions

## Arguments

- **path**: `$ARGUMENTS.path`
- **goal**: `$ARGUMENTS.goal`
