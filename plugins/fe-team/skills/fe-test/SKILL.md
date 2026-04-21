---
name: fe-test
description: Generate tests for existing components (unit, component, E2E)
user_invocable: true
arguments:
  - name: path
    description: File or directory path to generate tests for
    required: true
  - name: type
    description: "Test type: unit, component, e2e, or all (default: all)"
    required: false
---

# Generate Frontend Tests

Create comprehensive tests for existing code.

## Workflow

1. Read and analyze the code at `$ARGUMENTS.path`
2. Spawn **fe-tester** to generate tests:
   - Identify component behavior, interactions, and edge cases
   - Determine appropriate test type(s): `$ARGUMENTS.type`
   - Write test files colocated with source code
   - Run the tests to verify they pass

## Test Types

- **unit**: Pure function tests (utils, helpers, transforms)
- **component**: Vitest + Testing Library (render, interact, assert)
- **e2e**: Playwright browser tests (user flows)
- **all**: Generate all applicable test types

## Arguments

- **path**: `$ARGUMENTS.path`
- **type**: `$ARGUMENTS.type` (default: "all")
