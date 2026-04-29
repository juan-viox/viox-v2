/**
 * Theme taxonomy + topic extraction.
 *
 * The generator uses this to:
 *   1. Track which themes have been covered recently (via topic-memory.mjs)
 *   2. Bias new articles toward under-covered themes
 *   3. Reject candidate signals that exactly duplicate recent posts
 */

export const THEMES = [
  // Frontier — model + lab releases
  { id: 'anthropic-releases',  label: 'Anthropic releases (Claude, Sonnet, Opus, Haiku)', cat: 'Frontier' },
  { id: 'openai-releases',     label: 'OpenAI releases (GPT, o-series, Sora)',            cat: 'Frontier' },
  { id: 'deepmind-releases',   label: 'DeepMind / Google releases (Gemini, Veo)',         cat: 'Frontier' },
  { id: 'open-source-models',  label: 'Open source models (Llama, Mistral, DeepSeek, Qwen)', cat: 'Frontier' },
  { id: 'capability-shifts',   label: 'Capability shifts (reasoning, multimodal, long context)', cat: 'Frontier' },
  { id: 'safety-alignment',    label: 'Safety, alignment, interpretability research',     cat: 'Frontier' },

  // Stack — tooling + architecture
  { id: 'agentic-frameworks',  label: 'Agentic frameworks (LangGraph, AutoGen, CrewAI)',  cat: 'Stack' },
  { id: 'voice-agents',        label: 'Voice agents (ElevenLabs, Twilio, Retell)',        cat: 'Stack' },
  { id: 'evals-quality',       label: 'Evals, observability, quality (LangSmith, Helicone, Arize)', cat: 'Stack' },
  { id: 'rag-vector',          label: 'RAG patterns, vector stores (pgvector, Pinecone, Weaviate)', cat: 'Stack' },
  { id: 'edge-deployment',     label: 'Edge deployment, serverless AI (Vercel, Cloudflare Workers AI)', cat: 'Stack' },
  { id: 'mcp-tools',           label: 'MCP servers, tool use, function calling',          cat: 'Stack' },
  { id: 'prompt-engineering',  label: 'Prompt engineering, prompt caching, structured output', cat: 'Stack' },
  { id: 'fine-tuning',         label: 'Fine-tuning, distillation, smaller models',        cat: 'Stack' },
  { id: 'coding-agents',       label: 'Coding agents (Claude Code, Cursor, Devin, Codex)', cat: 'Stack' },
  { id: 'multimodal',          label: 'Multimodal (vision, audio, video generation)',     cat: 'Stack' },

  // Field notes — production
  { id: 'production-lessons',  label: 'Production debugging, real client patterns',       cat: 'Field notes' },
  { id: 'integration-patterns', label: 'CRM/ERP integration, agent-aware systems',        cat: 'Field notes' },
  { id: 'pricing-economics',   label: 'AI pricing, token economics, cost optimization',   cat: 'Field notes' },
  { id: 'enterprise-rollout',  label: 'Enterprise rollouts, change management, training', cat: 'Field notes' },
]

export const THEME_IDS = THEMES.map((t) => t.id)

/**
 * Extract theme IDs from a piece of text (article body or signal title+summary).
 * Uses keyword regex matching — pragmatic, deterministic, no LLM call.
 */
const PATTERNS = {
  'anthropic-releases':  /\b(anthropic|claude|sonnet|opus|haiku)\b/i,
  'openai-releases':     /\b(openai|gpt-?[345o]|o1|o3|sora)\b/i,
  'deepmind-releases':   /\b(deepmind|gemini|veo|imagen)\b/i,
  'open-source-models':  /\b(llama|mistral|deepseek|qwen|phi-?\d|grok)\b/i,
  'capability-shifts':   /\b(reasoning|chain[- ]of[- ]thought|long context|context window|multimodal capability)\b/i,
  'safety-alignment':    /\b(alignment|interpretability|red[- ]team|jailbreak|safety research|constitutional)\b/i,

  'agentic-frameworks':  /\b(langgraph|autogen|crewai|agent.?framework|multi[- ]agent)\b/i,
  'voice-agents':        /\b(voice agent|elevenlabs|retell|twilio voice|tts|asr)\b/i,
  'evals-quality':       /\b(eval|evals|langsmith|helicone|arize|observability|prompt versioning)\b/i,
  'rag-vector':          /\b(rag|pgvector|pinecone|weaviate|qdrant|vector (store|db|database)|embedding)\b/i,
  'edge-deployment':     /\b(vercel|cloudflare workers|edge runtime|edge function|serverless ai)\b/i,
  'mcp-tools':           /\b(mcp|model context protocol|tool use|function calling|tool calling)\b/i,
  'prompt-engineering':  /\b(prompt engineering|prompt caching|structured output|json mode|system prompt)\b/i,
  'fine-tuning':         /\b(fine[- ]tun|lora|qlora|distillation|sft|rlhf|dpo)\b/i,
  'coding-agents':       /\b(claude code|cursor|devin|codex|copilot|coding agent|code interpreter)\b/i,
  'multimodal':          /\b(vision|video generation|image generation|audio model|speech)\b/i,

  'production-lessons':  /\b(production|in production|deployed|live agent|case study|debugging|incident)\b/i,
  'integration-patterns': /\b(crm|salesforce|hubspot|sap|zoho|integrate|integration|webhook|api integration)\b/i,
  'pricing-economics':   /\b(pricing|cost|token economics|price per|\\$\d|cheap|expensive)\b/i,
  'enterprise-rollout':  /\b(enterprise|rollout|change management|training|adoption|onboarding)\b/i,
}

export function extractThemes(text) {
  const lower = text.toLowerCase()
  const hits = []
  for (const [id, re] of Object.entries(PATTERNS)) {
    if (re.test(lower)) hits.push(id)
  }
  return hits
}

/** Compact theme description string for prompt injection. */
export function themesPromptBlock(coverage) {
  const sorted = [...THEMES].sort((a, b) => (coverage[a.id] ?? 0) - (coverage[b.id] ?? 0))
  return sorted.map((t) => {
    const n = coverage[t.id] ?? 0
    const sig = n === 0 ? '★ uncovered' : n <= 1 ? '· low' : n >= 4 ? '⚠ saturated' : ''
    return `  - ${t.id} (${t.cat}): ${n} recent ${sig}`
  }).join('\n')
}
