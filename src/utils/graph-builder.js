/**
 * Graph data structure builder utilities
 */

import { RELATIONSHIP_COLORS, INDUSTRY_COLORS } from './constants';

/**
 * Filter graph data to show only a specific node and its connections
 * @param {Object} graphData - Full graph data with nodes and links
 * @param {string} nodeId - ID of the node to focus on
 * @returns {Object} Filtered graph data
 */
export const filterGraphByNode = (graphData, nodeId) => {
  if (!nodeId || !graphData) {
    return graphData;
  }
  
  // Helper function to get node ID (handles both string IDs and node objects)
  const getNodeId = (node) => typeof node === 'object' ? node.id : node;
  
  // Find all links involving the selected node
  const relevantLinks = graphData.links.filter(link => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    return sourceId === nodeId || targetId === nodeId;
  });
  
  // Get IDs of connected nodes
  const connectedNodeIds = new Set([nodeId]);
  relevantLinks.forEach(link => {
    connectedNodeIds.add(getNodeId(link.source));
    connectedNodeIds.add(getNodeId(link.target));
  });
  
  // Filter nodes to only show selected node and connected nodes
  const filteredNodes = graphData.nodes.filter(node => 
    connectedNodeIds.has(node.id)
  );
  
  return {
    nodes: filteredNodes,
    links: relevantLinks
  };
};

/**
 * Build graph data structure from businesses and relationships
 * @param {Array} businesses - Array of business objects
 * @param {Array} relationships - Array of relationship objects
 * @param {Object} filters - Filter settings
 * @returns {Object} Graph data with nodes and links
 */
export const buildGraphData = (businesses, relationships, filters = {}) => {
  const {
    minConfidence = 50,
    selectedTypes = null,
    selectedIndustries = null
  } = filters;
  
  // Filter relationships
  let filteredRelationships = relationships.filter(r => r.confidence >= minConfidence);
  
  if (selectedTypes && selectedTypes.length > 0) {
    filteredRelationships = filteredRelationships.filter(r => 
      selectedTypes.includes(r.type)
    );
  }
  
  // Build business lookup map
  const businessMap = businesses.reduce((map, business) => {
    map[business.id] = business;
    return map;
  }, {});
  
  // Count connections per business
  const connectionCounts = {};
  filteredRelationships.forEach(rel => {
    connectionCounts[rel.from_id] = (connectionCounts[rel.from_id] || 0) + 1;
    connectionCounts[rel.to_id] = (connectionCounts[rel.to_id] || 0) + 1;
  });
  
  // Build nodes
  let nodes = businesses.map(business => ({
    id: business.id,
    name: business.name,
    industry: business.industry,
    description: business.description,
    connections: connectionCounts[business.id] || 0,
    val: Math.max(5, (connectionCounts[business.id] || 0) * 3), // Node size
    color: INDUSTRY_COLORS[business.industry] || '#64748B',
    business: business // Store full business data
  }));
  
  // Filter nodes by industry if specified
  if (selectedIndustries && selectedIndustries.length > 0) {
    nodes = nodes.filter(n => selectedIndustries.includes(n.industry));
  }
  
  // Build links
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = filteredRelationships
    .filter(rel => nodeIds.has(rel.from_id) && nodeIds.has(rel.to_id))
    .map(rel => ({
      source: rel.from_id,
      target: rel.to_id,
      type: rel.type,
      confidence: rel.confidence,
      value: rel.confidence / 20, // Link thickness
      color: RELATIONSHIP_COLORS[rel.type],
      relationship: rel // Store full relationship data
    }));
  
  return { nodes, links };
};

/**
 * Get relationships for a specific business
 * @param {string} businessId - Business ID
 * @param {Array} relationships - All relationships
 * @param {Array} businesses - All businesses
 * @returns {Array} Business relationships with partner info
 */
export const getBusinessRelationships = (businessId, relationships, businesses) => {
  const businessMap = businesses.reduce((map, b) => {
    map[b.id] = b;
    return map;
  }, {});
  
  const businessRels = relationships
    .filter(rel => rel.from_id === businessId || rel.to_id === businessId)
    .map(rel => {
      const isOutbound = rel.from_id === businessId;
      const partnerId = isOutbound ? rel.to_id : rel.from_id;
      const partner = businessMap[partnerId];
      
      return {
        ...rel,
        direction: isOutbound ? 'outbound' : 'inbound',
        partner: partner,
        partnerName: partner?.name || 'Unknown Business'
      };
    });
  
  // Sort by confidence (highest first)
  return businessRels.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Get network statistics
 * @param {Array} businesses - All businesses
 * @param {Array} relationships - All relationships
 * @returns {Object} Network statistics
 */
export const getNetworkStats = (businesses, relationships) => {
  const connectionCounts = {};
  relationships.forEach(rel => {
    connectionCounts[rel.from_id] = (connectionCounts[rel.from_id] || 0) + 1;
    connectionCounts[rel.to_id] = (connectionCounts[rel.to_id] || 0) + 1;
  });
  
  const connectedBusinesses = Object.keys(connectionCounts).length;
  const avgConnections = connectedBusinesses > 0
    ? Object.values(connectionCounts).reduce((sum, count) => sum + count, 0) / connectedBusinesses
    : 0;
  
  const mostConnected = businesses
    .map(b => ({
      business: b,
      connections: connectionCounts[b.id] || 0
    }))
    .filter(item => item.connections > 0)
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);
  
  const typeBreakdown = relationships.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1;
    return acc;
  }, {});
  
  const avgConfidence = relationships.length > 0
    ? relationships.reduce((sum, r) => sum + r.confidence, 0) / relationships.length
    : 0;
  
  return {
    totalBusinesses: businesses.length,
    totalRelationships: relationships.length,
    connectedBusinesses,
    avgConnections: Math.round(avgConnections * 10) / 10,
    mostConnected,
    typeBreakdown,
    avgConfidence: Math.round(avgConfidence)
  };
};

/**
 * Get unique industries from businesses
 * @param {Array} businesses - All businesses
 * @returns {Array} Sorted list of unique industries
 */
export const getUniqueIndustries = (businesses) => {
  const industries = [...new Set(businesses.map(b => b.industry))];
  return industries.sort();
};

/**
 * Search businesses by name or description
 * @param {Array} businesses - All businesses
 * @param {string} query - Search query
 * @returns {Array} Matching businesses
 */
export const searchBusinesses = (businesses, query) => {
  if (!query || query.trim() === '') {
    return businesses;
  }
  
  const lowerQuery = query.toLowerCase();
  return businesses.filter(b => 
    b.name.toLowerCase().includes(lowerQuery) ||
    b.description.toLowerCase().includes(lowerQuery) ||
    b.industry.toLowerCase().includes(lowerQuery)
  );
};

