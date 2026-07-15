---
slug: neural-router-assembly-reconstruction
title: "A 5K-Parameter Router That Reads Your Intent Before Spending Your Money"
date: "2026-07-15T20:30+03:00"
hidden: false
tags: ["llm", "router", "coding", "ai-agents"]
---

I run an AI gateway between my coding agents and a pool of LLM providers. It handles health checks, failover, and model resolution. But it had one blind spot: it never looked at the *content* of what I was asking.

Every request was routed based on whatever model the agent picked. That works, but it wastes money. An exploration task — "search the codebase for User model references" — doesn't need a reasoning-heavy model at $0.56/M output tokens. A cheaper model at 20× less would do fine.

So I built a neural router that reads the *first user message* and classifies it into one of four task types: **explore**, **plan**, **build**, or **quick**. Based on the task type, the gateway picks the right model pool and reasoning effort. The classifier: a 5,120-parameter linear layer on top of Qwen-0.6B.

---

## The Architecture

The router is a sidecar service. The gateway calls it over HTTP, falls back to the default model if it's unreachable, and opens a circuit breaker after the first failure. If the router dies, the gateway doesn't care — it just falls back to the safe default.

The head design is borrowed from [TRINITY](https://arxiv.org/abs/2512.04695) (Xu et al., ICLR 2026): a single weight matrix with no bias and no activation. At inference, the encoder runs the user message through Qwen3-0.6B, extracts a 1024-dimensional hidden state from the final layer (mean-pooled across all tokens, L2-normalized), and multiplies by the head. That's it.

The output maps directly into the gateway's routing config — task type selects the model pool, reasoning effort selects the reasoning depth.

---

## Training Data Came From My Own Sessions

I didn't have to collect new data. opencode stores every session in a SQLite database — 18,000+ messages across 500 sessions. Each session has an `agent` field: the task type opencode already inferred. That was my label.

I mapped the existing agent labels to my four task types. The `quick` category was carved out heuristically from build sessions — anything containing "commit", "git push", "bash", "run" got labeled quick instead. 809 labeled samples total.

---

## Training: From 47% to 79%

First pass was disappointing. Penultimate-token encoding + SGD got stuck at 47.5% task accuracy. The hidden states for different task types were almost indistinguishable — all coding prompts look similar under cosine similarity.

Two changes fixed it:

**Mean pooling instead of penultimate token.** The penultimate token only captures the last word's context. Mean-pooling across all tokens carries the full query semantics. The TRINITY paper uses penultimate for multi-turn transcripts where the last word is the role signal — but for single-message classification, mean pooling works better.

**Adam with class-weighted loss.** The build class dominated (383 samples vs. 53 explore). Without weights, the head leaned toward build. With inverse-frequency class weights and Adam at lr=0.001, convergence was smooth — 78.6% task accuracy and 91.2% reasoning accuracy at epoch 200.

---

## Inference on Apple Silicon

Qwen3-0.6B runs on MPS. The entire stack — encoder + head — is a single Python process with FastAPI. Latency on an M3 Max: **96ms warm, 624ms cold start**. The head weights file is 30KB.

The plan/build boundary is the hardest classification problem — "design system architecture" and "write a function" both look like structured tasks with similar vocabulary. The head leans toward build for anything code-related, which is the safe default: a coding task can't be ruined by too much capability.

---

## What's Next

**Deployment-level optimization.** Right now the router picks a model pool. The next step is per-deployment scoring within a pool — the cheapest available provider that's healthy and close to the latency target gets the request. This is where CMA-ES (the TRINITY paper's training algorithm) comes in, optimizing for `quality - λ × cost`.

**Self-improving C-A-F loop.** The [Agent-as-a-Router](https://arxiv.org/abs/2606.22902) paper (Zhou et al., 2026) describes a Context-Action-Feedback loop where the router learns from every outcome. My gateway already logs usage events to Postgres — token counts, latency, served deployment, cache hits. Adding a Verifier (execution success) and a Memory module (vector store of past routing decisions) turns the router from a static classifier into an online learner.

**Avoiding routing collapse.** The [When Routing Collapses](https://arxiv.org/abs/2602.03478) paper (Lai & Ye, 2026) shows a pervasive failure mode: routers default to the most expensive model as the cost budget increases, even when cheaper models suffice. Their fix — learning rankings instead of scalar scores — is something I'll adopt when moving to deployment-level routing.

---

## Bottom Line

A 5,120-parameter linear layer trained on my own 809 coding sessions classifies requests with enough accuracy to route cheap models to exploration tasks. The entire router runs locally on Apple Silicon in under 100ms. If the router dies, the gateway doesn't care — it just falls back to the safe default.