const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://ai-sqcn.onrender.com/api/chat';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ErrorKind = 'network' | 'server' | 'ratelimit' | 'unknown';

export interface ChatError {
  message: string;
  kind: ErrorKind;
}

function classifyError(err: unknown, status?: number): ChatError {
  if (status === 429) {
    return { message: 'Rate limit reached. Please wait a moment before retrying.', kind: 'ratelimit' };
  }
  if (status !== undefined && status >= 500) {
    return { message: `Server error (${status}). Please try again.`, kind: 'server' };
  }
  if (status !== undefined && status >= 400) {
    return { message: `Request failed (${status}).`, kind: 'server' };
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { message: 'Request cancelled.', kind: 'unknown' };
  }
  if (err instanceof TypeError) {
    return { message: 'Network error. Check your connection and try again.', kind: 'network' };
  }
  const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  return { message: msg, kind: 'unknown' };
}

/**
 * Sends messages to the API. Calls `onToken` for each streamed chunk.
 * Falls back to a single-chunk call if the API returns JSON (non-streaming).
 * Throws a `ChatError` on failure.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client': 'Cyber-AI-Frontend',
      },
      body: JSON.stringify({ messages, stream: true }),
      signal,
    });
  } catch (err) {
    throw classifyError(err);
  }

  if (!res.ok) {
    throw classifyError(null, res.status);
  }

  const contentType = res.headers.get('content-type') ?? '';

  // --- Streaming SSE path ---
  if (contentType.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6)) as { choices?: { delta?: { content?: string } }[] };
            const token = json?.choices?.[0]?.delta?.content;
            if (token) onToken(token);
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    }
    return;
  }

  // --- Fallback: non-streaming JSON ---
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw classifyError(new Error('Unexpected response format from server'));
  }

  const reply = (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content;
  if (!reply) {
    throw classifyError(new Error('Unexpected response format from server'));
  }
  onToken(reply);
}
