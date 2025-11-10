import React from 'react';
import { getNetworkStats } from '../utils/graph-builder';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../utils/constants';

/**
 * Network statistics dashboard component
 */
const NetworkStats = ({ businesses, relationships, selectedBusiness }) => {
  const stats = getNetworkStats(businesses, relationships);
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Businesses"
          value={stats.totalBusinesses}
          color="cyan"
        />
        
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          label="Connections"
          value={stats.totalRelationships}
          color="purple"
        />
      </div>
      
      {/* Average Stats */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-jax-gray-400 uppercase tracking-wide">
          Network Health
        </h3>
        
        <div className="space-y-2">
          <StatRow 
            label="Avg Connections" 
            value={stats.avgConnections.toFixed(1)}
            icon="📊"
          />
          <StatRow 
            label="Avg Confidence" 
            value={`${stats.avgConfidence}%`}
            icon="🎯"
          />
          <StatRow 
            label="Connected Businesses" 
            value={`${stats.connectedBusinesses}/${stats.totalBusinesses}`}
            icon="🔗"
          />
        </div>
      </div>
      
      {/* Relationship Types */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-jax-gray-400 uppercase tracking-wide">
          Relationship Types
        </h3>
        
        <div className="space-y-2">
          {Object.entries(stats.typeBreakdown).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
                />
                <span className="text-sm text-jax-gray-300">
                  {RELATIONSHIP_LABELS[type]}
                </span>
              </div>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Most Connected */}
      {stats.mostConnected.length > 0 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-jax-gray-400 uppercase tracking-wide">
            Most Connected
          </h3>
          
          <div className="space-y-2">
            {stats.mostConnected.map((item, idx) => (
              <div key={item.business.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-jax-cyan/20 text-jax-cyan flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {item.business.name}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge bg-jax-cyan/10 text-jax-cyan">
                    {item.connections}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Stat card component
 */
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    cyan: 'from-jax-cyan/20 to-jax-cyan/5 text-jax-cyan',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400'
  };
  
  return (
    <div className={`card p-4 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-jax-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Stat row component
 */
const StatRow = ({ label, value, icon }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-jax-gray-400">
        {icon} {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
};

export default NetworkStats;

