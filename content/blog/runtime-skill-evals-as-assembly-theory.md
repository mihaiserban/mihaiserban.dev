---
slug: runtime-skill-evals-as-assembly-theory
title: "Runtime Skill Evals: An Assembly-Theoretic Reconstruction"
date: "2026-07-15T20:00+03:00"
hidden: false
tags: ["skills", "evaluation", "assembly-theory", "agent-skills", "benchmarking"]
---

Agent skills are context files that change how coding agents behave. But do they *actually* change outcomes — or do they just add tokens to the prompt?

Static review can't answer this. You can read a skill file and conclude it's well-written. That tells you nothing about whether it shifts the model's behavior at runtime. A skill that says "always reproduce the bug before fixing it" is sound advice, but if the model already does that by default, the skill is dead weight — tokens spent, no effect.

You need a runtime test: run the same task with and without the skill, grade the outputs against assertions, and measure the delta. Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) does this via subagent spawning. We wanted the same thing, but using the [pi coding agent](https://pi.dev) as our harness.

The skill pack — 29 agent skills for engineering workflows, design translation, git operations, and research — lives at [github.com/mihaiserban/skills](https://github.com/mihaiserban/skills). Each skill is a `SKILL.md` file with frontmatter and instructions that an agent loads on-demand.

---

## The Method

The eval pipeline has three stages, all scriptable and CI-friendly:

```text
eval-runner    →  runs each eval with and without the skill (parallel)
eval-grader    →  grades outputs against assertions (batch LLM)
eval-aggregator →  produces benchmark + review artifacts
```

The hardest-won insight is **skill isolation**. Without it, your baseline cheats. Global skill directories must be physically relocated during eval runs so the "without skill" variant can't accidentally load a skill from the environment. The "with skill" variant loads *only* the tested skill — nothing else contaminates the context.

For skills with dependencies (an orchestrator that routes to sub-skills, for instance), the eval declares those dependencies and the runner loads them all. Composition is a real architectural concern, not an afterthought.

Each eval carries 3–7 assertions that check specific, verifiable outcomes. Grading uses a batch LLM approach — all assertions for one eval variant go to a single model call, which returns numbered PASS/FAIL verdicts. This keeps grading cheap and consistent.

---

## The Numbers

25 skills. 2 evals each. 100 total runs across 8 parallel workers.

97 completed. 3 timed out — all in the "with skill" variant, where the skill triggered more complex code generation. That's a signal, not just a failure: the skill pushed the model to do *more*.

**20 of 25 skills show positive delta.** 4 show no measurable difference. 1 shows a negative delta.

---

## What the Deltas Tell You

The deltas fall into four regimes, each telling you something different:

**Strong positive (+40% to +78%)** — these skills teach structured workflows the model can't improvise. A governance skill that enforces plan → delegate → synthesize. A design skill that mandates wireframe-before-code. An audit skill that provides a rubric the model doesn't invent on its own. The model has no internal prior for these workflows; the skill supplies the structure, and the delta is large.

**Moderate positive (+9% to +20%)** — the skill adds a behavior the model sometimes does but not reliably. Ensuring a specific git cleanup step. Enforcing a particular output format. The model *could* do this without the skill, but it doesn't *always*. The skill converts "sometimes" into "consistently."

**Zero delta** — two possible explanations, and both matter. Either the model already handles the task well (the skill is redundant), or the assertions don't capture what the skill actually changes (the eval is blind to the skill's effect). You need to distinguish between these before deciding the skill is useless.

**Negative delta (-67%)** — the skill made the model *more cautious*: it refused to act without full domain context. That's the skill's intent. But the synthetic eval prompt provided the context upfront, so the caution manifested as hesitation, not wisdom. **The skill was correct. The eval was wrong.** This is the most important finding: a negative delta doesn't mean the skill is broken. It might mean your test is.

---

## The Thesis

Agent skills are software. They need tests.

A 100-run benchmark takes ~15 minutes with 8 parallel workers. It tells you exactly which skills earn their context budget and which are dead weight. It tells you which skills are correct but mis-evaluated. It tells you where the model already does the right thing and where a skill fills a real gap.

Without runtime evals, you're shipping context files on faith. With them, you're shipping them on evidence.

The full skill pack — 29 skills, eval harness, and all evals — is at [github.com/mihaiserban/skills](https://github.com/mihaiserban/skills). Clone it, run the eval pipeline, and see what your skills actually do.