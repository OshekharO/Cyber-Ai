const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://ai-sqcn.onrender.com/api/chat';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/chat/completions';
const BRAVE_API_TOKEN = import.meta.env.VITE_BRAVE_API_TOKEN as string | undefined;

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

const SSE_DONE_MARKER = 'data: [DONE]';

/**
 * Calls Brave Search API as a fallback.
 * Returns the assistant's response content or throws on error.
 */
async function callBraveAPI(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  if (!BRAVE_API_TOKEN) {
    throw new Error('Brave API token not configured');
  }

  // Brave API doesn't support 'system' role, so we prepend system instructions to the first user message
  const braveMessages = messages.map((m, index) => {
    if (m.role === 'system') {
      // Skip system messages, they'll be prepended to the next user message
      return null;
    }
    if (m.role === 'user' && index > 0) {
      // Check if there was a system message before this user message
      const hasPriorSystem = messages.slice(0, index).some(msg => msg.role === 'system');
      if (hasPriorSystem) {
        const systemMsg = messages.find(msg => msg.role === 'system');
        if (systemMsg) {
          return {
            role: 'user',
            content: `INSTRUCTIONS: ${systemMsg.content}\n\nQUESTION: ${m.content}`,
          };
        }
      }
    }
    // For the first user message or if no system message exists
    if (m.role === 'user') {
      const systemMsg = messages.find(msg => msg.role === 'system');
      if (systemMsg) {
        return {
          role: 'user',
          content: `INSTRUCTIONS: ${systemMsg.content}\n\nQUESTION: ${m.content}`,
        };
      }
    }
    return { role: m.role, content: m.content };
  }).filter(Boolean);

  const res = await fetch(BRAVE_API_URL, {
    method: 'POST',
    headers: {
      'X-Subscription-Token': BRAVE_API_TOKEN,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stream: false,
      messages: braveMessages,
    }),
    signal,
  });

  if (!res.ok) {
    throw classifyError(null, res.status);
  }

  const data = await res.json() as {
    choices?: { message?: { content?: string } }[];
  };

  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) {
    throw classifyError(new Error('Unexpected response format from Brave API'));
  }

  return reply;
}

/**
 * Sends messages to the API. Calls `onToken` for each streamed chunk.
 * Falls back to a single-chunk call if the API returns JSON (non-streaming).
 * If the primary API fails, falls back to Brave Search API.
 * Throws a `ChatError` on failure.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response | undefined;
  let useFallback = false;
  let primaryError: ChatError | undefined;

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
    // Primary API failed, try Brave fallback
    useFallback = true;
    primaryError = classifyError(err);
  }

  if (!useFallback && res && !res.ok) {
    // Check if we should use fallback for certain errors
    if (res.status === 429 || res.status >= 500) {
      useFallback = true;
    } else {
      throw classifyError(null, res.status);
    }
  }

  // Use Brave API as fallback
  if (useFallback && BRAVE_API_TOKEN) {
    try {
      const reply = await callBraveAPI(messages, signal);
      onToken(reply);
      return;
    } catch (braveErr) {
      // If Brave also fails, throw the original error or Brave error
      if (primaryError) {
        throw primaryError;
      }
      if (res && !res.ok) {
        throw classifyError(null, res.status);
      }
      throw classifyError(braveErr);
    }
  }

  if (useFallback && !BRAVE_API_TOKEN) {
    throw primaryError ?? classifyError(new Error('Network error'));
  }

  // At this point, res must be defined and ok
  if (!res) {
    throw classifyError(new Error('Unexpected state: response is undefined'));
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
        if (!trimmed || trimmed === SSE_DONE_MARKER) continue;
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
