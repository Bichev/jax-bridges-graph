import { useMemo } from 'react';
import { buildGraphData } from '../utils/graph-builder';

/**
 * Custom hook to build and memoize graph data
 * @param {Array} businesses - All businesses
 * @param {Array} relationships - All relationships
 * @param {Object} filters - Filter settings
 * @returns {Object} Graph data with nodes and links
 */
const useGraphData = (businesses, relationships, filters) => {
  const graphData = useMemo(() => {
    if (!businesses || !relationships) {
      return { nodes: [], links: [] };
    }
    
    return buildGraphData(businesses, relationships, filters);
  }, [businesses, relationships, filters]);
  
  return graphData;
};

export default useGraphData;

