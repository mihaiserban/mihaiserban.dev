---
slug: neural-router-assembly-reconstruction
title: "Training a Small Classifier to Route Coding Requests"
date: "2026-07-15T20:30+03:00"
hidden: false
tags: ["llm", "router", "coding", "ai-agents"]
---

I run an AI gateway between my coding agents and a pool of LLM providers. It handles health checks, failover, and model resolution, but it does not inspect the content of a request before choosing a routing pool.

I built a neural router that reads the first user message and classifies it as **explore**, **plan**, **build**, or **quick**. The task type selects a model pool and configured reasoning effort. The classifier is a 7,168-weight linear head on top of Qwen3-0.6B.

## The architecture

The router is a sidecar service. The gateway calls it over HTTP, falls back to its configured default if the router is unavailable, and opens a circuit breaker after the first failure.

The head is inspired by [TRINITY](https://arxiv.org/abs/2512.04695), but it is a custom adaptation. It is one weight matrix, `W ∈ R^{7×1024}`, with no bias or activation: 7,168 weights. Seven logits split into four task logits and three reasoning-effort logits.

TRINITY uses a different coordinator head with model-selection and role logits, and tunes additional backbone parameters. This router uses a fixed Qwen3-0.6B encoder and the 7-way head above. It mean-pools the final-layer token states into a 1024-dimensional, L2-normalized vector and multiplies it by the head.

```yaml
task_to_combo:
  explore: explorer     # exploration pool
  plan: planner         # planning pool
  build: coder          # coding pool
  quick: coder-fast     # short-request pool

task_to_reasoning:
  explore: low
  plan: high
  build: high
  quick: low
```

## Training data from my sessions

opencode stores sessions in a SQLite database. Each session has an `agent` field, which I used as a weak task-type label. I mapped the existing labels to four task types. The `quick` category was derived heuristically from build messages containing terms such as "commit", "git push", "bash", or "run".

| opencode agent | Task type | Labeled rows |
|---|---|---|
| explore, librarian | explore | 53 |
| plan | plan | 192 |
| build | build | 383 |
| build (commit, bash, git, etc.) | quick | 181 |

These category counts total 809. The source query can return multiple text parts per session, so a session-level evaluation needs an explicit selection rule and a split that keeps each session's examples together.

## A local training run

In one local run, penultimate-token encoding with SGD reached 47.5% task accuracy. Its hidden-state cosine similarities were 0.3 to 0.5 both within and between these labels, so that representation did not separate the classes well in this dataset.

I changed pooling and optimization for the next run. A penultimate hidden state can attend across the sequence; it is not a representation of only the last word. TRINITY's use of a penultimate state addresses a different coordinator design and input setting. The reported figures do not isolate the contribution of pooling from the optimizer change.

The build class dominated, with 383 rows versus 53 explore rows. I used inverse-frequency class weights and Adam at `lr=0.001`; the epoch-200 training metrics were 78.6% task accuracy, 91.2% reasoning accuracy, and 0.73 loss.

Treat these as training-run metrics. The figures here do not include a held-out split, seed, repeat count, or software versions. They also do not isolate pooling from the optimizer change. The reasoning labels come from the fixed task-to-reasoning mapping, so their accuracy mainly checks whether the head reproduced that derived label.

## Inference on Apple Silicon

Qwen3-0.6B runs on MPS. In a recorded M3 Max run, latency was **96ms warm and 624ms cold start**. The head weights file is 30KB. These are local observations, not a benchmark across machines or workloads.

Task-head predictions from the recorded sample:

```text
"Search the codebase for User model" → explore (70.4%)
"Write a function to parse markdown" → build (68.5%)
"Commit changes with fix message" → quick (66.2%)
"Design a real-time chat architecture" → build (40.3%)
```

The raw reasoning output for the commit example was `high (51.0%)`, while the configuration maps `quick` to `low`. The post does not document how that conflict is handled, so the sample reports task predictions only.

The plan/build boundary was the hardest in this label set. I currently map uncertain coding requests to build, but that is a routing-policy choice, not evidence that it is optimal.

## What's next

**Deployment-level optimization.** The router currently picks a model pool. A future version could score deployments within a pool using health, latency, price, and task success. TRINITY uses sep-CMA-ES to optimize its coordinator under an evaluation budget. A score such as `quality - λ × cost` would be my proposed objective and would need comparable-task measurements before provider selection could rely on it.

**Self-improving C-A-F loop.** [Agent-as-a-Router](https://arxiv.org/abs/2606.22902) describes a Context-Action-Feedback loop with routing, verification, and memory components. My gateway logs usage events to Postgres, including token counts, latency, served deployment, and cache hits. A verifier and a history of routing decisions would make an online-learning extension possible to evaluate; they would not by themselves establish an improvement.

**Avoiding routing collapse.** In their experiments, [When Routing Collapses](https://arxiv.org/abs/2602.03478) describes routers increasingly selecting expensive models as the cost budget rises and proposes ranking-based EquiRouter. I would evaluate a ranking approach when this router moves to deployment-level routing.

This 7,168-weight head uses a local, weakly labeled dataset to select a task pool. It needs a documented split, baseline, repeated evaluation, and cost per successfully completed comparable task before it can support a claim about savings.
