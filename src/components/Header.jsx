import React from 'react';

/**
 * Header component with branding and info
 * @param {Function} onAboutClick - Handler for about button click
 * @param {Function} onMenuClick - Handler for mobile menu toggle
 * @param {boolean} isMobile - Whether the view is mobile
 */
const Header = ({ onAboutClick, onMenuClick, isMobile }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              onClick={onMenuClick}
              className="p-2 -ml-2 text-jax-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Logo and Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-jax-cyan to-purple-500 flex items-center justify-center glow-cyan relative overflow-hidden">
              {/* Custom network/bridge logo - interconnected nodes */}
              <svg className="w-6 h-6 md:w-8 md:h-8 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connection lines */}
                <path d="M8 12L16 8L24 12M8 20L16 16L24 20M8 12L8 20M24 12L24 20M16 8L16 24" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  opacity="0.6"
                />
                {/* Nodes */}
                <circle cx="16" cy="8" r="2.5" fill="currentColor" />
                <circle cx="8" cy="12" r="2.5" fill="currentColor" />
                <circle cx="24" cy="12" r="2.5" fill="currentColor" />
                <circle cx="16" cy="16" r="3" fill="currentColor" />
                <circle cx="8" cy="20" r="2.5" fill="currentColor" />
                <circle cx="24" cy="20" r="2.5" fill="currentColor" />
                <circle cx="16" cy="24" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                JAX Bridges <span className="text-gradient hidden sm:inline">Network</span>
              </h1>
              <p className="text-xs md:text-sm text-jax-gray-400 hidden sm:block">AI-Powered Business Relationship Mapper</p>
            </div>
          </div>
          
          {/* Action buttons - Desktop only */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onAboutClick}
              className="btn btn-ghost text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </button>
            <a 
              href="https://www.linkedin.com/in/bichev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </a>
          </div>
          
          {/* Mobile: Show contact icon only */}
          {isMobile && (
            <a 
              href="https://www.linkedin.com/in/bichev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 -mr-2 text-jax-cyan"
              aria-label="Contact"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

