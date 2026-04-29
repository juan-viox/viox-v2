---
slug: migrating-goldie-retell-to-elevenlabs
title: "We migrated Goldie from Retell to ElevenLabs in 4 days. Here's the diff."
date: "2026-04-27"
category: "Field notes"
tags: ["voice", "elevenlabs", "retell", "field-notes", "twilio"]
summary: "The catering concierge agent for Golden Plate was running on Retell. We ported it to ElevenLabs ConvAI in four working days. What changed, what broke, what got better — and the playbook we'll use next time."
sources: []
---

Goldie is the AI voice concierge we built for Golden Plate Events — a 24/7 inbound agent for corporate catering inquiries across all five boroughs. She answers calls, qualifies leads, captures the order context, and posts straight to the CRM. She's been live for months.

She used to run on Retell. Now she runs on ElevenLabs ConvAI. The migration took four working days end-to-end. Here's what the diff actually looked like.

## Why we migrated

Two reasons, both operational.

**Voice quality.** Retell is solid for transactional flows; ElevenLabs is in a different class for prosody, hand-off naturalness, and the "this sounds like a person" threshold that matters when the call is the first impression of a brand. For a catering concierge whose job is to make a $5K-$50K event feel handled-with-care from second one, the voice quality is the product.

**Tooling depth.** ElevenLabs ConvAI now has what we needed for the next phase — structured tool calling that maps cleanly to our CRM ingest, native interruption handling, dynamic context injection mid-call, and a conversation evaluator we can wire into our own eval pipeline. Retell's tool-calling story was working but we were starting to build around its limits.

## Day-by-day

**Day 1 — Spec extraction.** We pulled Goldie's existing prompt from Retell, the tool definitions, the call handling rules, and a representative sample of 60 transcripts from the last 90 days. The transcripts mattered more than the prompt — they told us what the agent actually does in production, which is always different from what the prompt says it should do.

**Day 2 — Prompt port and tool re-binding.** Rebuilt the prompt using ElevenLabs' system message + dynamic variables structure. Rewrote the four tools: `qualify_lead`, `capture_event_context`, `schedule_callback`, `post_to_crm`. The CRM ingest endpoint stayed exactly the same — the only thing changing was the agent calling it.

The thing that took longest: tuning the conversation flow so the agent didn't ask the same question twice. ElevenLabs' agents have stronger short-term memory than Retell's by default; what was a workaround in Retell became unnecessary in ElevenLabs and had to be removed before it caused new bugs.

**Day 3 — Twilio re-pointing and parallel deploy.** We didn't replace Goldie. We deployed the new ElevenLabs agent on a separate Twilio number, ran both numbers live, and routed 10% of incoming calls to the new one for two days. Both agents posted to the CRM with a `version` tag so we could compare lead quality side-by-side.

Parallel deploy is non-negotiable for voice migrations. The cost-of-failure is too high for a cutover.

**Day 4 — Cutover and eval baseline.** Lead quality on the new agent was equal-or-better across all four scoring dimensions. Voice naturalness scores from the customer-side rubric were materially higher. We swapped the production Twilio number to point at ElevenLabs and decommissioned the Retell agent. The first eval suite run on the new agent went into the dashboard the same day.

## What got better

- **Naturalness.** Three customers in week one mentioned unprompted that they didn't realize they were talking to an AI until the agent told them. That didn't happen on Retell.
- **Interruption handling.** Customers talk over agents constantly. ElevenLabs handles it cleanly; Retell's interruption support was working but felt mechanical.
- **Structured tool output.** The CRM payload coming out of ElevenLabs is cleaner — fewer null fields, more accurate event date parsing, better at distinguishing a single inquiry from a multi-event ask.

## What broke (and how we fixed it)

- **Latency on the first turn.** ElevenLabs' first-response time was ~400ms slower than Retell's. We added a pre-warmed greeting and a brief preamble — the agent says "Hi, you've reached Golden Plate, this is Goldie" while it's still loading the call context. By the time the customer responds, the agent is fully ready.
- **Calendar tool returning timezone-naive dates.** Retell stripped timezones aggressively. ElevenLabs preserves them, which is correct — but our CRM ingest didn't expect them. One-line fix in the ingest API, but it would have been a multi-hour mystery without parallel deploy catching it.
- **Voice ID drift.** The exact voice we wanted was on a paid tier we hadn't subscribed to yet. The free-tier closest match was 90% there but the brand sounded slightly different. Solved by upgrading; budget it in advance next time.

## What we'd do differently

Next time we migrate a voice agent, we're starting with the parallel deploy on day one. Building in isolation for three days then routing traffic on day three meant we caught issues later than we should have. Two days of traffic with both versions live would have shaved another half-day off and surfaced the timezone bug 24 hours earlier.

We're also writing the eval suite **before** porting the prompt next time. Goldie's old eval suite was Retell-shaped — it tested for behaviors the old agent had. The new agent passed those tests easily but had its own failure modes the old suite didn't cover. We rewrote the suite around behavior outcomes (lead quality, naturalness, completion rate) rather than prompt-shape, and that's the version we keep.

## Action

If you're running a voice agent in production and your provider's tooling is starting to feel like a ceiling instead of a floor, migration is more tractable than it feels. Four days for a complex agent with four tools and a live customer base. The discipline that mattered: parallel deploy, behavior-shaped evals, and not trying to make the new agent identical to the old one.

If you want a voice agent ported, deployed, and eval'd on ElevenLabs, that's [a Cinematic Basic](/pricing) project for us — 3-4 weeks soup to nuts including the rest of the surface around it.
