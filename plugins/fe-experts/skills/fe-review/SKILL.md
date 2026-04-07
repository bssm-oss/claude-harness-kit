---
name: fe-review
description: Run performance + testing review on existing components
user_invocable: true
arguments:
  - name: path
    description: File or directory path to review
    required: true
---

# Frontend Code Review

Run the Producer-Reviewer pipeline on existing code.

## Workflow

1. Read the target files at `$ARGUMENTS.path`
2. Spawn **fe-perf** and **fe-tester** in parallel:

### fe-perf Review
- Bundle size impact analysis
- Server vs client component boundaries
- Unnecessary re-renders
- Missing lazy loading or Suspense boundaries
- Memoization correctness

### fe-tester Review
- Test coverage assessment
- Missing test cases
- Write any missing tests

3. Collect results and present a unified review with:
   - Critical issues (must fix)
   - Warnings (should fix)
   - Suggestions (nice to have)
   - Test files created or updated
