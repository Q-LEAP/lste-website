/**
 * LSTE Assistant — Cloudflare Worker proxy.
 *
 * Sits between the static site's chat widget and Google Gemini. Keeps the API
 * key server-side (never in the browser), enforces the LSTE-only scope + safety
 * rules, grounds answers in the curated knowledge base, and streams the reply
 * back to the widget as Server-Sent Events.
 *
 * The system prompt + knowledge base are imported as text at build time (see
 * wrangler.toml `rules`), so the guardrails cannot be tampered with from the
 * client.
 *
 * Free to run: Cloudflare Workers free plan + Google Gemini free tier.
 * Deploy: see worker/README.md.
 */

import SYSTEM_PROMPT from '../src/chat/system-prompt.md';
import KNOWLEDGE from '../src/chat/knowledge.md';

// Origins allowed to call this Worker. Add your production + preview domains.
const ALLOWED_ORIGINS = [
  'https://lste.lu',
  'https://www.lste.lu',
  'http://localhost:8843',
  'http://127.0.0.1:8843',
];

// Gemini model + endpoint. `gemini-2.0-flash` is on the free tier, fast, and
// multilingual. To swap providers (Workers AI, Groq, OpenAI), only callModel()
// below needs to change.
const GEMINI_MODEL = 'gemini-2.0-flash';

// Guardrails against abuse (free tiers have quotas).
const MAX_MESSAGES = 20; // per request (conversation history)
const MAX_CHARS = 2000; // per single message
const MAX_TOTAL_CHARS = 12000; // whole conversation

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonError(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/** Validate + normalise the conversation coming from the widget. */
function sanitiseMessages(raw) {
  if (!Array.isArray(raw)) throw new Error('messages must be an array');
  const messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content.length > 0);
  if (!messages.length) throw new Error('no valid messages');
  if (messages[messages.length - 1].role !== 'user') throw new Error('last message must be from the user');
  const total = messages.reduce((n, m) => n + m.content.length, 0);
  if (total > MAX_TOTAL_CHARS) throw new Error('conversation too long');
  return messages;
}

/**
 * Call Gemini with streaming. Returns a ReadableStream of raw model text
 * chunks (already decoded), which we re-emit to the client as SSE.
 */
async function callModel(messages, apiKey, signal) {
  const system = `${SYSTEM_PROMPT}\n\n=== KNOWLEDGE BASE ===\n${KNOWLEDGE}`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      safetySettings: [],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`model error ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.body;
}

/** Extract text deltas from Gemini's SSE lines. */
function extractText(sseLine) {
  if (!sseLine.startsWith('data:')) return '';
  const payload = sseLine.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    const obj = JSON.parse(payload);
    const parts = obj?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';
    return parts.map((p) => p.text || '').join('');
  } catch {
    return '';
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return jsonError('Method not allowed', 405, origin);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return jsonError('Origin not allowed', 403, origin);
    }
    if (!env.GEMINI_API_KEY) {
      return jsonError('Server not configured', 500, origin);
    }

    let messages;
    try {
      const body = await request.json();
      messages = sanitiseMessages(body.messages);
    } catch (e) {
      return jsonError(`Bad request: ${e.message}`, 400, origin);
    }

    // 20s timeout so a stuck upstream can't hang the Worker.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let modelStream;
    try {
      modelStream = await callModel(messages, env.GEMINI_API_KEY, controller.signal);
    } catch (e) {
      clearTimeout(timeout);
      return jsonError('The assistant is unavailable right now.', 502, origin);
    }

    // Re-stream model text to the client as simple SSE: `data: <delta>\n\n`,
    // ending with `event: done`.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        const reader = modelStream.getReader();
        let buffer = '';
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const text = extractText(line);
              if (text) ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(text)}\n\n`));
            }
          }
          ctrl.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
        } catch {
          ctrl.enqueue(encoder.encode('event: error\ndata: {}\n\n'));
        } finally {
          clearTimeout(timeout);
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders(origin),
      },
    });
  },
};
