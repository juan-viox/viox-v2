---
slug: six-layer-agentic-stack
title: "The 6-layer agentic stack we deploy for SMBs"
date: "2026-04-29"
category: "Stack"
tags: ["agentic", "architecture", "claude", "langgraph", "vercel"]
summary: "Reasoning at the bottom, business outcomes at the top. The architecture we run inside every VioX OS deployment — and why each layer earns its place."
sources: []
---

Most "AI agents" shipped this year are a CRUD app with a prompt taped on. They answer questions, then forget. They don't reason across steps. They don't have memory. They can't recover from a tool failure. When a customer asks them something the prompt didn't anticipate, they invent.

That's not what we ship.

Every system VioX puts into production runs through six layers — engineered top-to-bottom, nothing glued on. Reasoning at the bottom; the business outcome at the top. This is the stack inside every VioX OS deployment, and it's the same one we use when we architect bespoke agentic systems for ambitious operators.

## 01 — Reasoning

Frontier models with structured output and grounding. Claude Sonnet 4.6 for the production tier; Claude Opus 4.6 for tasks where cost-of-error dominates cost-of-tokens; GPT-4o and Gemini for ensemble work where we want a second opinion. We fine-tune smaller models — Llama 3 8B, Phi-4 — for the high-volume narrow tasks the frontier doesn't need to touch.

The take: never run on one model. Production agents fail in model-specific ways, and a mono-model deployment is a single point of failure.

## 02 — Tool use

Function calling, code execution, browser, MCP servers. This is where most of the work actually happens — the agent isn't smart because it knows things, it's smart because it can *do* things. CRM tools, search tools, computer use, custom MCP servers we write per client.

The pattern that wins: every tool returns structured output the agent can reason about, plus a one-line natural-language summary the agent can quote back to the user. Agents that have to parse JSON in their head waste tokens and lose context.

## 03 — Memory

Vector and episodic memory. RAG, semantic cache, audit log. We use pgvector inside the VioX OS Postgres for per-tenant scoped memory; Pinecone for high-volume cross-tenant retrieval; Redis for the semantic cache that catches 30-40% of repeated queries before they hit a model.

The 5-layer memory model inside VioX OS — raw transcripts, compressed summaries, extracted entities, learned facts, distilled wisdom — is the part that takes an agent from "answers questions" to "knows your business."

## 04 — Orchestration

Multi-agent graphs, retries, fallbacks, hand-off. LangGraph for the directed-acyclic flows; AutoGen patterns for free-form negotiation; n8n as the workflow surface where ops can see what's running and intervene without writing code.

This is the layer that makes the system *robust*. A single agent calling a single tool will fail 3-5% of the time in production — sometimes the model hallucinates, sometimes the tool times out, sometimes the input was malformed. Without orchestration with retries, fallbacks, and hand-off-to-human, those failures become customer complaints. With it, they become invisible.

## 05 — Observability

Traces, evals, prompt versioning, cost telemetry. Every agent run produces a trace; every trace runs through evals; every prompt version is tagged and rollback-able. We use LangSmith and Helicone for the standard work; Arize for the harder evaluation problems; custom evals for anything client-specific.

Here's the rule we don't break: no agent ships to production without an eval suite. Not "we'll add it later." Day zero.

## 06 — Cloud infrastructure

Edge-native serverless. Vercel for the public surfaces; Cloudflare Workers for low-latency edge compute; AWS for the heavier orchestration; Supabase for Postgres + auth + RLS. Edge functions, queues, vector stores, durable execution.

Why edge-native? Latency. A typical agent run touches three or four tools and ends with a model call. If every hop costs 100ms of network round-trip, the user feels it. Edge brings the orchestration close to the model, the cache close to the user, and the data close to where it's served.

## What it means in production

When we deploy VioX OS for an SMB, every one of the eight pre-built agents — Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder — runs through this stack. Same reasoning layer. Same memory model. Same orchestration patterns. Same observability surface.

That's the leverage. We don't rebuild the substrate every engagement. We build new agents on the substrate that already works, and the new agents inherit the reliability of the layer beneath them.

The substrate is the product. The agents are how the substrate ships outcomes.

## Action

If you're standing up an AI agent and you can only invest in one layer this week, invest in **Observability**. Without traces and evals, you don't know if your agent is getting better or worse — you'll just feel it when complaints arrive. Once you can see what your agent is doing wrong, every other layer becomes easier to fix.

If you want the whole stack pre-built, [VioX OS deploys in 24-48 hours](/services).
