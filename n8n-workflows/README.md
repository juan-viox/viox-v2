# n8n Workflows — VioX Blog Distribution

## Setup (one-time, ~15 minutes)

### 1. Import the workflow
- In n8n: **Workflows → Import from File** → select `viox-blog-distribution.json`
- Set workflow timezone (top right gear) to `America/New_York`

### 2. Create LinkedIn credential
- **Credentials → New → LinkedIn OAuth2 API**
- LinkedIn Developer Console → Create App → grab Client ID + Secret
- Authorize scope: `w_member_social` (personal profile posting)
- For **Company Page posting**, also request `w_organization_social` — requires Marketing Developer Platform approval (1-3 weeks). Skip for now; post from personal profile until approved.
- Replace `REPLACE_WITH_LINKEDIN_CRED_ID` in the LinkedIn node

### 3. Create Twitter/X credential
- **Credentials → New → Twitter OAuth2**
- Twitter Developer Portal → Create App → grab keys
- Replace `REPLACE_WITH_TWITTER_CRED_ID`

### 4. (Optional) Slack credential
- For ops notifications. Skip the Slack node entirely if not wanted.

### 5. Activate
- Toggle workflow **active** (top right)
- It now fires Mon–Fri at 08:00 ET, picks the newest unpublished post from `https://www.viox.ai/social/index.json`, and pushes to LinkedIn + Twitter.

## How it works

```
Schedule (Mon-Fri 08:00 ET)
  ↓
Fetch /social/index.json   ← list of all blog posts with social companions
  ↓
Pick today's post          ← code node, dedupes via static data store
  ↓
Skip if no new post        ← branching guard
  ↓
Fetch /social/<slug>.json  ← rich LinkedIn + Twitter copy
  ↓
Format posts               ← assemble final LinkedIn body, hashtags, link
  ├→ LinkedIn — share post
  ├→ Twitter/X — post thread
  └→ Slack — notify ops    ← optional
```

## Schedule cron expression

Default: `0 8 * * 1-5` (08:00 ET Mon-Fri).

Per the strategy, you can refine to:
- Mon `0 9 * * 1` — 09:00 ET (Frontier — link-in-comment style)
- Tue `30 8 * * 2` — 08:30 ET (Stack)
- Wed `0 9 * * 3` — 09:00 ET
- Thu `30 8 * * 4` — 08:30 ET
- Fri `30 9 * * 5` — 09:30 ET (Field notes — story format)

For variable timing per day, duplicate the workflow with different cron triggers, or split into 5 separate scheduled triggers feeding into the same downstream nodes.

## Upgrading to LinkedIn Company Page

Two paths once you want company-page posting:

**A. Native (free, requires LinkedIn approval)**
- Apply for [Marketing Developer Platform](https://www.linkedin.com/developers/apps) — 1-3 week review
- Add `w_organization_social` scope
- Update LinkedIn node `additionalFields.shareMediaCategory` and add `personUrn` → `urn:li:organization:<id>`

**B. Blotato HTTP node (immediate, ~$15-30/mo)**
Replace the LinkedIn native node with an **HTTP Request** node:
- POST `https://api.blotato.com/v1/posts`
- Auth header: `Bearer <BLOTATO_API_KEY>`
- Body:
  ```json
  {
    "platform": "linkedin",
    "page_id": "<your-company-page-id>",
    "text": "{{ $json.linkedin_text }}",
    "first_comment": "{{ $json.linkedin_first_comment }}",
    "image_url": "{{ $json.og_image }}"
  }
  ```

Blotato handles company-page auth on their side; no LinkedIn approval needed.

## Adding more channels

Same pattern works for:
- **Threads** — Meta Graph API, native node available
- **Bluesky** — community node `n8n-nodes-bluesky`
- **Mastodon** — community node `n8n-nodes-mastodon`
- **Email digest** — SendGrid/Postmark/Resend node, weekly summary of the week's posts

Add the node, wire from `Format posts`, done.
