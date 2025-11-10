import React from 'react';

/**
 * About modal component displaying project information
 */
const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto card p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              JAX Bridges <span className="text-gradient">Network</span>
            </h2>
            <p className="text-jax-gray-400">AI-Powered Business Relationship Mapper</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-jax-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-jax-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-jax-gray-300">
          {/* Mission */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
            <p className="leading-relaxed">
              The JAX Bridges Network accelerates business relationship development in the Jacksonville 
              entrepreneurial ecosystem. We automatically analyze business profiles and identify meaningful 
              partnership opportunities, transforming how cohort members discover and connect with potential 
              partners, vendors, and collaborators.
            </p>
          </section>

          {/* The Problem */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">The Challenge</h3>
            <p className="leading-relaxed mb-3">
              Business owners in the JAX Bridges cohort face significant barriers to effective networking:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">•</span>
                <span>Limited time to research and identify relevant partnership opportunities among diverse businesses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">•</span>
                <span>Difficulty evaluating strategic fit before committing to networking conversations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">•</span>
                <span>Valuable synergies remain undiscovered due to lack of systematic analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">•</span>
                <span>No clear path from introduction to actionable business relationship</span>
              </li>
            </ul>
          </section>

          {/* AI-Powered Solution */}
          <section className="bg-gradient-to-br from-jax-cyan/10 to-purple-500/10 p-6 rounded-lg border border-jax-cyan/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-jax-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              How We Leverage AI
            </h3>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Our platform harnesses advanced artificial intelligence to transform business networking:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jax-cyan/20 flex items-center justify-center text-jax-cyan font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Intelligent Analysis</h4>
                    <p className="text-sm">
                      AI evaluates every business pair to identify vendor relationships, strategic partnerships, 
                      referral opportunities, collaborations, and supply chain connections.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jax-cyan/20 flex items-center justify-center text-jax-cyan font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Confidence Scoring</h4>
                    <p className="text-sm">
                      Each relationship receives a confidence score based on business model alignment, target 
                      market overlap, and complementary capabilities, helping you prioritize outreach.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jax-cyan/20 flex items-center justify-center text-jax-cyan font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Actionable Insights</h4>
                    <p className="text-sm">
                      Beyond simple matching, AI generates specific value propositions and concrete action steps 
                      to initiate each relationship, removing barriers to connection.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jax-cyan/20 flex items-center justify-center text-jax-cyan font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Visual Intelligence</h4>
                    <p className="text-sm">
                      The 3D force-directed graph reveals network patterns and relationship clusters that would 
                      be invisible in traditional lists, enabling strategic network navigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-jax-navy/50 rounded-lg border border-jax-gray-800">
                <h4 className="font-semibold text-white mb-2">Interactive 3D Visualization</h4>
                <p className="text-sm">
                  Explore business relationships in an intuitive 3D space, revealing network structure and connection strength.
                </p>
              </div>
              <div className="p-4 bg-jax-navy/50 rounded-lg border border-jax-gray-800">
                <h4 className="font-semibold text-white mb-2">Smart Filtering</h4>
                <p className="text-sm">
                  Focus on specific relationship types, industries, or confidence levels to find exactly what you need.
                </p>
              </div>
              <div className="p-4 bg-jax-navy/50 rounded-lg border border-jax-gray-800">
                <h4 className="font-semibold text-white mb-2">Detailed Insights</h4>
                <p className="text-sm">
                  View comprehensive relationship analysis with reasoning, value propositions, and next steps for each connection.
                </p>
              </div>
              <div className="p-4 bg-jax-navy/50 rounded-lg border border-jax-gray-800">
                <h4 className="font-semibold text-white mb-2">Real-time Stats</h4>
                <p className="text-sm">
                  Track network metrics including total connections, relationship distribution, and your network position.
                </p>
              </div>
            </div>
          </section>

          {/* Impact */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">The Impact</h3>
            <p className="leading-relaxed mb-3">
              By automating relationship discovery and qualification, we enable JAX Bridges members to:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">✓</span>
                <span>Save 10+ hours of manual research per cohort member</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">✓</span>
                <span>Identify high-value partnerships they would have otherwise missed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">✓</span>
                <span>Approach networking conversations with strategic context and preparation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-jax-cyan mt-1">✓</span>
                <span>Accelerate business growth through strategic relationship development</span>
              </li>
            </ul>
          </section>

          {/* Technology */}
          <section className="border-t border-jax-gray-800 pt-6">
            <h3 className="text-xl font-semibold text-white mb-3">Technology Stack</h3>
            <p className="leading-relaxed mb-3">
              Built with modern web technologies and powered by OpenAI GPT-4o for advanced natural language 
              understanding and relationship analysis.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full text-sm text-jax-cyan">
                React 18
              </span>
              <span className="px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full text-sm text-jax-cyan">
                GPT-4o
              </span>
              <span className="px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full text-sm text-jax-cyan">
                3D Force Graph
              </span>
              <span className="px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full text-sm text-jax-cyan">
                Tailwind CSS
              </span>
              <span className="px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full text-sm text-jax-cyan">
                Vite
              </span>
            </div>
          </section>

          {/* Footer */}
          <section className="border-t border-jax-gray-800 pt-6 text-center">
            <p className="text-jax-gray-400 mb-4">
              Created by <span className="text-gradient font-semibold">Vladimir Bichev</span>
            </p>
            <p className="text-sm text-jax-gray-500">
              Building AI solutions that transform how businesses connect and grow.
            </p>
          </section>
        </div>

        {/* Close Button */}
        <div className="flex justify-center pt-4 border-t border-jax-gray-800">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;

