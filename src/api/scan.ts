export async function scanIpAddress(target: string): Promise<string> {
  const ip = target.trim();
  if (!ip) {
    return 'Please provide a valid IP address. Usage: `/scan <ip>`';
  }

  const targetUrl = `https://ipinfo.io/widget/demo/${encodeURIComponent(ip)}`;

  try {
    const res = await fetch(targetUrl);
    const json = await res.json();
    return `\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch IP details';
    return `\`\`\`json\n{\n  "error": ${JSON.stringify(errorMsg)}\n}\n\`\`\``;
  }
}
