# Orchestration Patterns

claude-harness-kit implements 7 main patterns and 4 cross-cutting patterns.

---

## Main Patterns

### 1. Pipeline

**Teams using it:** dev-team

Sequential transformation. Each stage's output is the next stage's input. Stages cannot run in parallel.

```
Stage A → Stage B → Stage C → Stage D
```

**Use when:** Tasks have strict ordering (you must plan before you implement before you review).

**Trade-off:** Simple to reason about, but one slow stage blocks everything.

---

### 2. Fan-out / Fan-in

**Teams using it:** review-team

Multiple agents work on the same input independently, then results are aggregated.

```
            ┌─ Agent A ─┐
Input ──────┼─ Agent B ─┼──► Aggregator ──► Output
            └─ Agent C ─┘
```

**Use when:** The same artifact needs multiple independent perspectives (e.g., correctness + security + performance).

**Trade-off:** Parallel = fast, but aggregation logic can be complex.

---

### 3. Expert Pool

**Teams using it:** fe-team, be-team

Route to a specialist agent by domain. The orchestrator decides which expert handles which sub-task.

```
Orchestrator ──► Specialist A (if task type = A)
             └──► Specialist B (if task type = B)
             └──► Specialist C (if task type = C)
```

**Use when:** Tasks require deep specialization and the orchestrator can route clearly.

**Trade-off:** Specialists are powerful but require a good orchestrator.

---

### 4. Pipeline + Expert Pool (Hybrid)

**Teams using it:** be-team

Combines sequential stages with expert routing within stages.

```
Stage 1: Architect
  ↓
Stage 2: Implementer + Validator (parallel experts)
  ↓
Stage 3: Resilience / Provider / Security (parallel experts)
  ↓
Stage 4: Tester
```

**Use when:** Complex systems need both ordering guarantees and specialist depth.

---

### 5. Hierarchical Delegation

**Teams using it:** explore-team

A high-capability orchestrator (opus) scouts the problem, then delegates sub-tasks to cheaper specialist agents.

```
Scout (opus) ──► Hypothesizer ──► Evidence ──► Synthesizer
                (delegates)      (reports)     (reports)
```

**Use when:** The problem scope is unknown upfront and requires dynamic planning.

**Trade-off:** Flexible but harder to predict cost.

---

### 6. Adversarial Debate

**Teams using it:** debate-team

Multiple agents argue opposing positions. A devil's advocate challenges both. A judge decides.

```
Advocate A ─┐
             ├──► Devil's Advocate ──► Cross-exam ──► Judge
Advocate B ─┘
```

**Use when:** A decision is contested and bias toward one option is likely.

**Trade-off:** High quality decisions, but slower and higher token cost.

**Key principle:** Moderate disagreement (honest strongest case) outperforms maximal aggression.

---

### 7. Blackboard

**Teams using it:** research-team

Agents share state via files. No explicit handoff messages — each agent reads and writes the shared Blackboard autonomously.

```
Planner ──writes──► plan.md + queries.md
Crawler ──reads──► queries.md ──writes──► findings.md
Reader  ──reads──► findings.md ──writes──► findings.md (enriched)
Synthesizer ──reads──► plan.md + findings.md ──writes──► synthesis.md
```

**Use when:** Long-running tasks where agents may run multiple rounds and share state organically.

**Trade-off:** Flexible and async-friendly, but requires well-defined file schemas.

---

## Cross-cutting Patterns

These patterns apply across multiple teams and are not team-specific.

### a. Reflection Loop

**Applied to:** fe-reflector, be-reflector

After an implementer produces output, a reflector agent critiques it against the original spec. HIGH severity issues loop back to the implementer.

```
Implementer → Reflector → (HIGH issues?) → back to Implementer
                       → (MEDIUM/LOW only) → proceed
```

**Enable:** `reflect: true` in agent frontmatter (default: off).

---

### b. Circuit Breaker

**Applied to:** All *-implementer agents (optional)

Prevents cascading failures by tracking consecutive errors.

```
State machine:
CLOSED ──(3 failures in 60s)──► OPEN
OPEN ──(60s timeout)──► HALF_OPEN
HALF_OPEN ──(1 success)──► CLOSED
HALF_OPEN ──(1 failure)──► OPEN
```

State stored in: `.harness/circuit-state.json`

---

### c. Escalation

**Applied to:** fe-team, be-team (Expert Pool)

When a junior agent fails repeatedly, escalate to a senior agent for re-planning.

```
Junior fails (3 retries)
  → Escalation trigger
  → Senior re-plans approach
  → Junior retries with new plan
```

Log stored in: `.harness/escalation-log.md`

---

### d. Consensus Voting

**Applied to:** review-team, debate-team

When multiple agents produce conflicting outputs, a mediator runs a voting round to resolve conflicts.

In debate-team: max 5 rounds. Tie after round 5 → forced verdict with explicit uncertainty rating.
