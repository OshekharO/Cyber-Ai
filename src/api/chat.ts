const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://ai-sqcn.onrender.com/api/chat';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/chat/completions';
const CORS_PROXY = 'https://cors-bypasser-pro.vercel.app/';
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

/** Which backend actually answered the request. */
export type QuerySource = 'primary' | 'brave';

export interface StreamResult {
  source: QuerySource;
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

/** Timeout for the primary API request (ms). Render free-tier cold starts can be slow. */
const PRIMARY_API_TIMEOUT_MS = 60_000;

/**
 * Minimum number of characters to accumulate before deciding whether the SSE
 * stream is a soft-failure message. The down-message is ~180 chars; buffering
 * this many characters ensures we never emit partial wrong content to the UI.
 */
const DOWN_RESPONSE_DETECT_THRESHOLD = 40;

/**
 * Detects whether a response body is the primary API's soft-failure message.
 * The backend returns HTTP 200 with a warning instead of an error status code,
 * so we must inspect the content to decide whether to fall back to Brave.
 */
function isPrimaryApiDownResponse(content: string): boolean {
  return (
    content.includes('temporarily experiencing an issue') ||
    (content.includes('⚠️') && content.includes('Cyber AI'))
  );
}

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

  // Brave API fallback only supports a single message in the array.
  // We take the last user message and prepend any system instructions.
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const systemMsg = messages.find(m => m.role === 'system');

  let finalContent = '';
  if (systemMsg) {
    finalContent += `INSTRUCTIONS: ${systemMsg.content}\n\n`;
  }
  finalContent += lastUserMsg ? lastUserMsg.content : '';

  const braveMessages = [{
    role: 'user',
    content: finalContent,
  }];

  // Use CORS proxy to avoid 405 Method Not Allowed error
  const res = await fetch(`${CORS_PROXY}proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: BRAVE_API_URL,
      method: 'POST',
      headers: {
        'X-Subscription-Token': BRAVE_API_TOKEN,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
      body: {
        stream: false,
        messages: braveMessages,
      },
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
 * Throws a `ChatError` on failure. On success returns which backend served
 * the response so callers can record it against the user's query.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal: AbortSignal,
): Promise<StreamResult> {
  let res: Response | undefined;
  let useFallback = false;
  let primaryError: ChatError | undefined;
  let source: QuerySource = 'primary';

  // Create a timeout controller linked to the caller's signal so that either
  // the user cancelling or the timeout aborts the same fetch.
  const timeoutCtrl = new AbortController();
  const timeoutId = setTimeout(() => timeoutCtrl.abort(), PRIMARY_API_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any
    ? AbortSignal.any([signal, timeoutCtrl.signal])
    : signal; // fallback for older runtimes without AbortSignal.any

  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client': 'Cyber-AI-Frontend',
      },
      body: JSON.stringify({ messages, stream: true }),
      signal: combinedSignal,
    });
  } catch (err) {
    // Primary API failed, try Brave fallback
    useFallback = true;
    primaryError = classifyError(err);
  } finally {
    clearTimeout(timeoutId);
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
      source = 'brave';
      onToken(reply);
      return { source };
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
    let accumulated = '';
    // null = still detecting, true = confirmed down, false = confirmed normal
    let isDownResponse: boolean | null = null;

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
            if (token) {
              accumulated += token;

              // While still detecting, buffer tokens without emitting.
              // Once we have enough characters (or the stream ends), decide.
              if (isDownResponse === null) {
                if (isPrimaryApiDownResponse(accumulated)) {
                  isDownResponse = true;
                } else if (accumulated.length >= DOWN_RESPONSE_DETECT_THRESHOLD) {
                  // Enough content accumulated and no match → safe to flush
                  isDownResponse = false;
                  onToken(accumulated);
                }
                // else: keep buffering
              } else if (!isDownResponse) {
                // Confirmed normal — stream tokens immediately
                onToken(token);
              }
              // If isDownResponse === true, silently discard tokens
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    }

    // Stream ended while still in detection phase (short response).
    // Flush whatever we have if it wasn't flagged as down.
    if (isDownResponse === null) {
      isDownResponse = isPrimaryApiDownResponse(accumulated);
      if (!isDownResponse && accumulated) {
        onToken(accumulated);
      }
    }

    // If the stream was a soft-failure message, try Brave fallback
    if (isDownResponse) {
      if (BRAVE_API_TOKEN) {
        try {
          const braveReply = await callBraveAPI(messages, signal);
          source = 'brave';
          onToken(braveReply);
          return { source };
        } catch {
          // Brave also failed — show updated credits
          const updated = accumulated.replace(
            /Developed by \*\*[^*]+\*\* & \*\*[^*]+\*\*/,
            'Developed by **Saksham** & **Ayan**',
          );
          onToken(updated);
          return { source };
        }
      } else {
        const updated = accumulated.replace(
          /Developed by \*\*[^*]+\*\* & \*\*[^*]+\*\*/,
          'Developed by **Saksham** & **Ayan**',
        );
        onToken(updated);
        return { source };
      }
    }

    return { source };
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

  // If the primary API returned a soft-failure message (HTTP 200 but content
  // indicates it is down), try the Brave fallback before surfacing the message.
  if (isPrimaryApiDownResponse(reply)) {
    if (BRAVE_API_TOKEN) {
      try {
        const braveReply = await callBraveAPI(messages, signal);
        source = 'brave';
        onToken(braveReply);
        return { source };
      } catch {
        // Brave also failed — replace stale developer credits before showing
        const updated = reply.replace(
          /Developed by \*\*[^*]+\*\* & \*\*[^*]+\*\*/,
          'Developed by **Saksham** & **Ayan**',
        );
        onToken(updated);
        return { source };
      }
    } else {
      // No Brave token available — still update the credits
      const updated = reply.replace(
        /Developed by \*\*[^*]+\*\* & \*\*[^*]+\*\*/,
        'Developed by **Saksham** & **Ayan**',
      );
      onToken(updated);
      return { source };
    }
  }

  onToken(reply);
  return { source };
}
