import { useState } from 'react';
import type { LandingPageProps } from './landing/types';
import { TERMINAL_PRESETS } from './landing/data';
import { LandingNav } from './landing/LandingNav';
import { LandingHero } from './landing/LandingHero';
import { LandingStats } from './landing/LandingStats';
import { LandingFeatured } from './landing/LandingFeatured';
import { LandingTicker } from './landing/LandingTicker';
import { LandingFeatures } from './landing/LandingFeatures';
import { LandingWorkflow } from './landing/LandingWorkflow';
import { LandingUseCases } from './landing/LandingUseCases';
import { LandingFaq } from './landing/LandingFaq';
import { LandingCta } from './landing/LandingCta';
import { LandingFooter } from './landing/LandingFooter';

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'offensive' | 'defensive' | 'learning'>('all');
  const [copiedTerminal, setCopiedTerminal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activePresetId, setActivePresetId] = useState<string>('cve');

  const currentPreset = TERMINAL_PRESETS.find(p => p.id === activePresetId) || TERMINAL_PRESETS[0];

  const handleCopyTerminal = () => {
    const textToCopy = `${currentPreset.command}\n` + currentPreset.output.map(o => o.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="landing">
      {/* Background glow & grid effect */}
      <div className="landing-bg-grid" aria-hidden="true" />

      {/* Nav */}
      <LandingNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onGetStarted={onGetStarted}
      />

      {/* Hero Section & Terminal */}
      <LandingHero
        activePresetId={activePresetId}
        setActivePresetId={setActivePresetId}
        copiedTerminal={copiedTerminal}
        handleCopyTerminal={handleCopyTerminal}
        onGetStarted={onGetStarted}
      />

      {/* Stats Section */}
      <LandingStats />

      {/* Featured On Section */}
      <LandingFeatured />

      {/* Ticker Section */}
      <LandingTicker />

      {/* Features Section */}
      <LandingFeatures
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* How It Works Section */}
      <LandingWorkflow />

      {/* Use Cases Grid */}
      <LandingUseCases />

      {/* FAQ Accordion Section */}
      <LandingFaq
        openFaqIndex={openFaqIndex}
        toggleFaq={toggleFaq}
      />

      {/* Final Call to Action */}
      <LandingCta
        onGetStarted={onGetStarted}
      />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
