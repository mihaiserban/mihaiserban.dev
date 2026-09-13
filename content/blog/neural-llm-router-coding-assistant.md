---
slug: neural-llm-router-coding-assistant
title: "Training a Small Classifier to Route My Coding Requests"
description: "How I adapted a 7,168-weight linear head on top of Qwen3-0.6B to classify coding requests by task type and choose a routing pool."
date: "2026-07-07T08:00+03:00"
hidden: false
tags: ["llm", "router", "coding", "ai-agents"]
---

I run an AI gateway that sits between my coding agents and a pool of LLM providers. The gateway handles health checks, failover, and model resolution. But it had one blind spot: it never looked at the *content* of what I was asking.

Every request was routed based on whatever model the agent picked — opencode would say "I think this is a coding task, use `coder`" and the gateway would oblige. That leaves the gateway unable to distinguish an exploration request such as "search the codebase for User model references" from a request that needs a stronger coding model.

So I built a neural router that reads the *first user message* and classifies it into one of four task types: **explore**, **plan**, **build**, or **quick**. The task type selects a model pool and a configured reasoning effort. The classifier is a 7,168-weight linear head on top of Qwen3-0.6B.

---

## The architecture

The router is a sidecar service. The gateway calls it over HTTP, falls back to the default model if it's unreachable, and opens a circuit breaker after the first failure.

```text
openCode/Codex → gateway :4100 → router sidecar :5560 → Qwen3-0.6B → head → {task,reasoning}
                                  │
                                  └─ (fallback) config.default_model
```

The head is inspired by [TRINITY](https://arxiv.org/abs/2512.04695) (Xu et al., ICLR 2026), but it is a smaller custom adaptation. It is one weight matrix, `W ∈ R^{7×1024}`, with no bias or activation: 7,168 weights in total. Seven logits split into two softmax groups:

| Group | Dimensions | Outputs |
|---|---|---|
| Task type | 4 logits | explore, plan, build, quick |
| Reasoning effort | 3 logits | low, medium, high |

TRINITY uses a different coordinator head with model-selection and role logits, and tunes additional backbone parameters. This router instead uses a fixed Qwen3-0.6B encoder and the 7-way head above. At inference, it mean-pools the final-layer token states into a 1024-dimensional, L2-normalized vector and multiplies it by the head. The task output maps into the gateway's routing config:

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

---

## Training data came from my own sessions

I did not collect a separate dataset. opencode stores sessions in a SQLite database at `~/.local/share/opencode/opencode.db`. Each session has an `agent` field, which I used as a weak task-type label:

```sql
SELECT s.agent, s.model, p.data
FROM session s
JOIN message m ON m.session_id = s.id
JOIN part p ON p.message_id = m.id
WHERE s.agent IN ('build', 'plan', 'explore', 'librarian', 'general')
  AND json_extract(m.data, '$.role') = 'user'
  AND json_extract(p.data, '$.type') = 'text'
```

The `agent` field was my label. I mapped it as follows:

| opencode agent | Task type | Labeled rows |
|---|---|---|
| explore, librarian | explore | 53 |
| plan | plan | 192 |
| build | build | 383 |
| build (commit, bash, git, etc.) | quick | 181 |

The `quick` split is heuristic: build messages containing terms such as "commit", "git push", "bash", or "run" were relabeled quick. These category counts total 809. The query can return multiple text parts per session, so a session-level evaluation needs an explicit selection rule and a split that keeps each session's examples together.

---

## A local training run

In one local run, penultimate-token encoding with SGD reached 47.5% task accuracy. Its hidden-state cosine similarities were 0.3–0.5 both within and between these labels, so that representation did not separate the classes well in this dataset.

I changed pooling and optimization for the next run:

**Mean pooling instead of the penultimate token.** A penultimate hidden state can attend across the sequence; it is not a representation of only the last word. I switched to averaging token states for single-message classification. TRINITY's use of a penultimate state addresses a different coordinator design and input setting.

**Adam with class-weighted loss.** The build class dominated (383 rows versus 53 explore rows). I used inverse-frequency class weights and Adam at `lr=0.001`:

| Epoch | Task accuracy | Reasoning accuracy | Loss |
|---|---|---|---|
| 20 | 67.3% | 86.4% | 1.47 |
| 100 | 73.3% | 88.9% | 0.92 |
| 200 | 78.6% | 91.2% | 0.73 |

Treat these as training-run metrics: the figures here do not include a held-out split, seed, repeat count or software versions. They also do not isolate the effect of pooling from the optimizer change. The reasoning labels come from the fixed task-to-reasoning mapping, so their accuracy mainly checks whether the head reproduced that derived label.

---

## Inference on Apple Silicon

Qwen3-0.6B runs on MPS. This simplified FastAPI response shape shows the head outputs:

```python
@app.post("/route")
async def route(req: RouteRequest) -> RouteResponse:
    h = encoder.encode_mean_pool(req.transcript)
    task_type, reasoning, debug = head.select(torch.as_tensor(h))
    return RouteResponse(
        task_type=task_type.value,
        reasoning_effort=reasoning.value,
    )
```

The snippet returns the raw head prediction. It does not show which value the gateway ultimately applies when that prediction conflicts with the configuration.

In the recorded M3 Max run, latency was **96ms warm and 624ms cold start**. The head weights file is 30KB. These measurements are local observations, not a benchmark across machines or workloads.

Task-head predictions from the recorded sample:

```
"Search the codebase for User model" → explore (70.4%)
"Write a function to parse markdown"  → build   (68.5%)
"Commit changes with fix message"     → quick   (66.2%)
"Design a real-time chat architecture"→ build   (40.3%)
```

The raw reasoning output for the commit example was `high (51.0%)`, while the shown configuration maps `quick` to `low`. That disagreement needs a defined precedence rule at the gateway. The snippets here do not establish which value it ultimately applies, so the sample table reports only task predictions.

The plan/build boundary was the hardest in this label set: "design system architecture" and "write a function" share structured, code-related vocabulary. I currently map uncertain coding requests to build, but that is a routing policy choice, not evidence that it is optimal.

---

## What's next

**Deployment-level optimization.** Right now the router picks a combo bucket. A future version could score deployments within a bucket using health, latency, price, and task success. TRINITY uses sep-CMA-ES to optimize its coordinator under an evaluation budget. A score such as `quality - λ × cost` would be my own proposed objective and would need comparable-task measurements before I could use it to choose providers.

**Self-improving C-A-F loop.** [Agent-as-a-Router](https://arxiv.org/abs/2606.22902) describes a Context-Action-Feedback loop with routing, verification, and memory components. My gateway already logs usage events to Postgres, including token counts, latency, served deployment, and cache hits. A verifier and a history of routing decisions would make it possible to evaluate an online-learning extension; they would not by themselves establish that it improves routing.

**Avoiding routing collapse.** In their experiments, [When Routing Collapses](https://arxiv.org/abs/2602.03478) describes routers increasingly selecting expensive models as the cost budget rises and proposes ranking-based EquiRouter. I would evaluate a ranking approach when this router moves to deployment-level routing.

---

## Current scope

This 7,168-weight head uses a local, weakly labeled dataset to select a task pool for coding requests. The recorded warm latency was under 100ms on one M3 Max machine. It still needs a documented split, baseline, repeated evaluation, and cost per successfully completed comparable task before it can support a claim about accuracy beyond the training run or about savings. If the router is unavailable, the gateway falls back to its configured default.
