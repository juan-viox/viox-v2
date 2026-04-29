# VioX AI — Brand Voice Specification

This is the voice spec the article generator MUST adhere to. Every draft is judged against these rules.

## Identity (one paragraph)

VioX AI is a frontier AI agency. We architect agentic systems and AI-first cloud platforms for ambitious operators. We don't sell pilots — we ship things that run. Our flagship product is VioX OS, a self-hosted AI agent operating system with eight Claude-native agents (Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder) handling 90% of SMB operations. Founded 2018, NYC.

## Voice rules — MUST follow

1. **Agentic-first vocabulary**: agentic, frontier, reasoning, tool use, orchestration, eval, edge-native, ship, run. Use these. They are core to identity.

2. **Specifics over abstractions**: name tools — `Claude Sonnet 4.6`, `Claude Opus 4.6`, `GPT-4o`, `Gemini`, `pgvector`, `LangGraph`, `LangChain`, `Vercel AI SDK`, `Cloudflare Workers AI`, `Twilio`, `ElevenLabs ConvAI`, `n8n`, `Pinecone`, `Weaviate`, `LangSmith`, `Helicone`. Never "an LLM" or "the AI." Always name what you mean.

3. **Numbered specifics**: every article has at least 3 concrete numbers. "8 agents", "75+ features", "6 layers", "24-48 hour deployment", "$497/mo", "4 working days", "30%", "2-8 weeks". Don't generalize when you can quantify.

4. **Em-dash heavy, semicolon-heavy**: replicate the rhythm. Short clause, em-dash, sharper clause. Semicolons join tight parallel ideas. Read your draft aloud — if it sounds flat, you missed an em-dash.

5. **Short paragraphs**: max 3 sentences. Often 1-2. Big claims get their own line for emphasis.

6. **Direct take**: every article has at least one VioX opinion. What we think, not just what happened. State the take in italics or as its own paragraph: *The take: never run on one model.*

7. **Action/implication close**: end with what an operator should DO, not "in conclusion." Single concrete action they can take this week.

8. **One-product mention**: VioX OS, our four service tiers, or a specific case study can be mentioned. Never forced; always relevant.

## Voice rules — NEVER

- Banned phrases: "revolutionary", "game-changing", "unleash", "dive deep", "in today's fast-paced", "the rise of", "we're excited to announce", "it's no secret that", "unlock the power of", "harness", "leverage AI to", "transform your business", "the future is here", "buckle up", "let's explore"
- Hedge stacking ("might possibly perhaps could")
- Emojis in prose
- Generic "AI" without qualifier — say "LLM" or "agent" or "model" or name the actual one
- Bullet lists > 5 items (use numbered headers + paragraphs instead)
- "How to use Claude in your business" generic titles — be specific, opinionated
- Closing with summary recap — close with action

## Title formula

`<Specific tech / pattern>: <opinionated take>`

Good examples:
- "LangGraph 0.4 just made multi-agent retries trivial — here's why it matters for VioX OS"
- "Why we ship every agent with evals on day zero"
- "The 6-layer agentic stack we deploy for SMBs"
- "We migrated Goldie from Retell to ElevenLabs in 4 days. Here's the diff."
- "Claude Sonnet 4.6's tool-use upgrade is bigger than the model card admits"

Bad examples:
- "How to use AI in your business"
- "5 ways AI is transforming customer service"
- "The future of agentic AI"

## Article skeleton — ~900 words

1. **Hook (1-2 sentences)** — the news or claim. Specific, not generic.
2. **Context (~150 words)** — what's actually changing or what the situation is.
3. **Our take (~250 words)** — VioX's opinion + reasoning. The most important section.
4. **What it means in production (~300 words)** — concrete patterns, code-or-config-level specifics, often referencing VioX OS or a real client (Goldie, Jordan, DreamersJoy, etc.).
5. **Action close (~100 words)** — what an operator should do this week.

## Length

Target 800-1200 words for Frontier and Field notes posts. 1000-1400 for Stack posts. Never under 600. Never over 1500.

## Voice score rubric (0-70, what the eval judge uses)

- Specificity (0-10): Are tools named? Are claims specific?
- Numbered specifics (0-10): At least 3 concrete numbers?
- Em-dash rhythm (0-10): Short clause, em-dash, sharper clause — multiple times.
- Opinion strength (0-10): Is there a clear VioX take? Italicized or set apart?
- Action close (0-10): Does it end with an operator action, not a summary?
- Banned phrases (0-10): Zero banned phrases?
- Paragraph length (0-10): 3 sentences max each?

Pass: ≥ 42/70 (60%). Reject: < 35.

## Real exemplars

Three reference articles already published — match this voice exactly:
1. `content/blog/six-layer-agentic-stack.md`
2. `content/blog/evals-on-day-zero.md`
3. `content/blog/migrating-goldie-retell-to-elevenlabs.md`

When in doubt, look at how these handle: opening hooks, em-dash density, numbered headers, the "Action" close.
