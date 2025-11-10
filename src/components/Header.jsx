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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jax-cyan to-purple-500 flex items-center justify-center glow-cyan">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

