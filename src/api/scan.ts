interface IpInfoData {
  ip?: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: {
    asn?: string;
    name?: string;
    domain?: string;
    route?: string;
    type?: string;
  };
  company?: {
    name?: string;
    domain?: string;
    type?: string;
  };
  carrier?: {
    name?: string;
    mcc?: string;
    mnc?: string;
  };
  privacy?: {
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    relay?: boolean;
    hosting?: boolean;
    service?: string;
  };
  abuse?: {
    address?: string;
    country?: string;
    email?: string;
    name?: string;
    network?: string;
    phone?: string;
  };
  is_anycast?: boolean;
  is_mobile?: boolean;
  is_anonymous?: boolean;
  is_satellite?: boolean;
  is_hosting?: boolean;
}

interface IpInfoResponse {
  input?: string;
  data?: IpInfoData;
  error?: string | { title?: string; message?: string };
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100;

// In-memory LRU Map cache for IP scan results
const scanCache = new Map<string, CacheEntry>();

function getCachedResult(key: string): string | null {
  const entry = scanCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    scanCache.delete(key);
    return null;
  }

  // Refresh LRU order by deleting and re-setting
  scanCache.delete(key);
  scanCache.set(key, entry);
  return entry.value;
}

function setCachedResult(key: string, value: string): void {
  // If already at capacity, delete oldest item (first key in Map insertion order)
  if (scanCache.size >= MAX_CACHE_SIZE && !scanCache.has(key)) {
    const oldestKey = scanCache.keys().next().value;
    if (oldestKey !== undefined) {
      scanCache.delete(oldestKey);
    }
  }

  scanCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/** Clear cache - helpful for testing */
export function clearScanCache(): void {
  scanCache.clear();
}

export async function scanIpAddress(target: string): Promise<string> {
  const ip = target.trim();
  if (!ip) {
    return 'Please provide a valid IP address. Usage: `/scan <ip>`';
  }

  const cached = getCachedResult(ip);
  if (cached) {
    return cached;
  }

  const targetUrl = `https://ipinfo.io/widget/demo/${encodeURIComponent(ip)}`;

  try {
    const res = await fetch(targetUrl);
    const json: IpInfoResponse = await res.json();

    if (json.error || !json.data) {
      const errDetail = typeof json.error === 'object'
        ? (json.error.message || json.error.title || 'Invalid IP address')
        : (json.error || 'Failed to retrieve IP details');
      return `❌ **Scan Error:** ${errDetail}`;
    }

    const data = json.data;

    let output = `### 🌐 IP Scan Results: \`${data.ip || ip}\`\n\n`;

    // General Information Table
    output += `#### 📍 Location & General Info\n`;
    output += `| Property | Value |\n`;
    output += `| :--- | :--- |\n`;
    output += `| **IP Address** | \`${data.ip || 'N/A'}\` |\n`;
    output += `| **Hostname** | ${data.hostname || 'N/A'} |\n`;
    output += `| **City** | ${data.city || 'N/A'} |\n`;
    output += `| **Region** | ${data.region || 'N/A'} |\n`;
    output += `| **Country** | ${data.country || 'N/A'} |\n`;
    output += `| **Location (Lat, Long)** | ${data.loc || 'N/A'} |\n`;
    output += `| **Postal Code** | ${data.postal || 'N/A'} |\n`;
    output += `| **Timezone** | ${data.timezone || 'N/A'} |\n\n`;

    // Network & Organization Table
    output += `#### 🏢 Network & ASN\n`;
    output += `| Property | Value |\n`;
    output += `| :--- | :--- |\n`;
    output += `| **Organization** | ${data.org || 'N/A'} |\n`;
    if (data.asn) {
      output += `| **ASN** | \`${data.asn.asn || 'N/A'}\` |\n`;
      output += `| **ASN Name** | ${data.asn.name || 'N/A'} |\n`;
      output += `| **Domain** | ${data.asn.domain ? `[${data.asn.domain}](https://${data.asn.domain})` : 'N/A'} |\n`;
      output += `| **Route** | \`${data.asn.route || 'N/A'}\` |\n`;
      output += `| **Type** | ${data.asn.type || 'N/A'} |\n`;
    }
    output += `\n`;

    // Company & Carrier Table
    if (data.company || data.carrier) {
      output += `#### 📡 Provider & Carrier\n`;
      output += `| Property | Value |\n`;
      output += `| :--- | :--- |\n`;
      if (data.company) {
        output += `| **Company Name** | ${data.company.name || 'N/A'} |\n`;
        output += `| **Company Domain** | ${data.company.domain ? `[${data.company.domain}](https://${data.company.domain})` : 'N/A'} |\n`;
        output += `| **Company Type** | ${data.company.type || 'N/A'} |\n`;
      }
      if (data.carrier) {
        output += `| **Carrier Name** | ${data.carrier.name || 'N/A'} |\n`;
        output += `| **MCC / MNC** | ${data.carrier.mcc || 'N/A'} / ${data.carrier.mnc || 'N/A'} |\n`;
      }
      output += `\n`;
    }

    // Security & Privacy Flags Table
    output += `#### 🛡️ Privacy & Security\n`;
    output += `| Flag | Status |\n`;
    output += `| :--- | :--- |\n`;
    output += `| **VPN** | ${data.privacy?.vpn ? '🔴 Yes' : '🟢 No'} |\n`;
    output += `| **Proxy** | ${data.privacy?.proxy ? '🔴 Yes' : '🟢 No'} |\n`;
    output += `| **Tor Node** | ${data.privacy?.tor ? '🔴 Yes' : '🟢 No'} |\n`;
    output += `| **Relay** | ${data.privacy?.relay ? '🔴 Yes' : '🟢 No'} |\n`;
    output += `| **Hosting / Cloud** | ${data.is_hosting || data.privacy?.hosting ? '⚠️ Yes' : '🟢 No'} |\n`;
    output += `| **Mobile Network** | ${data.is_mobile ? '📱 Yes' : '⚪ No'} |\n`;
    output += `| **Anycast** | ${data.is_anycast ? '⚡ Yes' : '⚪ No'} |\n\n`;

    // Abuse Contact Table
    if (data.abuse) {
      output += `#### ⚠️ Abuse Contact\n`;
      output += `| Property | Value |\n`;
      output += `| :--- | :--- |\n`;
      output += `| **Name** | ${data.abuse.name || 'N/A'} |\n`;
      output += `| **Email** | ${data.abuse.email ? `[\`${data.abuse.email}\`](mailto:${data.abuse.email})` : 'N/A'} |\n`;
      output += `| **Phone** | ${data.abuse.phone || 'N/A'} |\n`;
      output += `| **Network Range** | \`${data.abuse.network || 'N/A'}\` |\n\n`;
    }

    const result = output.trimEnd();
    setCachedResult(ip, result);
    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch IP details';
    return `❌ **Error scanning IP:** ${errorMsg}`;
  }
}
