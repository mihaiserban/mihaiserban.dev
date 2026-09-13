---
slug: runtime-skill-evals-as-assembly-theory
title: "Runtime Skill Evals: An Assembly-Theoretic Reconstruction"
date: "2026-07-15T20:00+03:00"
hidden: false
tags: ["skills", "evaluation", "assembly-theory", "agent-skills", "benchmarking"]
---

We compared coding-agent outputs with and without a loaded skill to see which behaviors changed.

Reading a skill can reveal unclear instructions, but runtime tests show how the agent responds to them. For example, a reproduction step adds little on a task where the agent already reproduces the bug without prompting.

You need a runtime test: run the same task with and without the skill, grade the outputs against assertions, and measure the delta. Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) does this via subagent spawning. We wanted the same thing, but using the [pi coding agent](https://pi.dev) as our harness.

The [skill pack](https://github.com/mihaiserban/skills) contains 29 skills for engineering workflows, design translation, git operations and research. Each skill is a `SKILL.md` file with frontmatter and instructions that an agent loads on-demand.

---

## The Method

The eval pipeline has three stages, all scriptable and CI-friendly:

```text
eval-runner    →  runs each eval with and without the skill (parallel)
eval-grader    →  grades outputs against assertions (batch LLM)
eval-aggregator →  produces benchmark + review artifacts
```

The baseline needs **skill isolation**. In this harness, global skill directories are temporarily moved so the baseline cannot discover them. The other variant explicitly loads the tested skill and any declared dependencies.

For skills with dependencies (an orchestrator that routes to sub-skills, for instance), the eval declares those dependencies and the runner loads them all. Composition is a real architectural concern, not an afterthought.

Each eval carries 3–7 assertions that check specific, verifiable outcomes. The grader receives all assertions for one eval variant in a single model call and returns numbered PASS/FAIL verdicts. Those judgments still need review, especially when the score disagrees with the observed behavior.

---

## The Numbers

25 skills. 2 evals each. 100 total runs across 8 parallel workers.

97 runs completed. Three timed out in the "with skill" variant during code generation. The timeouts need investigation alongside the completed-run scores.

**20 of 25 skills show positive delta.** 4 show no measurable difference. 1 shows a negative delta.

---

## What the Deltas Tell You

The score differences suggest several places to inspect the outputs:

**Largest improvements.** Governance, design and audit skills had some of the largest gains in assertion pass rate. They specify a plan → delegate → synthesize workflow, a wireframe before code, or an audit rubric. These results concern the tested tasks, not everything the model can do without those instructions.

**Smaller improvements.** Some gains came from particular assertions, such as a git cleanup step or an output-format requirement. The individual outputs show which step the skill helped with.

**No measured difference.** The skill may add little on a given task, or the assertions may miss the behavior it changes. Equal scores alone do not distinguish these explanations.

**Lower score with the skill.** The domain-modeling variant asked for more context and scored 67 percentage points lower. Review the prompt and response to decide whether the request was warranted. The score alone cannot tell you whether the skill or the evaluation needs changing.

---

## Reviewing the results

The recorded 100-run benchmark took about 15 minutes with 8 parallel workers. Its per-eval outputs help identify changed behavior and failures. With two evals per skill and an LLM grader, broader conclusions need more tasks, repeated runs and a review of the judgments.

The [repository](https://github.com/mihaiserban/skills) includes the skills, harness and evals needed to run the comparison.