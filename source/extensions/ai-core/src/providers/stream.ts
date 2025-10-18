import { createParser } from 'eventsource-parser';

type Msg = { role: 'system'|'user'|'assistant', content: string };
export async function* streamChat(opts: { provider: string; baseUrl: string; apiKey?: string; model: string; messages: Msg[]; temperature: number; }) {
  const { provider, baseUrl, apiKey, model, messages, temperature } = opts;

  const url = `${baseUrl.replace(/\/$/,'')}/chat/completions`;
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  headers['X-FineInk-Provider'] = provider;
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const body = JSON.stringify({ model, temperature, stream: true, messages });
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const pending: string[] = [];
  const parser = createParser(event => {
    if (event.type === 'event' && event.data) {
      if (event.data === '[DONE]') return;
      try {
        const json = JSON.parse(event.data);
        const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? '';
        if (delta) pending.push(delta);
      } catch {}
    }
  });

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
    while (pending.length) {
      yield pending.shift()!;
    }
  }
}
