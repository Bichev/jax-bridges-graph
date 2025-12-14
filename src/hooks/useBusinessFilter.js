import { useState, useCallback } from 'react';
import { FILTER_OPTIONS } from '../utils/constants';

/**
 * Custom hook for managing business and relationship filters
 * @returns {Object} Filter state and setter functions
 */
const useBusinessFilter = () => {
  const [filters, setFilters] = useState({
    minConfidence: FILTER_OPTIONS.defaultConfidence,
    selectedTypes: FILTER_OPTIONS.defaultTypes || [],
    selectedIndustries: [],
    searchQuery: ''
  });
  
  const updateMinConfidence = useCallback((value) => {
    setFilters(prev => ({ ...prev, minConfidence: value }));
  }, []);
  
  const toggleType = useCallback((type) => {
    setFilters(prev => {
      const currentTypes = prev.selectedTypes;
      const isSelected = currentTypes.includes(type);
      
      return {
        ...prev,
        selectedTypes: isSelected
          ? currentTypes.filter(t => t !== type)
          : [...currentTypes, type]
      };
    });
  }, []);
  
  const toggleIndustry = useCallback((industry) => {
    setFilters(prev => {
      const currentIndustries = prev.selectedIndustries;
      const isSelected = currentIndustries.includes(industry);
      
      return {
        ...prev,
        selectedIndustries: isSelected
          ? currentIndustries.filter(i => i !== industry)
          : [...currentIndustries, industry]
      };
    });
  }, []);
  
  const updateSearchQuery = useCallback((query) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      minConfidence: FILTER_OPTIONS.defaultConfidence,
      selectedTypes: FILTER_OPTIONS.defaultTypes || [],
      selectedIndustries: [],
      searchQuery: ''
    });
  }, []);
  
  return {
    filters,
    updateMinConfidence,
    toggleType,
    toggleIndustry,
    updateSearchQuery,
    resetFilters
  };
};

export default useBusinessFilter;

