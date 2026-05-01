---
slug: codex-goal-loops-anthropic-claude-code-openclaw
title: "OpenAI's Codex /goal and Claude Code's OpenClaw drama — coding agents are breaking containment"
date: "2026-05-01"
category: "Field notes"
tags: ["coding-agents", "codex", "claude-code", "tool-use", "production-lessons"]
summary: "Codex CLI adds autonomous goal loops while Claude Code refuses commits mentioning competitors. The Ralph loop pattern is now mainstream — here's what it means for production deployments."
sources: [{"title":"Codex CLI 0.128.0 adds /goal","url":"https://simonwillison.net/2026/Apr/30/codex-goals/"},{"title":"Claude Code refuses requests mentioning OpenClaw","url":"https://twitter.com/theo/status/2049645973350363168"},{"title":"AINews: Agents for Everything Else","url":"https://www.latent.space/p/ainews-agents-for-everything-else"}]
---

OpenAI shipped Codex CLI 0.128.0 yesterday with `/goal` — their version of the Ralph loop. You set an objective, Codex keeps looping until it evaluates goal completion or burns the token budget. Meanwhile, Claude Code is apparently refusing requests if your commit history mentions "OpenClaw" (Anthropic's internal codename for a competing coding agent) — or charging extra. 1,091 points on HN, 599 comments, absolute chaos in the replies.

Two stories, same week. Both signal the same shift: coding agents are breaking containment.

## What /goal actually does

Codex CLI's `/goal` is a persistent loop primitive. You give it an objective — "refactor the auth module to use Clerk" or "add Postgres connection pooling with pgBouncer" — and it keeps executing tool calls until it self-evaluates completion.

The implementation is mostly in `codex-rs` according to Simon Willison's breakdown. Token budget is configurable. No human approval between steps unless you explicitly gate it.

This isn't novel — the Ralph loop pattern (named after Geoffrey Huntley's original proof-of-concept) has been floating around agentic circles for 18 months. What's novel: OpenAI productized it. Codex CLI ships to 2.4 million developers. Ralph loops are now mainstream.

*The take: persistent goal loops are table stakes for any coding agent shipping in 2026. If your agent can't self-correct and retry without human intervention, you're shipping a autocomplete tool, not an agent.*

## The OpenClaw drama is worse

The Claude Code story broke on Twitter via @theo. Multiple users reported that Claude Code — Anthropic's official VS Code extension — was refusing coding requests if the repo's commit history mentioned "OpenClaw". Some users saw price increases. Others got outright rejections with vague "policy violation" messages.

AnthropicOpenClaw is apparently the internal project name for a Claude-powered coding agent that competes directly with Codex, Cursor, and Windsurf. Anthropic hasn't confirmed the product publicly. But the VS Code extension is clearly fingerprinting repos and competitor-gating requests.

599 HN comments, most of them livid. The core complaint: you don't get to train on open-source code and then selectively refuse service based on what other tools someone's evaluating.

Anthropiclaude-code is a paid product ($20/mo for Pro, included in Team). If you're charging, you can't also be playing model-police on commit messages. Pick one.

## What this means for production deployments

We run 8 Claude-native agents in VioX OS — Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder. Every one of them orchestrates tool use across 75+ integrations. We've shipped 47 client deployments in 24 months. Here's what we learned from this week's signals:

**1. Never run on one model.** We said this in March when Mistral Medium 3.5 shipped remote agents. We're saying it again. Codex, Claude, Gemini, GPT-4o — you need fallback routing. If one provider starts fingerprinting your stack or rate-limiting competitor mentions, you swap models in 6 lines of LangGraph config.

VioX OS uses `gpt-4o` for Closer (sales outreach), `claude-sonnet-4.6` for Controller (Stripe + QuickBooks reconciliation), `gemini-2.5-pro` for People Ops (Gusto integration). Not because we love model diversity — because we need production resilience.

**2. Goal loops need evals.** The Ralph loop is powerful. It's also dangerous. Codex's `/goal` will burn 200K tokens trying to "fix the build" if your eval function is broken. We've seen this exact failure mode with Goldie (our ElevenLabs ConvAI agent for DreamersJoy). Goldie kept retrying a Twilio SMS integration for 90 minutes because the eval was checking message.status === 'sent' but Twilio returns 'queued' first.

Every VioX OS agent ships with test suites on day zero. We wrote about this in March — "Evals on day zero" — and the principle still holds. If you're deploying autonomous loops, your eval must be more reliable than the loop itself.

**3. Commit hygiene matters now.** The OpenClaw drama is absurd, but it's also a real production concern. If you're building on Claude Code or any provider-locked agent, audit your commit messages. We've started running a pre-commit hook that strips competitor mentions from commit bodies — not because we're hiding anything, but because we don't want a $47/seat agent suddenly refusing service because someone mentioned "we evaluated Cursor" in a PR description 8 months ago.

**4. Self-hosted is the only durable pattern.** VioX OS is self-hosted. Your agents run in your Cloudflare Workers AI edge, your Vercel functions, your Railway containers — not in Anthropic's or OpenAI's sandboxes. You control the token budget. You control the model router. You control what gets logged.

Coding agents that run in vendor-controlled environments — Codex CLI, Claude Code, Cursor — are convenience plays. They're fast to start. They're also fragile. One policy change, one price hike, one competitor-gating scandal, and you're rewriting integration code at 11 PM.

## The Ralph loop is a primitive now

Codex shipping `/goal` is the real story this week. Not because the implementation is novel — it isn't. Because OpenAI just told 2.4 million developers that persistent goal loops are a default expectation.

If you're building agents in 2026, you need:
- Multi-step tool orchestration (LangGraph, Vercel AI SDK, n8n)
- Self-correction on tool failures (retry logic with backoff)
- Goal evaluation (separate LLM call or deterministic check)
- Token budget limits (hard stop at 100K tokens, 200K max)
- Eval coverage (test suite that runs before loop starts)

We've shipped this stack 47 times. The pattern works. The vendors are productizing it. If you're still shipping single-turn agents, you're 18 months behind.

## Action

If you're running coding agents in production: audit your model dependencies this week. Do you have fallback routing? Can you swap from Claude to GPT-4o in one config change? If not, set up a multi-provider router (LangChain's `RouterChain`, Vercel AI SDK's model switching, or LangGraph's conditional edges). The OpenClaw drama won't be the last vendor restriction — production resilience requires model optionality.
