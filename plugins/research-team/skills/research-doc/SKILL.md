---
name: research-doc
description: "Use when you need to research official documentation, library docs, or technical specs; focuses the crawler on docs sites, GitHub READMEs, and changelogs."
trigger: /research-doc
---

# research-doc

Documentation-focused research using the Blackboard pipeline.

## Usage

```
/research-doc <library or spec> <question>
```

## Difference from /research-web

- Crawler prioritizes: official docs, GitHub, npm, MDN, RFC specs
- Skips: blog posts, forums, social media
- Confidence: only HIGH and MEDIUM sources included in synthesis

## Examples

```
/research-doc Zod v4 What changed in the schema API from v3?
/research-doc Hono middleware How do I compose middleware with context sharing?
/research-doc OpenTelemetry Node.js What is the correct way to initialize a tracer?
```
