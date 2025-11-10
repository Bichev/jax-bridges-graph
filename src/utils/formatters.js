/**
 * Data formatting utilities
 */

/**
 * Format confidence score as percentage
 * @param {number} score - Confidence score (0-100)
 * @returns {string} Formatted percentage
 */
export const formatConfidence = (score) => {
  return `${Math.round(score)}%`;
};

/**
 * Get confidence level label
 * @param {number} score - Confidence score (0-100)
 * @returns {string} Level label
 */
export const getConfidenceLevel = (score) => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};

/**
 * Get confidence level color
 * @param {number} score - Confidence score (0-100)
 * @returns {string} Tailwind color class
 */
export const getConfidenceLevelColor = (score) => {
  if (score >= 80) return 'text-green-400 bg-green-400/10';
  if (score >= 60) return 'text-yellow-400 bg-yellow-400/10';
  return 'text-orange-400 bg-orange-400/10';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format contact information
 * @param {Object} business - Business object
 * @returns {string} Formatted contact
 */
export const formatContact = (business) => {
  const parts = [];
  
  if (business.contact_name && business.contact_name !== 'Not specified') {
    parts.push(business.contact_name);
  }
  
  if (business.contact_email) {
    parts.push(business.contact_email);
  }
  
  if (business.contact_phone) {
    parts.push(business.contact_phone);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Contact not available';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format URL for display
 * @param {string} url - URL string
 * @returns {string} Formatted URL
 */
export const formatUrl = (url) => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

/**
 * Get initials from business name
 * @param {string} name - Business name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Sort relationships by confidence score
 * @param {Array} relationships - Array of relationship objects
 * @returns {Array} Sorted relationships
 */
export const sortByConfidence = (relationships) => {
  return [...relationships].sort((a, b) => b.confidence - a.confidence);
};

/**
 * Group relationships by type
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} Grouped relationships
 */
export const groupByType = (relationships) => {
  return relationships.reduce((acc, rel) => {
    const type = rel.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(rel);
    return acc;
  }, {});
};

/**
 * Calculate statistics for relationships
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} Statistics object
 */
export const calculateStats = (relationships) => {
  if (relationships.length === 0) {
    return {
      total: 0,
      avgConfidence: 0,
      highConfidence: 0,
      byType: {}
    };
  }
  
  const avgConfidence = relationships.reduce((sum, r) => sum + r.confidence, 0) / relationships.length;
  const highConfidence = relationships.filter(r => r.confidence >= 80).length;
  const byType = groupByType(relationships);
  
  return {
    total: relationships.length,
    avgConfidence: Math.round(avgConfidence),
    highConfidence,
    byType: Object.keys(byType).reduce((acc, type) => {
      acc[type] = byType[type].length;
      return acc;
    }, {})
  };
};

