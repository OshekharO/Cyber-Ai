interface CvssData {
  version?: string;
  baseScore?: number;
  severity?: string;
  vector?: string;
}

interface CveResponse {
  cveId?: string;
  description?: string;
  severity?: string;
  cvss?: CvssData | null;
  publishedAt?: string;
  modifiedAt?: string;
  error?: string;
}

export async function lookupCve(target: string): Promise<string> {
  const rawInput = target.trim();
  if (!rawInput) {
    return 'Please provide a valid CVE ID. Usage: `/cve <CVE-ID>` (e.g., `/cve CVE-2024-3094`)';
  }

  let cveId = rawInput.toUpperCase();
  if (!cveId.startsWith('CVE-')) {
    cveId = `CVE-${cveId}`;
  }

  const cveRegex = /^CVE-\d{4}-\d{4,7}$/;
  if (!cveRegex.test(cveId)) {
    return `❌ **Invalid CVE ID format:** \`${rawInput}\`. Expected format: \`CVE-YYYY-NNNN\` (e.g., \`CVE-2024-3094\`).`;
  }

  const targetUrl = `https://tridentstack.com/api/v1/cve/${encodeURIComponent(cveId)}`;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      if (res.status === 404) {
        return `❌ **CVE Not Found:** No details available for \`${cveId}\`.`;
      }
      return `❌ **Error:** Failed to fetch CVE details (HTTP ${res.status}).`;
    }

    const data: CveResponse = await res.json();

    if (data.error || !data.cveId) {
      return `❌ **CVE Not Found:** ${data.error || `No details found for \`${cveId}\`.`}`;
    }

    const formattedPublished = data.publishedAt ? new Date(data.publishedAt).toUTCString() : 'N/A';
    const formattedModified = data.modifiedAt ? new Date(data.modifiedAt).toUTCString() : 'N/A';

    let output = `### 🛡️ CVE Details: \`${data.cveId}\`\n\n`;

    if (data.description) {
      output += `**Description:**\n${data.description}\n\n`;
    }

    output += `#### 📌 Summary\n`;
    output += `| Property | Value |\n`;
    output += `| :--- | :--- |\n`;
    output += `| **CVE ID** | \`${data.cveId}\` |\n`;
    output += `| **Severity** | **${data.severity || 'N/A'}** |\n`;
    output += `| **Published At** | ${formattedPublished} |\n`;
    output += `| **Modified At** | ${formattedModified} |\n\n`;

    if (data.cvss) {
      output += `#### 📊 CVSS Information\n`;
      output += `| Property | Value |\n`;
      output += `| :--- | :--- |\n`;
      output += `| **Version** | ${data.cvss.version ?? 'N/A'} |\n`;
      output += `| **Base Score** | **${data.cvss.baseScore ?? 'N/A'}** |\n`;
      output += `| **Severity** | ${data.cvss.severity ?? 'N/A'} |\n`;
      output += `| **Vector** | \`${data.cvss.vector ?? 'N/A'}\` |\n\n`;
    }

    return output.trimEnd();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch CVE details';
    return `❌ **Error looking up CVE:** ${errorMsg}`;
  }
}
