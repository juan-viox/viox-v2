---
slug: mistral-medium-35-remote-agents
title: "Mistral Medium 3.5 ships remote agents — here's why we still wouldn't route production traffic through them"
date: "2026-04-29"
category: "Frontier"
tags: ["mistral", "remote-agents", "agentic-ai", "tool-use", "production-patterns"]
summary: "Mistral just shipped Medium 3.5 with remote agents that execute code server-side. We explain why VioX still orchestrates tool calls client-side — and when remote execution makes sense."
sources: [{"title":"Mistral Medium 3.5 announcement","url":"https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5"}]
---

Mistral dropped Medium 3.5 yesterday with a feature most people missed in the benchmark tables: remote agents that execute tool calls server-side, no orchestration layer needed.

The pitch is simple. Send a prompt, Mistral runs the tools, returns the final answer. One API call instead of the usual loop — prompt, tool call, execute locally, feed result back, repeat. For prototyping or single-user demos, it's fast.

## What Mistral ships

Medium 3.5 is a 22B parameter model. MMLU: 82.4%. HumanEval: 78.9%. Comparable to Claude Sonnet 3.5 on code tasks, cheaper than Opus-class models.

The remote agent feature — what Mistral calls "Vibe Agents" — lets you define tools in the API request. Mistral executes them server-side when the model calls them. You get the final output without writing an orchestration loop.

They support Python execution, web search, file access, and custom function calling. All sandboxed on Mistral infrastructure. Latency: 2-4 seconds per tool invocation, depending on complexity.

## Why we don't route production traffic through remote agents

VioX OS orchestrates tool calls client-side. Every agent — Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder — runs tool execution in our runtime, not the model provider's.

Three reasons:

**1. Observability.** When a tool fails, we need to know why — immediately. Remote execution is a black box. You get an error message if you're lucky. We log every tool call, every parameter, every output. LangSmith and Helicone track token usage and latency per tool. When Closer's CRM write fails at 11pm, we see the exact payload that triggered it.

**2. Tool state lives in our database.** VioX OS agents share context — Closer writes to the same Postgres database that Steward reads from. Remote execution means shipping state back and forth, or maintaining dual truth. We'd rather keep the single source in pgvector and let agents query it directly through our orchestration layer.

**3. Tool diversity.** Mistral supports Python and web search out of the box. VioX OS agents call Twilio, ElevenLabs ConvAI, Stripe, QuickBooks, HubSpot, Airtable, Make, n8n webhooks, and 40+ custom endpoints per deployment. We'd need Mistral to support every SaaS API we touch — or build a translation layer, which defeats the point.

## When remote execution makes sense

Two scenarios where we'd consider it:

**Single-use research tasks.** If you're running a one-off analysis — "scrape these 10 URLs, summarize the pricing pages, output JSON" — remote agents are faster than building an orchestration script. For ad-hoc ops work, it's fine.

**Edge-deployed agents with restricted runtimes.** If you're running an agent on Cloudflare Workers or in a mobile app where you can't spin up a Python runtime, remote execution solves a real problem. You offload the tool environment to the model provider.

For everything else — agents that run 24/7, handle customer data, write to your CRM, or need sub-500ms tool latency — orchestrate locally.

## The production pattern we ship

VioX OS uses LangGraph for orchestration. Every agent is a compiled graph. Tool calls go through our runtime:

1. Model returns a tool call (Claude Sonnet 4.6, GPT-4o, or Gemini 2.5 depending on agent role).
2. LangGraph executes the tool locally — hits our Postgres, our API, our webhook.
3. Tool output gets appended to the message history.
4. Model continues reasoning with the result.

We log every step to LangSmith. Token usage, latency, tool success rate — all visible in real time. When Operator makes 47 tool calls to build a client's Airtable base, we can replay the entire sequence.

Remote agents collapse that loop into one call. You lose observability, you lose control over tool implementation, you lose the ability to optimize hot-path tools. For SMB operations that run 90% of the business — sales, support, ops, hiring — that's a non-starter.

## What this means for the agentic landscape

Mistral's bet: most developers don't want to write orchestration code. They want to describe a task, hand it to the model, get a result. For narrow, stateless tasks, that's probably right.

Our bet: production agentic systems need tight control over tool execution. You can't build an 8-agent OS that runs a real business if every tool call is a black box.

The gap between prototyping and production is orchestration. Remote agents make prototyping faster. They don't make production easier — they just move the complexity from your code to the model provider's runtime. And when that runtime fails, you're debugging without logs.

*The take: remote agents are fine for demos. For anything that handles money, customer data, or runs unsupervised, orchestrate locally.*

## Action

If you're evaluating Mistral Medium 3.5 for production, test it with your real tool set. Run 100 calls through remote execution. Log how often tools fail silently, how long retry loops take, whether you can replay a failed sequence. Then compare that to a LangGraph orchestration layer with full observability.

If you're building an agent that needs to touch your CRM, your database, and your support queue — build the orchestration layer first. You'll need it when the agent goes live and something breaks at 2am.
