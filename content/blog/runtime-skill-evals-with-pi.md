---
slug: runtime-skill-evals-with-pi
title: "Runtime Skill Evals With Pi: Measuring What Agent Skills Actually Change"
description: "How we built a parallel eval harness using the pi coding agent to benchmark 25 agent skills with and without skill context — and what the numbers revealed."
date: "2026-07-10T19:30+03:00"
hidden: false
tags: ["skills", "evaluation", "pi", "agent-skills", "benchmarking"]
---

Skills are context files that change how coding agents behave. But do they actually help? We built a runtime eval harness to find out — and the answer is more interesting than "yes" or "no."

The repo is at [github.com/mihaiserban/skills](https://github.com/mihaiserban/skills) — 29 agent skills for engineering workflows, design translation, git operations, and research. Each skill is a `SKILL.md` file with frontmatter and instructions that an agent loads on-demand.

---

## The Problem

Static review tells you a skill is well-written. It doesn't tell you whether the skill changes outcomes.

A skill that says "always reproduce the bug before fixing it" is good advice. But if the model already does that by default, the skill adds tokens without changing behavior. You need a runtime test: run the same task with and without the skill, grade the outputs, and measure the delta.

This is what [Anthropic's skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) does — spawn subagents with and without the skill, compare results. We wanted the same thing, but using the [pi coding agent](https://pi.dev) as our harness.

---

## The Harness

The eval pipeline has three stages, all scriptable and CI-friendly:

```text
eval-runner.py     →  runs each eval with and without the skill (parallel)
eval-grade.py       →  grades outputs against assertions (batch LLM)
eval-aggregate.py   →  produces benchmark.json + HTML review
```

The runner uses pi with full skill isolation:

```bash
# Without skill: zero skills loaded, no contamination
pi --no-skills --no-extensions -e ~/.pi/agent/extensions/gateway \
   --no-context-files --no-session \
   --model gateway/planner -p "eval prompt"

# With skill: only the tested skill, nothing else
pi --no-skills --no-extensions -e ~/.pi/agent/extensions/gateway \
   --no-context-files --no-session \
   --skill /path/to/SKILL.md \
   --model gateway/planner -p "eval prompt"
```

The `--no-skills` flag prevents all skill discovery. Global skill directories (`~/.agents/skills/`, `~/.pi/agent/skills/`) are physically moved during eval runs to guarantee the baseline can't cheat. The `--skill <path>` flag loads only the tested skill — additive even with `--no-skills`.

For skills with dependencies (like the design orchestrator that routes to picker → apply → audit), the evals.json declares `skill_deps` and the runner passes multiple `--skill` flags.

---

## The Evals

25 skills, 2 evals each, 100 total runs across 8 parallel workers. Each eval has 3-7 assertions that check specific, verifiable outcomes:

```json
{
  "skill_name": "kill-dead-code",
  "evals": [
    {
      "id": 1,
      "name": "remove-unused-function",
      "prompt": "Clean up this module. I think some functions are never called...",
      "assertions": [
        {"id": "identifies-dead", "text": "Identifies all four dead functions", "type": "quality"},
        {"id": "keeps-live", "text": "Keeps the two used exports", "type": "quality"},
        {"id": "warns-exports", "text": "Warns unused exports might be public API", "type": "behavior"}
      ]
    }
  ]
}
```

Grading uses a batch LLM approach: all assertions for one eval variant go to a single `gateway/coder` call. The grader receives the model output in XML tags (to avoid code-fence collision bugs) and returns numbered PASS/FAIL verdicts.

---

## The Numbers

100 runs, 97 completed, 3 timed out (all with_skill — complex code generation). Here's the full benchmark:

| Skill | With Skill | Without Skill | Delta |
|-------|-----------|---------------|-------|
| governance-fanout | 89% | 11% | **+78%** |
| show-first | 85% | 15% | **+69%** |
| design-md-style-audit | 67% | 0% | **+67%** |
| pr-from-diff | 90% | 40% | **+50%** |
| design (orchestrator) | 89% | 44% | **+44%** |
| blog-post | 100% | 60% | **+40%** |
| context-budget | 88% | 50% | **+38%** |
| systematic-debugging | 83% | 50% | **+33%** |
| revert-surgical | 100% | 78% | **+22%** |
| changelog-from-diff | 100% | 80% | **+20%** |
| input-validation | 100% | 80% | **+20%** |
| design-md-style-apply | 83% | 67% | **+17%** |
| design-taste-distiller | 50% | 33% | **+17%** |
| research | 58% | 42% | **+17%** |
| kill-dead-code | 71% | 57% | **+14%** |
| decision-record | 100% | 89% | **+11%** |
| adversarial-verify | 100% | 90% | **+10%** |
| sql-review | 70% | 60% | **+10%** |
| secret-scan | 36% | 27% | **+9%** |
| clean-commits | 100% | 91% | **+9%** |
| design-md-style-picker | 100% | 100% | 0% |
| bisect-regression | 100% | 100% | 0% |
| contract-test | 90% | 90% | 0% |
| rebase-safely | 80% | 80% | 0% |
| domain-modeling | 11% | 78% | **-67%** |

**20 of 25 skills show positive delta.** 4 show no measurable difference. 1 shows a negative delta.

---

## What the Deltas Tell You

**Strong positive (+40% to +78%)** — these skills teach structured workflows the model can't improvise. `governance-fanout` (+78%) teaches a plan → delegate → synthesize pattern. `show-first` (+69%) enforces wireframe-before-code. `design-md-style-audit` (+67%) provides an audit rubric the model doesn't invent on its own.

**Moderate positive (+9% to +20%)** — the skill adds a behavior the model sometimes does but not reliably. `revert-surgical` ensures `git bisect reset` is mentioned. `changelog-from-diff` enforces a specific output format.

**Zero delta** — the model already handles the task well, or the assertions don't capture what the skill changes. `contract-test` scores 90%/90% — the model writes good contract tests by default. `rebase-safely` scores 80%/80% — git rebase is well-known territory.

**Negative delta (-67%)** — `domain-modeling` makes the model more cautious: it refuses to act without full domain context, which is the skill's intent but doesn't score well on synthetic prompts that provide the context upfront. The skill is correct; the eval is wrong.

---

## Running the Benchmark

```bash
# Full pipeline: run → grade → aggregate, all skills, 8 parallel workers
bash scripts/start-evals.sh --all --parallel 8

# Or step by step
python3 scripts/eval-runner.py --all --parallel 8
python3 scripts/eval-grade.py --all --parallel 8 --model gateway/coder
python3 scripts/eval-aggregate.py --all --output html
```

Each skill gets `eval-results/iteration-1/` with `benchmark.json`, `benchmark.md`, and a `review.html` showing per-eval outputs and assertion pass/fail.

The runner handles skill dependencies — skills that reference other skills (like the design orchestrator routing to picker → apply → audit) declare `skill_deps` in their `evals.json`, and the runner loads them via multiple `--skill` flags.

---

## Bottom line

Agent skills are software. They need tests. A 100-run benchmark takes ~15 minutes with 8 parallel workers and tells you exactly which skills earn their context budget and which are dead weight.

The full skill pack — 29 skills, eval harness, and all evals — is at [github.com/mihaiserban/skills](https://github.com/mihaiserban/skills). Clone it, run `bash scripts/start-evals.sh --all`, and see what your skills actually do.