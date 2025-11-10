import React, { useState } from 'react';
import { RELATIONSHIP_TYPES, RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../utils/constants';
import { getUniqueIndustries } from '../utils/graph-builder';

/**
 * Filter panel component for relationships and businesses
 */
const FilterPanel = ({ 
  businesses, 
  filters, 
  updateMinConfidence, 
  toggleType, 
  toggleIndustry,
  updateSearchQuery,
  resetFilters 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const industries = getUniqueIndustries(businesses);
  
  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-jax-gray-400 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-jax-gray-400 hover:text-white transition-colors"
        >
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          {/* Search */}
          <div>
            <label className="block text-xs text-jax-gray-400 mb-2">Search Businesses</label>
            <input
              type="text"
              placeholder="Type to search..."
              value={filters.searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>
          
          {/* Confidence Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-jax-gray-400">Min Confidence</label>
              <span className="text-sm font-semibold text-jax-cyan">{filters.minConfidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={filters.minConfidence}
              onChange={(e) => updateMinConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-jax-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00D9FF 0%, #00D9FF ${(filters.minConfidence - 50) * 2}%, #1E293B ${(filters.minConfidence - 50) * 2}%, #1E293B 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-jax-gray-500 mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Relationship Types */}
          <div>
            <label className="block text-xs text-jax-gray-400 mb-2">Relationship Types</label>
            <div className="space-y-2">
              {Object.values(RELATIONSHIP_TYPES).map(type => (
                <label 
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    filters.selectedTypes.includes(type)
                      ? 'bg-jax-cyan border-jax-cyan'
                      : 'border-jax-gray-700 group-hover:border-jax-cyan/50'
                  }`}>
                    {filters.selectedTypes.includes(type) && (
                      <svg className="w-3 h-3 text-jax-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
                    />
                    <span className="text-sm text-jax-gray-300 group-hover:text-white transition-colors">
                      {RELATIONSHIP_LABELS[type]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Industries (collapsible) */}
          {industries.length > 0 && (
            <div>
              <label className="block text-xs text-jax-gray-400 mb-2">Industries</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {industries.map(industry => (
                  <label 
                    key={industry}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedIndustries.includes(industry)}
                      onChange={() => toggleIndustry(industry)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      filters.selectedIndustries.includes(industry)
                        ? 'bg-jax-cyan border-jax-cyan'
                        : 'border-jax-gray-700 group-hover:border-jax-cyan/50'
                    }`}>
                      {filters.selectedIndustries.includes(industry) && (
                        <svg className="w-3 h-3 text-jax-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-jax-gray-300 group-hover:text-white transition-colors truncate">
                      {industry}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="btn btn-ghost w-full text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

