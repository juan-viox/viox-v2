---
slug: openai-voice-latency-stack-production-lessons
title: "OpenAI just published their voice AI latency stack — here's what it means for production deployments"
date: "2026-05-05"
category: "Stack"
tags: ["voice-agents", "openai", "latency", "production-infrastructure", "streaming"]
summary: "OpenAI detailed how they achieve sub-300ms voice latency at scale. We break down the 4-layer stack and what it means for anyone shipping voice agents in production."
sources: [{"title":"How OpenAI delivers low-latency voice AI at scale","url":"https://openai.com/index/delivering-low-latency-voice-ai-at-scale/"}]
---

## OpenAI just shipped their voice latency playbook

OpenAI published a deep-dive on how they deliver sub-300ms voice AI latency at scale. Not a marketing post — actual stack details. Edge inference, streaming protocols, audio chunking strategies, model optimizations.

This matters because voice is the next major agent interface. We've already migrated one client (Goldie) from Retell to ElevenLabs ConvAI in 4 days. Every operator building voice agents should study this stack — even if you're not using OpenAI's realtime API.

## The 4-layer stack OpenAI runs

OpenAI breaks their voice latency optimization into four layers:

**Layer 1: Edge proximity** — they run inference on edge nodes within 50ms of users. Standard CDN topology, but applied to model serving. Cloudflare Workers AI does this; Replicate doesn't (yet). The difference: 40-80ms on first token.

**Layer 2: Streaming everything** — audio input streams to the model, model streams tokens back, TTS streams audio chunks. No "wait for full sentence" blocking. This cuts perceived latency by 200-400ms compared to batch processing.

**Layer 3: Audio chunking** — they process 100ms audio frames, not full utterances. The model maintains conversation state across chunks. This means the system responds while you're still talking — critical for natural interruption handling.

**Layer 4: Model co-design** — they trained GPT-4o specifically for streaming voice. Not an afterthought adapter on a text model. The result: token generation optimized for audio output, not text completion.

The published benchmarks: 280ms median latency, 95th percentile under 450ms. That's measured from user speech to first audio output token.

## What this means if you're shipping voice agents

We've deployed 6 voice agents in the last 90 days — three on ElevenLabs ConvAI, two on Retell, one on Bland. Here's what we learned from OpenAI's stack that you can apply today:

**Edge matters more than model size.** Goldie (our real estate voice agent) ran on Retell with GPT-4o. Latency: 600-900ms. We moved to ElevenLabs ConvAI with the same model — latency dropped to 350-500ms. The difference: ElevenLabs runs closer to users and streams more aggressively.

**Chunk size is a tuning parameter.** OpenAI uses 100ms chunks. ElevenLabs defaults to 200ms. Retell was at 300ms. Smaller chunks = lower latency, but higher chance of cutoff artifacts. We tune this per use case. Sales agents (Goldie): 150ms chunks. Support agents: 200ms. The trade-off: naturalness vs responsiveness.

**Streaming isn't optional.** Every production voice agent we ship now streams audio input and output. Non-streaming architectures add 400-800ms of dead air. Users perceive this as "the AI is slow" or "it didn't hear me." Streaming fixes both.

**Model matters less than you think.** We've run the same agent on GPT-4o, Claude Sonnet 4.6, and Gemini 2.0 Flash. Latency variance between models: 50-100ms. Latency variance between hosting providers: 200-400ms. Optimize infrastructure first, then model.

The one thing OpenAI doesn't publish: their audio preprocessing pipeline. They mention "noise reduction" and "echo cancellation" but no stack details. We run Krisp.ai for this — it adds 30-50ms but cuts support tickets by 40%. Users in noisy environments don't realize the agent can't hear them until they get frustrated.

## The VioX voice stack today

VioX OS ships with two voice agents: **Goldie** (sales, real estate) and **Voice** (general-purpose receptionist). Both run on ElevenLabs ConvAI as of last month.

Our stack:
- **Edge**: ElevenLabs ConvAI (edge-native, 11 global regions)
- **Model**: GPT-4o for reasoning, Claude Sonnet 4.6 for complex instructions
- **Audio preprocessing**: Krisp.ai WebRTC noise suppression
- **Streaming**: 150ms chunks for sales agents, 200ms for support
- **Interruption handling**: aggressive (user can cut in after 0.5s of speech)
- **Fallback**: if edge latency > 500ms, we route through centralized inference (Twilio Media Streams + our own STT/TTS pipeline)

Median latency: 340ms. 95th percentile: 520ms. Not as fast as OpenAI's published numbers, but we're routing through an orchestration layer (LangGraph) that adds 60-80ms. The trade-off: we get tool use, memory, and evals in the same stack.

We also run **end-to-end latency evals** on every voice agent deployment. Every 6 hours, we simulate 10 test calls, measure latency distribution, alert if 95th percentile > 600ms. This caught an ElevenLabs regional outage 4 weeks ago — we failed over to Twilio + AssemblyAI in 8 minutes.

## What OpenAI didn't say (and what we learned the hard way)

OpenAI's post focuses on infrastructure. They don't talk about three production realities we hit constantly:

**1. Latency variance kills conversion more than median latency.** A voice agent that's 300ms 80% of the time and 1200ms 20% of the time performs worse than one that's consistently 400ms. Users tolerate predictable latency; they don't tolerate random pauses.

**2. Interruption handling is harder than latency.** OpenAI mentions it in passing. It's the hardest part of production voice. If your agent keeps talking after the user interrupts, you've lost the call. We spent 2 weeks tuning this on Goldie — threshold is now 0.5s of user speech triggers interrupt. Any lower and background noise triggers false interrupts.

**3. Model routing adds latency but saves calls.** We route complex instructions ("check my calendar and reschedule") to Claude Sonnet 4.6. Simple questions ("what's your address?") stay on GPT-4o. This adds 40ms of routing logic but cuts failure rate by 30%. Users don't notice 40ms. They notice when the agent doesn't understand them.

The other thing OpenAI doesn't mention: cost. Their realtime API is $0.06/minute input, $0.24/minute output. That's 4-6x more expensive than ElevenLabs ConvAI ($0.04/minute all-in) and 8-12x more than Twilio + AssemblyAI + GPT-4o ($0.02/minute). For a high-volume voice agent (1000+ calls/day), that's $50k/year vs $200k/year.

## Action: measure your voice latency distribution today

If you're running a voice agent in production, instrument latency measurement this week. Don't rely on vendor dashboards — they report median, not distribution.

What to measure:
- Time from user speech end to agent speech start (end-to-end latency)
- Variance (95th percentile vs median)
- Regional breakdown (latency by user geography)
- Failure modes (calls with >1s pauses)

If your 95th percentile is > 600ms, you have a latency problem. If variance is > 200ms (95th - median), you have an infrastructure problem. Fix those before you optimize prompts.

We ship every VioX OS voice agent with LangSmith tracing and Helicone latency monitoring. Every call logs 6 latency metrics. If you're not measuring, you're guessing.
