import React from 'react';

/**
 * Header component with branding and info
 */
const Header = ({ onAboutClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jax-cyan to-purple-500 flex items-center justify-center glow-cyan relative overflow-hidden">
              {/* Custom network/bridge logo - interconnected nodes */}
              <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <h1 className="text-xl font-bold text-white">
                JAX Bridges <span className="text-gradient">Network</span>
              </h1>
              <p className="text-sm text-jax-gray-400">AI-Powered Business Relationship Mapper</p>
            </div>
          </div>
          
          {/* Action buttons */}
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
              // href="https://jaxaiagency.com" 
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
        </div>
      </div>
    </header>
  );
};

export default Header;

