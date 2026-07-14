# LSTE Assistant — chatbot backend (Cloudflare Worker)

This is the small serverless proxy that powers the site's AI chatbot. It keeps
the model API key secret, enforces the LSTE-only scope, grounds answers in
`../src/chat/knowledge.md`, and streams replies to the widget.

**It's free to run**: Cloudflare Workers free plan (100k requests/day) + Google
Gemini free tier. No credit card is required for either free tier, and free
tiers don't auto-charge.

## One-time setup (~10 minutes)

### 1. Get a free Gemini API key
1. Go to <https://aistudio.google.com/apikey> and sign in with a Google account.
2. Click **Create API key** → copy it.

### 2. Deploy the Worker
From this `worker/` directory:

```bash
npm install -g wrangler        # if you don't have it
wrangler login                 # opens the browser, free Cloudflare account
wrangler secret put GEMINI_API_KEY   # paste the key from step 1 when prompted
wrangler deploy
```

`wrangler deploy` prints your Worker URL, e.g.
`https://lste-chat.<your-subdomain>.workers.dev`.

### 3. Point the website at the Worker
Open `../src/partials/footer.html`, find the chat widget root, and set its
`data-endpoint` to the Worker URL from step 2:

```html
<div id="lste-chat" data-endpoint="https://lste-chat.<your-subdomain>.workers.dev">
```

Then rebuild the site from the project root:

```bash
npm run build
```

That's it. The chatbot is live. Until `data-endpoint` is set (or if the Worker
is ever unreachable), the widget automatically falls back to a curated FAQ +
contact link, so the site is never broken.

## Local development

```bash
wrangler dev --port 8788
# then in another terminal, serve the site and set data-endpoint to
# http://localhost:8788 for testing (localhost is already CORS-allowed).
```

You still need the secret locally — create `worker/.dev.vars` (git-ignored):

```
GEMINI_API_KEY=your-key-here
```

## Configuration

- **Allowed origins**: edit `ALLOWED_ORIGINS` in `chat-worker.js` to match your
  real domain(s). It already includes `https://lste.lu` and localhost.
- **Model**: `GEMINI_MODEL` in `chat-worker.js` (default `gemini-2.0-flash`).
- **Abuse limits**: `MAX_MESSAGES`, `MAX_CHARS`, `MAX_TOTAL_CHARS`.

## Swapping the model provider (all have free options)

Only the `callModel()` function needs to change:

- **Cloudflare Workers AI** (no external key at all — bind `[ai]` in
  `wrangler.toml` and call `env.AI.run('@cf/meta/llama-3.3-70b-instruct', …)`).
  Simplest single-vendor setup; free daily allocation.
- **Groq** (very fast Llama, free API key): OpenAI-compatible endpoint at
  `https://api.groq.com/openai/v1/chat/completions`.
- **OpenAI / Anthropic**: paid, but drop-in if you later want guaranteed
  headroom — same Worker, same widget, no rewrite.

## How scope & safety work

The system prompt (`../src/chat/system-prompt.md`) and knowledge base
(`../src/chat/knowledge.md`) are compiled into the Worker. The model is
instructed to answer **only** LSTE questions, never invent facts, refuse
prompt-injection, and redirect anything it can't answer to `hello@lste.lu`.
Because this lives server-side, visitors can't edit or bypass it.
