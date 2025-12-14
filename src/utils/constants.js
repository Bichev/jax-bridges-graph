/**
 * Application-wide constants
 */

// Relationship types
export const RELATIONSHIP_TYPES = {
  VENDOR: 'vendor',
  PARTNER: 'partner',
  COLLABORATION: 'collaboration',
  SUPPLY_CHAIN: 'supply_chain',
  REFERRAL: 'referral'
};

// Relationship type colors (matching brand palette)
export const RELATIONSHIP_COLORS = {
  vendor: '#00D9FF',        // Cyan - JAX brand color
  partner: '#8B5CF6',       // Purple
  referral: '#10B981',      // Green
  collaboration: '#F59E0B', // Amber
  supply_chain: '#EC4899'   // Pink
};

// Relationship type labels
export const RELATIONSHIP_LABELS = {
  vendor: 'Vendor',
  partner: 'Partner',
  referral: 'Referral',
  collaboration: 'Collaboration',
  supply_chain: 'Supply Chain'
};

// Industry colors
export const INDUSTRY_COLORS = {
  'Technology': '#00D9FF',
  'Marketing & Design': '#8B5CF6',
  'Health & Wellness': '#10B981',
  'Coaching & Consulting': '#F59E0B',
  'Real Estate': '#EC4899',
  'Events & Gifts': '#F472B6',
  'Food & Beverage': '#FBBF24',
  'Logistics': '#6366F1',
  'Facilities Services': '#14B8A6',
  'Arts & Creative': '#A78BFA',
  'Professional Services': '#64748B'
};

// Confidence score thresholds
export const CONFIDENCE_LEVELS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 50
};

// Graph configuration
export const GRAPH_CONFIG = {
  nodeRelSize: 8,
  linkWidth: 2,
  linkDirectionalParticles: 2,
  linkDirectionalParticleWidth: 2,
  d3AlphaDecay: 0.02,
  d3VelocityDecay: 0.3,
  backgroundColor: '#050B14',
  nodeOpacity: 0.9,
  linkOpacity: 0.6
};

// Animation durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Filter options
export const FILTER_OPTIONS = {
  minConfidence: 50,
  maxConfidence: 100,
  defaultConfidence: 75,
  defaultTypes: ['vendor', 'partner'] // Default selected relationship types
};

