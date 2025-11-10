import React from 'react';
import { getBusinessRelationships } from '../utils/graph-builder';
import { 
  formatConfidence, 
  getConfidenceLevelColor, 
  formatContact,
  formatUrl,
  sortByConfidence
} from '../utils/formatters';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../utils/constants';

/**
 * Business detail panel showing relationships and opportunities
 */
const BusinessDetailPanel = ({ business, relationships, businesses, onClose }) => {
  if (!business) return null;
  
  const businessRelationships = sortByConfidence(
    getBusinessRelationships(business.id, relationships, businesses)
  );
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-jax-navy border-l border-jax-gray-800 shadow-2xl z-50 overflow-y-auto animate-slide-left">
      <div className="sticky top-0 bg-jax-navy/95 backdrop-blur-sm border-b border-jax-gray-800 z-50 pt-20 md:pt-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-white">Business Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-jax-gray-800 rounded-lg transition-colors relative z-50"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6 text-jax-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Business Info Card */}
        <div className="card p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{business.name}</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-jax-cyan" />
              <span className="text-sm text-jax-cyan font-medium">{business.industry}</span>
            </div>
          </div>
          
          <p className="text-jax-gray-300 leading-relaxed">{business.description}</p>
          
          {/* Contact Info */}
          <div className="space-y-2 pt-4 border-t border-jax-gray-800">
            {business.contact_name && business.contact_name !== 'Not specified' && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="Contact"
                value={business.contact_name}
              />
            )}
            
            {business.contact_email && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                label="Email"
                value={
                  <a href={`mailto:${business.contact_email}`} className="text-jax-cyan hover:underline">
                    {business.contact_email}
                  </a>
                }
              />
            )}
            
            {business.contact_phone && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                label="Phone"
                value={
                  <a href={`tel:${business.contact_phone}`} className="text-jax-cyan hover:underline">
                    {business.contact_phone}
                  </a>
                }
              />
            )}
            
            {business.website && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
                label="Website"
                value={
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-jax-cyan hover:underline">
                    {formatUrl(business.website)}
                  </a>
                }
              />
            )}
          </div>
          
          {/* Target Market & Needs */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-jax-gray-800">
            {business.target_market && business.target_market !== 'Not specified' && (
              <div>
                <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-1">Target Market</p>
                <p className="text-sm text-jax-gray-300">{business.target_market}</p>
              </div>
            )}
            
            {business.current_needs && business.current_needs !== 'Not specified' && (
              <div>
                <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-1">Current Needs</p>
                <p className="text-sm text-jax-gray-300">{business.current_needs}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Relationships Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Partnership Opportunities
            </h3>
            <span className="badge bg-jax-cyan/10 text-jax-cyan">
              {businessRelationships.length}
            </span>
          </div>
          
          {businessRelationships.length === 0 ? (
            <div className="card p-6 text-center">
              <svg className="w-12 h-12 text-jax-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-jax-gray-400">
                No relationships found for this business.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessRelationships.map((rel, idx) => (
                <RelationshipCard key={`${rel.from_id}-${rel.to_id}-${idx}`} relationship={rel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Info row component
 */
const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 text-jax-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-jax-gray-500 block">{label}</span>
        <div className="text-sm text-jax-gray-300 break-words">{value}</div>
      </div>
    </div>
  );
};

/**
 * Relationship card component
 */
const RelationshipCard = ({ relationship }) => {
  const { 
    type, 
    confidence, 
    reasoning, 
    value_prop, 
    collaboration_example,
    synergy_potential,
    action_items, 
    partner, 
    direction 
  } = relationship;
  
  return (
    <div className="card-hover p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white mb-1">
            {partner.name}
          </h4>
          <p className="text-sm text-jax-gray-400">{partner.industry}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`badge ${getConfidenceLevelColor(confidence)}`}>
            {formatConfidence(confidence)}
          </span>
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
            />
            <span className="text-xs text-jax-gray-400 font-medium uppercase tracking-wide">
              {RELATIONSHIP_LABELS[type]}
            </span>
          </div>
        </div>
      </div>
      
      {/* Direction indicator */}
      <div className="flex items-center gap-2 text-xs text-jax-gray-500">
        {direction === 'outbound' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>You provide to them</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>They provide to you</span>
          </>
        )}
      </div>
      
      {/* Why This Partnership Makes Sense */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-jax-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-jax-gray-500 uppercase mb-1">Why This Works</p>
            <p className="text-sm text-jax-gray-300 leading-relaxed">{reasoning}</p>
          </div>
        </div>
        
        {value_prop && (
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-500 uppercase mb-1">Value Proposition</p>
              <p className="text-sm text-green-300 leading-relaxed font-medium">{value_prop}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Collaboration Example - NEW! */}
      {collaboration_example && collaboration_example !== 'No specific example provided' && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                💡 Real Partnership Scenario
                <span className="text-xs font-normal text-purple-400/60">(AI-Generated Example)</span>
              </h4>
              <p className="text-sm text-purple-100 leading-relaxed italic">
                "{collaboration_example}"
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Synergy Potential - NEW! */}
      {synergy_potential && synergy_potential !== 'Complementary business synergy' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-400 uppercase mb-1">🌟 Unique Synergy</p>
              <p className="text-xs text-amber-200 leading-relaxed">{synergy_potential}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Items */}
      {action_items && action_items.length > 0 && (
        <div className="pt-3 border-t border-jax-gray-800">
          <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-2">Next Steps</p>
          <ul className="space-y-2">
            {action_items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-jax-cyan/10 text-jax-cyan flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-jax-gray-300 flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Contact Button */}
      {partner.contact_email && (
        <div className="pt-3">
          <a
            href={`mailto:${partner.contact_email}?subject=Partnership Opportunity from JAX Bridges`}
            className="btn btn-primary w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact {partner.name}
          </a>
        </div>
      )}
    </div>
  );
};

export default BusinessDetailPanel;

