import { useState, useEffect, memo } from 'react';
import { FiSliders, FiX, FiRotateCcw, FiCheck, FiTarget, FiShield, FiCode, FiFlag } from 'react-icons/fi';
import { SYSTEM_PROMPT } from '../lib/prompts.ts';

interface PromptPreset {
  id: string;
  name: string;
  description: string;
  icon: typeof FiSliders;
  prompt: string;
}

const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'ctf',
    name: 'CTF Socratic Mentor',
    description: 'Provides guided hints, methodologies, and nudges without giving away full exploit flags immediately.',
    icon: FiFlag,
    prompt: `You are Cyber AI operating in CTF Mentor Mode. Guide the user through Capture The Flag challenges using the Socratic method:
1. Provide progressive hints, conceptual clues, and tool suggestions first.
2. Ask questions that prompt the user to inspect headers, decompiled code, or network traffic themselves.
3. Reveal full solutions or flags only when the user explicitly requests direct spoilers.
4. Always explain the underlying security vulnerability and root cause.`,
  },
  {
    id: 'red-team',
    name: 'Red Team Pentester',
    description: 'Focuses on offensive methodologies, exploit validation, Metasploit, Burp Suite, and payload craft.',
    icon: FiTarget,
    prompt: `You are Cyber AI in Offensive Security & Red Team Pentest Mode.
Focus on authorized penetration testing, vulnerability identification, exploitation workflows, and adversary emulation.
- Provide detailed commands for tools like Nmap, Burp Suite, Metasploit, SQLMap, and Gobuster.
- Include exploit payloads, privilege escalation techniques, and pivoting procedures for lab and authorized environments.
- Always include mitigation and detection notes alongside exploit steps.`,
  },
  {
    id: 'blue-team',
    name: 'Blue Team & Incident Responder',
    description: 'Focuses on defense, SIEM detection rules, digital forensics, threat hunting, and hardening.',
    icon: FiShield,
    prompt: `You are Cyber AI in Defensive Security & Blue Team Mode.
Focus on threat detection, SIEM log analysis, digital forensics, incident response, and zero-trust hardening.
- Structure responses with detection engineering rules (Sigma, Yara, Snort, Suricata).
- Explain log artifacts (Windows Event IDs, Sysmon, Linux auditd).
- Provide remediation strategies and compliance frameworks (NIST CSF, CIS Benchmarks, MITRE ATT&CK mapping).`,
  },
  {
    id: 'code-audit',
    name: 'Secure Code Auditor',
    description: 'Specializes in OWASP Top 10 code review, vulnerability patch creation, and DevSecOps pipelines.',
    icon: FiCode,
    prompt: `You are Cyber AI in Secure Code Auditor & DevSecOps Mode.
Inspect code snippets for security flaws, unsafe memory handling, injection vulnerabilities, and broken access controls.
- Highlight vulnerable lines and explain root cause flaws (OWASP Top 10, CWE).
- Provide corrected, secure refactored code blocks with comments explaining the fixes.
- Recommend automated SAST/DAST tests and secure dependency practices.`,
  },
];

interface CustomPromptModalProps {
  isOpen: boolean;
  currentPrompt: string;
  onSave: (prompt: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export const CustomPromptModal = memo(function CustomPromptModal({
  isOpen,
  currentPrompt,
  onSave,
  onReset,
  onClose,
}: CustomPromptModalProps) {
  const [draftPrompt, setDraftPrompt] = useState(currentPrompt);
  const [showDefaultPrompt, setShowDefaultPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftPrompt(currentPrompt);
      setShowDefaultPrompt(false);
    }
  }, [isOpen, currentPrompt]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCustomized = Boolean(draftPrompt.trim());
  const activePromptLength = draftPrompt.length;

  const handleApplyPreset = (presetPrompt: string) => {
    setDraftPrompt(presetPrompt);
  };

  const handleSave = () => {
    onSave(draftPrompt.trim());
    onClose();
  };

  const handleReset = () => {
    setDraftPrompt('');
    onReset();
  };

  return (
    <div className="prompt-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="custom-prompt-title">
      <div className="prompt-modal" onClick={e => e.stopPropagation()}>
        <div className="prompt-modal-header">
          <div className="prompt-modal-title-wrap">
            <div className="prompt-modal-icon" aria-hidden="true">
              <FiSliders size={20} />
            </div>
            <div>
              <h2 id="custom-prompt-title" className="prompt-modal-title">Custom System Prompt</h2>
              <p className="prompt-modal-desc">
                Customize Cyber AI&apos;s behavior, personality, or focus area.
              </p>
            </div>
          </div>
          <button className="prompt-modal-close" onClick={onClose} aria-label="Close custom prompt dialog">
            <FiX size={18} />
          </button>
        </div>

        <div className="prompt-modal-body">
          {/* Quick presets */}
          <div className="prompt-presets-section">
            <span className="prompt-section-label">Quick Role Presets</span>
            <div className="prompt-presets-grid">
              {PROMPT_PRESETS.map(preset => {
                const Icon = preset.icon;
                const isSelected = draftPrompt.trim() === preset.prompt.trim();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`prompt-preset-card${isSelected ? ' prompt-preset-card--active' : ''}`}
                    onClick={() => handleApplyPreset(preset.prompt)}
                    title={preset.description}
                  >
                    <div className="prompt-preset-header">
                      <Icon className="prompt-preset-icon" size={16} />
                      <span className="prompt-preset-name">{preset.name}</span>
                    </div>
                    <span className="prompt-preset-desc">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text editor */}
          <div className="prompt-editor-section">
            <div className="prompt-editor-header">
              <label htmlFor="custom-prompt-input" className="prompt-section-label">
                Custom System Instructions {isCustomized ? '(Custom Active)' : '(Default Active)'}
              </label>
              <div className="prompt-editor-actions">
                <button
                  type="button"
                  className="prompt-toggle-default-btn"
                  onClick={() => setShowDefaultPrompt(prev => !prev)}
                >
                  {showDefaultPrompt ? 'Hide Default Prompt' : 'View Default Prompt'}
                </button>
              </div>
            </div>

            {showDefaultPrompt && (
              <div className="prompt-default-preview">
                <div className="prompt-default-preview-title">Built-in Cyber AI System Prompt:</div>
                <pre className="prompt-default-preview-code">{SYSTEM_PROMPT}</pre>
              </div>
            )}

            <textarea
              id="custom-prompt-input"
              className="prompt-textarea"
              value={draftPrompt}
              onChange={e => setDraftPrompt(e.target.value)}
              placeholder="Leave blank to use Cyber AI's default prompt, or write custom system instructions here (e.g. 'Act as a senior penetration tester. Always include command syntax and mitigation notes.')..."
              rows={8}
            />

            <div className="prompt-editor-footer">
              <span className="prompt-char-count">{activePromptLength.toLocaleString()} characters</span>
              {isCustomized && (
                <button
                  type="button"
                  className="prompt-reset-link"
                  onClick={handleReset}
                  title="Clear custom prompt and revert to default"
                >
                  <FiRotateCcw size={13} />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="prompt-modal-footer">
          <button type="button" className="prompt-btn prompt-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="prompt-btn prompt-btn--save"
            onClick={handleSave}
          >
            <FiCheck size={16} />
            <span>Save Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
});
