# Phase 3 — Setup Guide

This is the operator runbook for Phase 3 features. Each section can be turned on independently.

---

## 1. Topic memory ✅ already wired

Lives at `scripts/lib/topics.mjs` + `scripts/lib/topic-memory.mjs`. The generator queries it before drafting; persists to `.blog-runs/topics-index.json` after each post.

**No setup required.** First run rebuilds the index from your existing posts. After that, every generated article updates it automatically.

To see current coverage:
```bash
cat .blog-runs/topics-index.json | jq '.posts | length'
```

To force a rebuild (e.g. after manual edits):
```bash
node -e "import('./scripts/lib/topic-memory.mjs').then(async m => {
  const i = await m.rebuildTopicIndex(process.cwd());
  await m.saveTopicIndex(process.cwd(), i);
  console.log(i.posts.length, 'posts indexed');
})"
```

---

## 2. Per-category visual OG ✅ already wired

`og.mjs` now renders four distinct visual themes:
- **Frontier** — cyan grid pattern, deep-blue gradient
- **Stack** — purple hexagonal motif, violet gradient
- **Field notes** — amber line motif, warm dark gradient
- **Briefings** — pink mesh radial, soft cinematic gradient

Each blog post's OG image inherits its category's visual identity automatically. No setup required.

---

## 3. Newsletter (Resend)

### One-time setup (10 min)

1. Sign up at [resend.com](https://resend.com)
2. **Domains → Add Domain → `viox.ai`** — add the DNS records they provide (DKIM, SPF, DMARC) at Cloudflare. Verification usually takes <5 minutes.
3. **Audiences → Create Audience** — name it "VioX Newsletter". Copy the audience ID.
4. **API Keys → Create API Key** — full access, scoped to the audience. Copy the key.

### Set Vercel env vars

Project → Settings → Environment Variables:

| Var | Value |
|---|---|
| `RESEND_API_KEY` | re_xxx... |
| `RESEND_AUDIENCE_ID` | aud_xxx... |

### Set GitHub secrets (for the weekly cron)

Repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `RESEND_API_KEY` | same as above |
| `RESEND_AUDIENCE_ID` | same as above |

Repo → Settings → Variables:

| Variable | Value |
|---|---|
| `NEWSLETTER_FROM` | `VioX AI <hello@viox.ai>` |

### Manual test before going live

```bash
RESEND_API_KEY=re_... RESEND_AUDIENCE_ID=aud_... NEWSLETTER_FROM='VioX AI <hello@viox.ai>' \
  node scripts/send-newsletter.mjs
```

### Cron schedule

`.github/workflows/newsletter-weekly.yml` runs Sun 14:00 UTC = 09:00–10:00 ET (after the Sunday Briefing post is committed).

### Form

`/blog` and `/` (home) both display a `NewsletterSignup` component. Submissions hit `/api/subscribe` → Resend Audiences API → user is added to the audience.

---

## 4. Reader analytics (Plausible)

### One-time setup (5 min)

1. Sign up at [plausible.io](https://plausible.io) ($9/mo cloud, or self-host free)
2. Add site `viox.ai`
3. **Settings → API Keys → Create** — name "VioX Generator", read access. Copy the key.
4. The Plausible script tag is already in `index.html`. After deploying, traffic starts appearing in the dashboard within minutes.

### Set GitHub secrets (for generator feedback loop)

| Secret | Value |
|---|---|
| `PLAUSIBLE_API_KEY` | xxx... |
| `PLAUSIBLE_SITE_ID` | viox.ai |

The generator (`scripts/generate-blog.mjs`) auto-detects these. If set, it pulls top-performing posts from the last 30 days and includes them as positive signal in the prompt. If not set, generator silently skips analytics — feature is fully optional.

### What gets used

Currently fetches: top 10 most-visited blog URLs over the last 30 days, included in the Claude prompt as "themes that resonate with our audience."

Future hooks (not auto-wired):
- Time-on-page (signals depth of engagement)
- Outbound link clicks (signals conversion intent)
- Social referrers (signals which posts traveled)

---

## 5. Voice-tuning loop

Runs Sat 12:00 UTC. Pulls last 30 days of voice-eval reports from `.blog-runs/`, identifies top-vs-bottom patterns, asks Claude Opus to propose rubric updates, opens an auto-PR.

### Setup

Already configured. Uses the existing `ANTHROPIC_API_KEY`.

### What happens

1. Scans `.blog-runs/*-eval-pass.json` and `*-eval-fail.json` for the last 30 days
2. Loads the corresponding article bodies
3. Sorts by voice score, splits into top third / bottom third
4. Sends to Claude Sonnet with both groups + current `brand-voice.md`
5. Claude analyzes patterns, proposes updates
6. Writes `scripts/brand-voice.proposed.md`
7. Opens a PR titled "Voice rubric proposal — YYYY-MM-DD"

### Apply the proposal

Review the PR. If approved, the apply step is one rename:

```bash
mv scripts/brand-voice.proposed.md scripts/brand-voice.md
git add scripts/ && git commit -m "voice-tune: apply YYYY-MM-DD proposal" && git push
```

The next generation run uses the updated rubric.

### Skip if not enough samples

If fewer than 5 articles have been processed in the last 30 days, the loop skips silently. Useful in the first month when sample size is small.

---

## Complete env var inventory

### Vercel (production)

| Var | Required for |
|---|---|
| `VIOX_CRM_URL` | `/api/lead`, `/api/newsletter` (existing) |
| `VIOX_CRM_API_KEY` | `/api/lead`, `/api/newsletter` (existing) |
| `RESEND_API_KEY` | `/api/subscribe` (Phase 3) |
| `RESEND_AUDIENCE_ID` | `/api/subscribe` (Phase 3) |

### GitHub Actions secrets

| Secret | Required for |
|---|---|
| `ANTHROPIC_API_KEY` | blog-daily, voice-tune-weekly |
| `RESEND_API_KEY` | newsletter-weekly |
| `RESEND_AUDIENCE_ID` | newsletter-weekly |
| `PLAUSIBLE_API_KEY` | blog-daily (optional, analytics feedback) |
| `PLAUSIBLE_SITE_ID` | blog-daily (optional, analytics feedback) |

### GitHub Actions vars

| Var | Required for |
|---|---|
| `NEWSLETTER_FROM` | newsletter-weekly (e.g. `"VioX AI <hello@viox.ai>"`) |

---

## Cron schedule overview

| Workflow | Cron | What runs |
|---|---|---|
| `blog-daily.yml` | `0 6 * * 1-5` + `0 12 * * 0` | Generate + eval + commit daily article |
| `newsletter-weekly.yml` | `0 14 * * 0` | Send weekly digest to subscribers |
| `voice-tune-weekly.yml` | `0 12 * * 6` | Analyze week's voice scores → PR with rubric updates |

All times UTC. Adjust crons if you want different ET windows.

---

## Cost summary (all of Phase 1+2+3)

| Service | Monthly cost |
|---|---|
| Anthropic API (Claude Sonnet, prompt-cached): 30 articles + 4 voice tunes | ~$5-8 |
| Resend (newsletter, ~3K free emails/mo) | $0 (free tier) |
| Plausible (cloud, 10K visitors/mo) | $9 |
| Vercel hosting | $0 (free tier) |
| GitHub Actions runtime | $0 (free tier) |
| **Total** | **~$15-20/mo** |

---

## Activation order (recommended)

Don't turn everything on at once. Suggested rollout:

1. **Week 1**: Phase 2 only (auto-blog generation), monitor voice scores
2. **Week 2**: Add Plausible (passive measurement)
3. **Week 3**: Add Resend + newsletter form (start collecting signups)
4. **Week 4**: First newsletter dispatch (manual test, then enable cron)
5. **Week 5+**: Voice-tune loop activates (needs 5+ samples to do anything useful)

This way each piece has data behind it before the next layer is added.
