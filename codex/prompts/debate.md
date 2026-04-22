# debate

Run the adversarial debate harness for a contested decision.

## Usage

/debate <question> --option-a <A> --option-b <B>

Example: /debate "PostgreSQL vs MongoDB?" --option-a PostgreSQL --option-b MongoDB

## Instructions

Arguments: $*

1. Run the following shell command exactly as-is with the provided arguments:
   ```
   codex-harnesses $*
   ```
2. Wait for all four stages to complete (advocate-a → advocate-b → devil's advocate → judge).
3. Display the full output verbatim.
