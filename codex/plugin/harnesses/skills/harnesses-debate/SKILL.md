---
name: harnesses-debate
description: "Use when the user asks for a contested decision, architecture or design tradeoff, A vs B comparison, or asks which option is better; automatically runs the harnesses debate team."
---

# Harnesses Debate

Use this skill when the user asks Codex to choose between two options, compare tradeoffs, make a contested technical decision, or answer phrasing such as "A vs B", "which is better", "둘 중 뭐가 나아", "결정해줘", "비교해서 골라줘", or "판정해줘".

Do not answer directly from the base model when two options can be identified. Run the debate harness and show its output.

## Workflow

1. Identify the user request and the two options.
2. If two options are explicit or strongly implied, run:

```bash
codex-harnesses run "<user request>" --team debate --option-a "<option A>" --option-b "<option B>"
```

If Codex reports that the configured default model requires a newer Codex version, retry once with `--model gpt-5.2`.

3. If options are already written as `A vs B`, `A versus B`, or `A or B`, you may run:

```bash
codex-harnesses run "<user request>"
```

4. If there are fewer than two options, or more than two plausible options, ask one short clarification question before running anything.
5. Display the full output, including Advocate A, Advocate B, Devil's Advocate, and Judge's Verdict.
6. Include the saved run id when the command reports one.
