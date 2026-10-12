import type { ReactNode } from 'react';

export interface LandingPageProps {
  onGetStarted: () => void;
}

export interface TerminalOutput {
  type: 'info' | 'critical' | 'warning' | 'success' | 'detail';
  text: string;
}

export interface TerminalPreset {
  id: string;
  label: string;
  command: string;
  output: TerminalOutput[];
}

export interface FeatureItem {
  id: string;
  category: 'defensive' | 'learning' | 'offensive';
  icon: ReactNode;
  title: string;
  description: string;
  badge: string;
}

export interface StatItem {
  value: string;
  label: string;
  detail: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
}
