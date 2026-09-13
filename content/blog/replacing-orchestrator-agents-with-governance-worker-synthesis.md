---
slug: replacing-orchestrator-agents-with-governance-worker-synthesis
title: "Moving Agent Results into Files and Starting Synthesis with a Fresh Context"
description: "A file-based governance, worker, and synthesis workflow for coding tasks, plus research findings with their evaluation scope."
date: "2026-07-06T00:00+03:00"
hidden: false
tags: ["ai-agents", "llm", "multi-agent", "context-window", "research"]
---

My coding agents previously kept planning, worker results, and synthesis in one orchestrator conversation. On a multi-file refactor, three worker results accumulated in that conversation before the final response. It was difficult to inspect the handoffs or give synthesis a focused input.

That is a constraint of this workflow, not a verdict on every orchestrator design. A coordinator can still be useful for planning and recovery. I changed where it keeps detailed worker output and how synthesis starts.

## The three-stage workflow I implemented

I use three stages backed by filesystem state: governance, a variable number of workers, and synthesis.

```
User → Governance (plans, writes task specs to .agent-state/tasks/*.yaml)
         │
         │  spawns workers with: "Read task spec. Write result to file. Confirm."
         ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Worker 1 │  │ Worker 2 │  │ Worker N │   ← fresh contexts
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
         ▼             ▼             ▼   (writes to disk, returns short confirmation)
    .agent-state/results/*.yaml          ← shared filesystem state
         │
         ▼
    Synthesis agent (fresh context, reads result files, produces final answer)
         │
         ▼
    User ← clean, focused output
```

I configure governance to plan, write task specifications, and delegate rather than perform the assigned unit of work or synthesize the final response. Each worker receives a task-spec path and result path. Workers write structured results to YAML and return a short confirmation. When the fanout finishes, a fresh synthesis agent reads the result files and produces the final response. This separation is a workflow convention; it needs tool permissions if governance must be technically prevented from editing project files.

An illustrative task specification:

```yaml
# .agent-state/tasks/analyze-auth.yaml
goal: audit the authentication module for security issues
constraints: do not modify the database schema
expected_output_path: .agent-state/results/analyze-auth.yaml
context_files: [src/auth/middleware.ts, src/auth/session.ts]
blocked_on: null
```

An illustrative result schema:

```yaml
# .agent-state/results/analyze-auth.yaml
status: ok
summary: example findings from a security review
findings:
  - severity: critical
    summary: example review finding
files_changed: []
blockers: []
verification_gaps:
  - could not verify third-party OAuth callback flow end-to-end
```

The plugin I wrote, replacing the old orchestrator-minion watchdog, adds two capabilities beyond inactivity detection:

1. **Fanout completion tracking**: when all workers for a fanout are done, the plugin nudges governance to start synthesis.
2. **Path-aware recovery**: when a worker stalls, the recovery prompt includes the task-spec and expected-result paths, so governance can inspect the state before deciding whether to wait, re-brief, or report a blocker.

```text
A watched worker may be inactive.
Task spec: .agent-state/tasks/analyze-auth.yaml
Expected result: .agent-state/results/analyze-auth.yaml
Inspect the child session, then decide: wait, re-brief, or report a blocker.
```

## What the workflow changes

For a multi-file refactor, the intended differences are:

| | Before (orchestrator-minion) | After (governance-worker-synthesis) |
|---|---|---|
| Governance context | Detailed worker results in the same conversation | Worker confirmations and paths |
| Handoff format | Natural language summaries | Structured YAML on disk |
| Synthesis context | Same orchestrator conversation | Fresh context reading result files |
| Stale worker recovery | Session-only prompt | Task-spec and result paths included |

The synthesis stage receives finished result files rather than governance discussion, worker chatter, and recovery prompts. That makes its input easier to inspect and reproduce. These workflow differences do not establish a quality improvement; that would require a controlled comparison on similar tasks.

## Why I chose this structure

**[ExtAgents](https://arxiv.org/abs/2505.21471)** found benefits from distributing external knowledge across agents for its multi-hop question-answering and long-survey tasks. That supports testing parallel work when inputs are independent; it does not establish the same result for coding tasks.

**[ReAcTree](https://arxiv.org/abs/2511.02424)** reports 61% goal success versus 31% for ReAct on WAH-NL with Qwen 2.5 72B. Its task-tree approach is useful when subgoals and dependencies are explicit.

**[The Organizational Behavior of Agentic AI](https://arxiv.org/abs/2606.30986)** finds that human-imitation organization forms often underperform shared-state or adaptive forms under its tested interface conditions. I take that as a reason to make handoffs inspectable, not as a universal architecture rule.

## What still needs work

**Elastic context (ACE).** [ACE](https://arxiv.org/abs/2606.31564) describes adaptive compression for message history. I have not implemented it. If governance itself grows during a large fanout, I would evaluate it against task-specific retrieval and summaries rather than assume one compression strategy is lossless.

**Dependency-aware fanout.** Right now, fanout assumes all workers are fully independent. If task B needs task A's output, governance must serialize them manually. ReAcTree's dynamic tree construction could automate this.

**Structured handoff standardization.** The YAML schemas I use are project-specific. A small vocabulary such as `status`, `findings`, `files_changed`, `blockers`, and `verification_gaps` is a useful starting point, but projects still need fields that match their tools and review process.
