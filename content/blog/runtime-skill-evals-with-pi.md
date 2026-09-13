---
slug: runtime-skill-evals-with-pi
title: "Runtime Skill Evals With Pi: Measuring What Agent Skills Actually Change"
description: "How we built a parallel eval harness using the pi coding agent to benchmark 25 agent skills with and without skill context."
date: "2026-07-10T19:30+03:00"
hidden: false
tags: ["skills", "evaluation", "pi", "agent-skills", "benchmarking"]
---

We ran the same coding tasks with and without agent skills, then compared the outputs against a set of assertions. This post covers the harness and the results from 25 skills.

The [repository](https://github.com/mihaiserban/skills) contains 29 agent skills for engineering workflows, design translation, git operations and research. Each skill is a `SKILL.md` file with frontmatter and instructions that an agent loads on-demand.

---

## The Problem

Static review tells you a skill is well-written. It doesn't tell you whether the skill changes outcomes.

A skill that says "always reproduce the bug before fixing it" is good advice. But if the model already does that by default, the skill adds tokens without changing behavior. You need a runtime test: run the same task with and without the skill, grade the outputs, and measure the delta.

This is what [Anthropic's skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) does: spawn subagents with and without the skill and compare results. We wanted the same thing, but using the [pi coding agent](https://pi.dev) as our harness.

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

The `--no-skills` flag prevents all skill discovery. Global skill directories (`~/.agents/skills/`, `~/.pi/agent/skills/`) are physically moved during eval runs to guarantee the baseline can't cheat. The `--skill <path>` flag explicitly loads the tested skill alongside `--no-skills`.

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

Of 100 runs, 97 completed and 3 timed out. All three timeouts were in the `with_skill` variant during code generation. The table shows assertion pass rates; delta is the percentage-point difference between the displayed rates.

| Skill | With Skill | Without Skill | Delta |
|-------|-----------|---------------|-------|
| governance-fanout | 89% | 11% | +78 pp |
| show-first | 85% | 15% | +70 pp |
| design-md-style-audit | 67% | 0% | +67 pp |
| pr-from-diff | 90% | 40% | +50 pp |
| design (orchestrator) | 89% | 44% | +45 pp |
| blog-post | 100% | 60% | +40 pp |
| context-budget | 88% | 50% | +38 pp |
| systematic-debugging | 83% | 50% | +33 pp |
| revert-surgical | 100% | 78% | +22 pp |
| changelog-from-diff | 100% | 80% | +20 pp |
| input-validation | 100% | 80% | +20 pp |
| design-md-style-apply | 83% | 67% | +16 pp |
| design-taste-distiller | 50% | 33% | +17 pp |
| research | 58% | 42% | +16 pp |
| kill-dead-code | 71% | 57% | +14 pp |
| decision-record | 100% | 89% | +11 pp |
| adversarial-verify | 100% | 90% | +10 pp |
| sql-review | 70% | 60% | +10 pp |
| secret-scan | 36% | 27% | +9 pp |
| clean-commits | 100% | 91% | +9 pp |
| design-md-style-picker | 100% | 100% | 0 pp |
| bisect-regression | 100% | 100% | 0 pp |
| contract-test | 90% | 90% | 0 pp |
| rebase-safely | 80% | 80% | 0 pp |
| domain-modeling | 11% | 78% | -67 pp |

**20 of 25 skills show positive delta.** 4 show no measurable difference. 1 shows a negative delta.

---

## What the Deltas Tell You

**Largest improvements.** The biggest gains came from skills specifying a workflow: plan → delegate → synthesize for `governance-fanout`, a wireframe before code for `show-first`, and an audit rubric for `design-md-style-audit`. The results show higher assertion pass rates on these tasks; they do not establish what the model could never do without a skill.

**Smaller improvements.** Other skills helped with particular assertions, such as a cleanup step in a git workflow or the output format required by `changelog-from-diff`. Inspect the individual outputs to see which behavior changed.

**No measured difference.** `contract-test` scored 90% with and without its skill; `rebase-safely` scored 80% in both variants. Equal scores could mean the skill adds little on these tasks, or that the assertions miss the behavior it changes.

**Lower score with the skill.** `domain-modeling` scored 11% with the skill and 78% without it. The skill-loaded variant asked for more domain context. Review whether that request was warranted by the prompt before deciding whether to change the skill or the evaluation.

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

Skills that reference other skills, such as the design orchestrator routing to picker → apply → audit, declare `skill_deps` in `evals.json`. The runner loads these dependencies with additional `--skill` flags.

---

## Reviewing a run

The recorded 100-run benchmark took about 15 minutes with 8 parallel workers. Use the per-eval outputs to investigate score changes and timeouts. Two evals per skill and an LLM grader are a starting point for finding problems, not a general verdict on each skill.

The [repository](https://github.com/mihaiserban/skills) includes the 29 skills, harness and evals. Run `bash scripts/start-evals.sh --all` to generate the results and review artifacts.
