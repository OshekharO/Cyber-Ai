import { FiTrash2, FiBook, FiSearch, FiMap } from 'react-icons/fi';

interface Command {
  trigger: string;
  label: string;
  description: string;
  template: string;
  icon: string;
}

const COMMAND_ICONS: Record<string, any> = {
  '/clear': FiTrash2,
  '/explain': FiBook,
  '/cve': FiSearch,
  '/scan': FiMap
};

const COMMANDS: Command[] = [
  { trigger: '/clear', label: '/clear', description: 'Clear conversation', template: '/clear', icon: '' },
  { trigger: '/explain', label: '/explain <tool>', description: 'Explain a security tool', template: '/explain ', icon: '' },
  { trigger: '/cve', label: '/cve <CVE-ID>', description: 'Look up a CVE', template: '/cve ', icon: '' },
  { trigger: '/scan', label: '/scan <target>', description: 'Generate a recon command', template: '/scan ', icon: '' },
];

interface CommandPaletteProps {
  input: string;
  onSelect: (template: string) => void;
  onExecute: (command: string) => void;
}

export function CommandPalette({ input, onSelect, onExecute }: CommandPaletteProps) {
  if (!input.startsWith('/')) return null;

  const query = input.slice(1).toLowerCase();
  const filtered = COMMANDS.filter(c =>
    c.trigger.slice(1).startsWith(query) || c.description.toLowerCase().includes(query)
  );

  if (filtered.length === 0) return null;

  return (
    <div className="command-palette" role="listbox" aria-label="Available commands">
      <div className="command-palette-header">Commands</div>
      {filtered.map(cmd => (
        <button
          key={cmd.trigger}
          className="command-item"
          role="option"
          aria-selected={false}
          onClick={() => {
            if (cmd.trigger === '/clear') {
              onExecute('/clear');
            } else {
              onSelect(cmd.template);
            }
          }}
        >
          <COMMAND_ICONS[cmd.trigger as keyof typeof COMMAND_ICONS] className="command-icon" aria-hidden="true" size={18} />
          <div className="command-info">
            <span className="command-label">{cmd.label}</span>
            <span className="command-desc">{cmd.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
