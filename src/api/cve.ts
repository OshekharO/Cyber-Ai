export interface CveReference {
  url: string;
  source: string;
  tags: string[];
}

export interface CveWeakness {
  lang: string;
  value: string;
}

export interface CveWeaknesses {
  source: string;
  type: string;
  description: CveWeakness[];
}

export interface CveAffectedVersion {
  version: string;
  status: string;
}

export interface CveAffected {
  vendor: string;
  product: string;
  versions: CveAffectedVersion[];
}

export interface CveAffectedWrapper {
  source: string;
  affectedData: CveAffected[];
}

export interface CveCvssData {
  version: string;
  vectorString: string;
  baseScore: number;
  baseSeverity: string;
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentialityImpact: string;
  integrityImpact: string;
  availabilityImpact: string;
  exploitabilityScore?: number;
  impactScore?: number;
}

export interface CveMetric {
  source: string;
  type: string;
  cvssData: CveCvssData;
  exploitabilityScore?: number;
  impactScore?: number;
}

export interface CveDescription {
  lang: string;
  value: string;
}

export interface CveResponse {
  id: string;
  published: string;
  lastModified: string;
  descriptions: CveDescription[];
  affected: CveAffectedWrapper[];
  metrics: {
    cvssMetricV31?: CveMetric[];
    cvssMetricV2?: CveMetric[];
  };
  weaknesses: CveWeaknesses[];
  references: CveReference[];
}

export interface NvdResponse {
  totalResults: number;
  vulnerabilities: { cve: CveResponse }[];
}

export async function lookupCve(cveId: string): Promise<CveResponse> {
  const trimmed = cveId.trim();
  if (!/^CVE-\d{4}-\d{4,}$/i.test(trimmed)) {
    throw new Error('Invalid CVE format. Use CVE-YYYY-NNNN (e.g., CVE-2019-1010218).');
  }

  const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveIds=${encodeURIComponent(trimmed)}`);
  if (!res.ok) {
    throw new Error(`NVD lookup failed (${res.status}). Try again in a moment.`);
  }

  const data = (await res.json()) as NvdResponse;
  if (!data.vulnerabilities?.length) {
    throw new Error(`No results found for ${trimmed}.`);
  }

  return data.vulnerabilities[0].cve;
}
