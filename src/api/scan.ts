export async function scanIpAddress(target: string): Promise<string> {
  const ip = target.trim();
  const targetUrl = `https://ipinfo.io/widget/demo/${encodeURIComponent(ip)}`;

  try {
    const res = await fetch(targetUrl);
    const contentType = res.headers.get('content-type') || 'application/json';
    const json = await res.json();

    return `GET ${targetUrl} ${res.status}\n\nResponse Headers\n\ncontent-type: ${contentType}\n\n${JSON.stringify(json, null, 2)}`;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch IP details';
    return `GET ${targetUrl} 500\n\nResponse Headers\n\ncontent-type: application/json\n\n{\n  "error": ${JSON.stringify(errorMsg)}\n}`;
  }
}
