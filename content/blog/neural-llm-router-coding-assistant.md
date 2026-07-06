---
slug: neural-llm-router-coding-assistant
title: "A 7K-Parameter Neural Router That Saved Me Money on AI Coding"
description: "How I trained a 5,000-parameter linear head on top of Qwen-0.6B to classify coding requests by task type, routing cheap models to exploration and reserving expensive ones for complex builds."
date: "2026-07-07T08:00+03:00"
hidden: false
tags: ["llm", "router", "coding", "ai-agents"]
---

I run an AI gateway that sits between my coding agents and a pool of LLM providers. The gateway handles health checks, failover, and model resolution. But it had one blind spot: it never looked at the *content* of what I was asking.

Every request was routed based on whatever model the agent picked — opencode would say "I think this is a coding task, use `coder`" and the gateway would oblige. That works, but it wastes money. An exploration task ("search the codebase for User model references") doesn't need a reasoning-heavy $0.56/M output model. A `deepseek-v4-flash` at 20x cheaper would do fine.

So I built a neural router that reads the *first user message* and classifies it into one of four task types: **explore**, **plan**, **build**, or **quick**. Based on the task type, the gateway picks the right model pool and reasoning effort. The classifier: a 5,120-parameter linear layer on top of Qwen-0.6B.

---

## The architecture

The router is a sidecar service. The gateway calls it over HTTP, falls back to the default model if it's unreachable, and opens a circuit breaker after the first failure.

```text
openCode/Codex → gateway :4100 → router sidecar :5560 → Qwen3-0.6B → head → {task,reasoning}
                                  │
                                  └─ (fallback) config.default_model
```

The head is borrowed from [TRINITY](https://arxiv.org/abs/2512.04695) (Xu et al., ICLR 2026): a single weight matrix `W ∈ R^{7×1024}` — no bias, no activation. Seven logits split into two softmax groups:

| Group | Dimensions | Outputs |
|---|---|---|
| Task type | 4 logits | explore, plan, build, quick |
| Reasoning effort | 3 logits | low, medium, high |

At inference, the encoder runs the user message through Qwen3-0.6B, extracts a 1024-dimensional hidden state from the final layer (mean-pooled across all tokens, L2-normalized), and multiplies by the head. That's it. The output maps 1-to-1 into the gateway's routing config:

```yaml
task_to_combo:
  explore: explorer     # fast/cheap models (deepseek-v4-flash)
  plan: planner         # reasoning models (glm-5.2, deepseek-v4-pro)
  build: coder          # powerful coding models (kimi-k2.7-code)
  quick: coder-fast     # cheap models for commits, bash commands

task_to_reasoning:
  explore: low
  plan: high
  build: high
  quick: low
```

---

## Training data came from my own sessions

I didn't have to collect new data. opencode stores every session in a SQLite database at `~/.local/share/opencode/opencode.db` with 18,000+ messages across 500 sessions. Each session has an `agent` field — the task type opencode already inferred:

```sql
SELECT s.agent, s.model, p.data
FROM session s
JOIN message m ON m.session_id = s.id
JOIN part p ON p.message_id = m.id
WHERE s.agent IN ('build', 'plan', 'explore', 'librarian', 'general')
  AND json_extract(m.data, '$.role') = 'user'
  AND json_extract(p.data, '$.type') = 'text'
```

The `agent` field was my label. I mapped it:

| opencode agent | Task type | Sessions |
|---|---|---|
| explore, librarian | explore | 53 |
| plan | plan | 192 |
| build | build | 383 |
| build (commit, bash, git, etc.) | quick | 181 |

The `quick` split is heuristic — any build message containing "commit", "git push", "bash", "run", etc. got labeled quick instead. 809 labeled samples total.

---

## Training: from 47% to 79%

First pass was disappointing. Penultimate-token encoding + SGD got stuck at 47.5% task accuracy. The hidden states for different task types were almost indistinguishable — all coding prompts look similar under cosine similarity (0.3–0.5 within-class and between-class alike).

Two changes fixed it:

**Mean pooling instead of penultimate token.** The penultimate token only captures the last word's context. Mean-pooling across all tokens carries the full query semantics. The paper uses penultimate for multi-turn transcripts where the last word is the role signal — but for single-message classification, mean pooling works better.

**Adam with class-weighted loss.** The build class dominated (383 samples vs. 53 explore). Without weights, the head leaned toward build. With inverse-frequency class weights and Adam at lr=0.001, convergence was smooth:

| Epoch | Task accuracy | Reasoning accuracy | Loss |
|---|---|---|---|
| 20 | 67.3% | 86.4% | 1.47 |
| 100 | 73.3% | 88.9% | 0.92 |
| 200 | 78.6% | 91.2% | 0.73 |

The reasoning accuracy is high because the labels are deterministic (task→reasoning mapping), but the head still learns meaningful signal from the message content.

---

## Inference on Apple Silicon

Qwen3-0.6B runs on MPS. The entire stack — encoder + head — is a single Python process with FastAPI:

```python
@app.post("/route")
async def route(req: RouteRequest) -> RouteResponse:
    h = encoder.encode_mean_pool(req.transcript)
    task_type, reasoning, debug = head.select(torch.as_tensor(h))
    return RouteResponse(task_type=task_type.value, reasoning_effort=reasoning.value, ...)
```

Latency on an M3 Max: **96ms warm, 624ms cold start**. The head weights file is 30KB.

Sample predictions:

```
"Search the codebase for User model" → explore (70.4%) low (51.0%)
"Write a function to parse markdown"  → build   (68.5%) high (75.8%)
"Commit changes with fix message"     → quick   (66.2%) high (51.0%)
"Design a real-time chat architecture"→ build   (40.3%) high (88.2%)
```

The plan/build boundary is the hardest — "design system architecture" and "write a function" both look like structured tasks with similar vocabulary. The head leans toward build for anything code-related, which is the safe default since a coding task can't be ruined by too much capability.

---

## What's next

**Deployment-level optimization.** Right now the router picks a combo bucket. The next step is per-deployment scoring within a combo — the cheapest available provider that's healthy and close to the latency target gets the request. This is where CMA-ES (the TRINITY paper's training algorithm) comes in, optimizing for `quality - λ × cost`.

**Self-improving C-A-F loop.** The [Agent-as-a-Router](https://arxiv.org/abs/2606.22902) paper (Zhou et al., 2026) describes a Context-Action-Feedback loop where the router learns from every outcome. My gateway already logs usage events to Postgres — token counts, latency, served deployment, cache hits. Adding a Verifier (execution success) and a Memory module (vector store of past routing decisions) turns the router from a static classifier into an online learner.

**Avoiding routing collapse.** The [When Routing Collapses](https://arxiv.org/abs/2602.03478) paper (Lai & Ye, 2026) shows a pervasive failure mode: routers default to the most expensive model as the cost budget increases, even when cheaper models suffice. Their fix — learning rankings instead of scalar scores — is something I'll adopt when moving to deployment-level routing.

---

## Bottom line

A 5,120-parameter linear layer trained on my own 809 coding sessions classifies requests with enough accuracy to route cheap models to exploration tasks. The entire router runs locally on Apple Silicon in under 100ms. If the router dies, the gateway doesn't care — it just falls back to the safe default.
