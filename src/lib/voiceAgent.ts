// Helper to trigger the ElevenLabs voice agent from anywhere in the app.
export const VOICE_AGENT_EVENT = 'viox:voice-agent-open'

export function triggerVoiceAgent() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(VOICE_AGENT_EVENT))
}

export const VOICE_CONSENT_KEY = 'viox.voiceAgent.consented'

export function hasVoiceConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(VOICE_CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

export function setVoiceConsent() {
  try { window.localStorage.setItem(VOICE_CONSENT_KEY, '1') } catch { /* noop */ }
}
