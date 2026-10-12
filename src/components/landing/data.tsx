import { FiSearch, FiCode, FiGlobe, FiLock, FiShield, FiAward } from 'react-icons/fi';
import type { TerminalPreset, FeatureItem, StatItem, FaqItem, WorkflowStep } from './types';

export const TERMINAL_PRESETS: TerminalPreset[] = [
  {
    id: 'cve',
    label: 'CVE Query',
    command: 'cyber-ai query cve --id CVE-2024-21626 --deep-scan',
    output: [
      { type: 'info', text: '[+] Querying NVD, MITRE ATT&CK & VulnDB databases...' },
      { type: 'critical', text: '[!] CRITICAL: runc container breakout via file descriptor leak' },
      { type: 'warning', text: '[>] CVSS Score: 8.6 (HIGH) | Vector: CVSS:3.1/AV:L/AC:L/PR:N/UI:N' },
      { type: 'success', text: '[>] Mitigation: Upgrade runc to 1.1.12+ or enforce AppArmor profile' },
      { type: 'detail', text: '[>] Exploit Analysis: Leaked cwd fd allows container escape to host root fs.' }
    ]
  },
  {
    id: 'nmap',
    label: 'Nmap Audit',
    command: 'cyber-ai analyze nmap -f scan_results.xml --ai-hardening',
    output: [
      { type: 'info', text: '[+] Parsing XML scan output (3 host(s) up, 14 open ports)...' },
      { type: 'critical', text: '[!] Open Port: 445/tcp (SMBv1) -> Vulnerable to MS17-010 (EternalBlue)' },
      { type: 'warning', text: '[>] Defensive Action: Disable SMBv1 immediately via PowerShell' },
      { type: 'success', text: '[>] Command: Set-SmbServerConfiguration -EnableSMB1Protocol $false' },
      { type: 'detail', text: '[>] Firewall Rule: Block inbound port 445 on external perimeter interfaces.' }
    ]
  },
  {
    id: 'pwn',
    label: 'CTF Pwn',
    command: 'cyber-ai ctf-solve --category pwn --binary ./vuln_target',
    output: [
      { type: 'info', text: '[+] Decompiling ELF64 binary with Ghidra analysis engine...' },
      { type: 'critical', text: '[!] Vulnerability: Stack-based Buffer Overflow in vulnerable_read()' },
      { type: 'warning', text: '[>] Calculated Offset: 72 bytes | ROP Gadget: 0x4011d3 (pop rdi; ret)' },
      { type: 'success', text: '[>] Generated Pwntools Exploit Template saved to ./exploit.py' },
      { type: 'detail', text: '[>] Interactive Shell payload ready for remote execution.' }
    ]
  },
  {
    id: 'sast',
    label: 'DevSecOps',
    command: 'cyber-ai audit sast --repo ./src --policy owasp-top-10',
    output: [
      { type: 'info', text: '[+] Scanning 142 source files for hardcoded secrets & SQL injection...' },
      { type: 'critical', text: '[!] Hardcoded Secret: AWS API Key detected in src/config/aws.ts:24' },
      { type: 'warning', text: '[>] Patch Suggested: Inject variable via process.env.AWS_SECRET_KEY' },
      { type: 'success', text: '[+] Compliance Score: 94% (A Grade) | SAST Checks Passed' },
      { type: 'detail', text: '[>] Automated GitHub Action PR generated for secret rotation.' }
    ]
  }
];

export const FEATURES: FeatureItem[] = [
  {
    id: 'threat-analysis',
    category: 'defensive',
    icon: <FiSearch size={22} />,
    title: 'Threat Analysis & CVEs',
    description: 'Deep-dive into malware heuristics, ransomware chains, zero-days, and CVE explanations with actionable, security-focused remediation.',
    badge: 'Real-time',
  },
  {
    id: 'ctf-coaching',
    category: 'learning',
    icon: <FiCode size={22} />,
    title: 'CTF Walkthroughs & Hints',
    description: 'Structured, spoiler-managed hints and walkthroughs for Web, Pwn, Crypto, Forensics, Reverse Engineering, and Hardware.',
    badge: 'Interactive',
  },
  {
    id: 'pentesting',
    category: 'offensive',
    icon: <FiGlobe size={22} />,
    title: 'Pentesting Workflows',
    description: 'Metasploit, Burp Suite, Nmap, SQLMap, and custom exploit development explained with exact commands and parameters.',
    badge: 'Offensive',
  },
  {
    id: 'secure-coding',
    category: 'defensive',
    icon: <FiLock size={22} />,
    title: 'Secure DevSecOps & SAST',
    description: 'OWASP Top 10 mitigation, secret scanning, CI/CD pipeline security, SAST/DAST integration, and input validation design.',
    badge: 'DevSecOps',
  },
  {
    id: 'compliance',
    category: 'defensive',
    icon: <FiShield size={22} />,
    title: 'Compliance & Frameworks',
    description: 'NIST CSF, ISO 27001, SOC 2, GDPR, CIS Benchmarks, and MITRE ATT&CK technique mapping for audit readiness.',
    badge: 'Governance',
  },
  {
    id: 'labs-skills',
    category: 'learning',
    icon: <FiAward size={22} />,
    title: 'Guided Labs & Environment Prep',
    description: 'HackTheBox, TryHackMe, Kali Linux setups, Dockerized vulnerable environments, and customized skill roadmaps.',
    badge: 'Hands-on',
  },
];

export const STATS: StatItem[] = [
  { value: '326,000+', label: 'CVE Records Parsed', detail: 'NVD, MITRE ATT&CK & CISA' },
  { value: '50+', label: 'Security Tools Mastered', detail: 'Nmap, Metasploit, Burp & Ghidra' },
  { value: '12', label: 'CTF Domains Covered', detail: 'Binary, Crypto, Web & OSINT' },
  { value: '99.9%', label: 'Uptime & Speed', detail: 'Sub-second AI security analysis' },
];

export const FAQS: FaqItem[] = [
  {
    q: 'What is Cyber AI and who is it designed for?',
    a: 'Cyber AI is an AI-powered intelligence co-pilot designed for cybersecurity engineers, penetration testers, SOC analysts, CTF competitors, and students. It assists with threat research, CTF hints, payload synthesis, and compliance mapping.'
  },
  {
    q: 'Is Cyber AI strictly safe and legal to use?',
    a: 'Yes. Cyber AI adheres to ethical hacking guidelines, legal boundaries, and responsible disclosure practices. It provides technical knowledge for defense, vulnerability analysis, and authorized penetration testing.'
  },
  {
    q: 'Can Cyber AI generate specific tool commands like Nmap or Metasploit?',
    a: 'Absolutely. Cyber AI understands command-line tools across Linux and Windows environments, providing syntax, explanation of flags, and recommended defense configurations.'
  },
  {
    q: 'Is there a light theme supported?',
    a: 'Yes, Cyber AI seamlessly toggles between dark and light themes while maintaining high contrast and accessibility across all screen sizes.'
  }
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: '01',
    title: 'Input Artifact or Query',
    desc: 'Paste a CVE ID, log snippet, Wireshark packet capture, or target environment scenario.'
  },
  {
    step: '02',
    title: 'Deep AI Threat Analysis',
    desc: 'Cyber AI queries threat databases and vulnerability models to synthesize practical insights.'
  },
  {
    step: '03',
    title: 'Payload & Strategy Synthesis',
    desc: 'Receive verified CLI commands, exploit hints, SAST fix patches, or compliance mapping.'
  },
  {
    step: '04',
    title: 'Responsible Execution',
    desc: 'Execute safely within scope, enforce security controls, and document findings for compliance.'
  }
];

export const USE_CASE_CHIPS: string[] = [
  'Threat Intelligence', 'Penetration Testing', 'CTF Walkthroughs', 'Burp Suite Automation',
  'Secure Code Auditing', 'NIST / ISO 27001 Compliance', 'Incident Response (IR)',
  'Red Team / Blue Team', 'Cloud Hardening (AWS/GCP)', 'Applied Cryptography',
  'OSINT Investigations', 'Reverse Engineering', 'SAST & DAST Pipelines', 'Docker Sandbox Security'
];
