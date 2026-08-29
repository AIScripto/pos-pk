import React from 'react';
import { Store } from 'lucide-react';

/**
 * BrandHero Component
 * 
 * Renders the left-side enterprise branding panel for login screens.
 * Displays logo icon with gradient glow, application title, tagline,
 * and quick-service restaurant value proposition.
 * 
 * @component
 */
export const BrandHero: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center items-start lg:w-1/3 px-8 xl:px-16 py-8 select-none">
      {/* Animated Glowing Logo Container */}
      <div className="flex items-center justify-start mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-deep rounded-2xl blur-lg opacity-50"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand to-brand-deep rounded-2xl shadow-xl">
            <Store className="w-11 h-11 text-white" />
          </div>
        </div>
      </div>

      {/* Brand Heading & Subtitles */}
      <h1 className="text-5xl font-black text-white mb-3">Enterprise POS</h1>
      <p className="text-2xl text-warning font-bold tracking-wide mb-4">POS System</p>
      <p className="text-screen-subtle text-lg">Fast. Professional. Reliable.</p>

      {/* Enterprise Description Footer */}
      <p className="text-screen-muted text-sm mt-8 max-w-sm leading-relaxed">
        Enterprise-grade point of sale system designed for modern quick service restaurants.
      </p>
    </div>
  );
};

export default BrandHero;
