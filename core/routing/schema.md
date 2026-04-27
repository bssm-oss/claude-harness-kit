# Routing Schema

Codex harness routing returns a JSON object with:

```json
{
  "request": "Redis vs Memcached 결정해줘",
  "team": "debate",
  "confidence": 0.9,
  "reason": "matched debate trigger",
  "requires_confirmation": false,
  "option_a": "Redis",
  "option_b": "Memcached",
  "chain": []
}
```

`team` is one of `debate`, `explore`, `review`, `research`, or `unknown`.
`requires_confirmation` is true when routing is low confidence or required team inputs are missing.
