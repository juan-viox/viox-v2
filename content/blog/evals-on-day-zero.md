---
slug: evals-on-day-zero
title: "Evals on day zero — why VioX OS ships every agent with a test suite"
date: "2026-04-28"
category: "Stack"
tags: ["evals", "agentic", "production", "viox-os"]
summary: "An agent without evals is a complaint waiting to happen. Here's the discipline we hard-code into every VioX OS deployment, and the eval suite every one of our eight agents ships with."
sources: []
---

You can tell which AI agents are going to fail in production by asking one question: how do you measure when this agent gets worse?

Most of the answers are some version of *we don't*. The team built an agent. It worked in their tests. It went live. They're hoping it still works. When a customer complains, they'll find out.

That's how an "AI initiative" becomes "the AI thing that keeps embarrassing us." It's also why we hard-code a different rule into every VioX OS deployment: no agent ships without an eval suite. Not "we'll add evals later." Day zero, before the agent talks to a real user.

## Why evals, why up front

Three reasons.

**Models drift.** The Claude Sonnet you tested last month is the same name but not the same weights. Anthropic updates checkpoints. Your prompts that worked at temperature 0.7 might over-correct at the new checkpoint. Without evals, you'll find out from a customer.

**Prompts decay.** Every time someone "improves" the prompt to handle one new edge case, they have a 1-in-3 chance of breaking three other cases that were working. Without an eval suite running on every prompt change, prompt engineering is just vibes.

**Tools change.** The CRM API returns a slightly different field. The search API rate-limits one new endpoint. Your agent silently works around it by hallucinating. Evals catch this; humans don't.

If any of those three reasons matter to your business, you need evals. They all matter to every business.

## The eval suite every VioX OS agent ships with

Each of the eight agents — Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder — gets the same four-tier suite at deploy time:

**Tier 1 — Smoke** (~20 cases, runs on every commit)
Does the agent respond at all? Does the response contain the structured output the next step expects? Does tool-calling actually call tools? These run in under 30 seconds; they catch the 60% of failures that are infrastructure problems disguised as model problems.

**Tier 2 — Capability** (~80-150 cases, runs nightly)
Can the Closer agent draft an outreach email when given a Lead and a CRM context? Can the Controller categorize a transaction correctly? Can the Voice agent capture a callback request and post it to Twilio? Curated cases that exercise the agent's actual job. Scored against rubrics — not exact match, since LLM output is non-deterministic.

**Tier 3 — Adversarial** (~30 cases, runs nightly)
Prompt injections. Jailbreaks. Off-topic detours. Customer hostility. Agents that pass capability tests still fail adversarial — and they fail in ways that get screenshot and posted to Twitter. Always run these.

**Tier 4 — Regression** (grows over time)
Every production failure becomes a regression test. Customer complains the Steward agent gave a wrong refund policy on a Tuesday — that conversation gets sanitized, added to the regression set, and runs forever. The eval suite gets sharper every week the agent runs.

## How they run

We run evals through LangSmith and Helicone for the standardized work and Arize for the harder evaluation tasks. Each agent run produces a trace; each trace gets scored against the rubric; the scores get plotted on a dashboard the operator can actually see.

The rule that matters: **a falling score is a fact, not a vibe.** When the Closer's email-quality score drops from 7.4 to 6.8 over a week, we don't argue about whether the agent feels worse. We look at the regression cases that started failing and we fix them.

## What it means in production

When we deploy VioX OS for an SMB, the eval dashboard goes live before the agent does. The operator sees a baseline score on day one. They see the score over time. They see which categories of cases pass and which fail. They have a number to point at when leadership asks "is the AI working?"

That number is the difference between a real AI deployment and an expensive demo.

It also means we — VioX — can't hide behind plausible deniability. If the score drops, our customers see it before we tell them. The pressure to keep quality high is structural, not aspirational.

## What you should do this week

If you're running an AI agent in production right now and you can't answer "what's the eval score this week?" — you have one job for the next five business days.

1. **Pick 20 representative customer interactions** from the last 30 days.
2. **Write the rubric** — 5-7 things a good response should do; 2-3 it should never do.
3. **Run them through your agent** in batch. Score each. Average them. That's your baseline.
4. **Re-run weekly.** If the score moves more than 10%, investigate.

That's it. Twenty cases, scored weekly, is dramatically better than nothing — and dramatically better than what most teams running production agents have today.

If you want a battle-tested eval suite, observability dashboard, and continuous prompt-versioning pre-wired, [VioX OS ships with all of it](/pricing).
