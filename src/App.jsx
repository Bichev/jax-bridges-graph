import React, { useState, useEffect } from 'react';
import { 
  Header, 
  NetworkStats, 
  FilterPanel, 
  BusinessGraph3D, 
  BusinessDetailPanel 
} from './components';
import useGraphData from './hooks/useGraphData';
import useBusinessFilter from './hooks/useBusinessFilter';
import { searchBusinesses } from './utils/graph-builder';

/**
 * Main application component
 */
function App() {
  const [businesses, setBusinesses] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const {
    filters,
    updateMinConfidence,
    toggleType,
    toggleIndustry,
    updateSearchQuery,
    resetFilters
  } = useBusinessFilter();
  
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Import JSON data files
        const [businessesData, relationshipsData] = await Promise.all([
          import('../data/businesses.json'),
          import('../data/relationships.json')
        ]);
        
        setBusinesses(businessesData.default || []);
        setRelationships(relationshipsData.default || []);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please ensure the analysis has been run.');
        setBusinesses([]);
        setRelationships([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Apply search filter
  const filteredBusinesses = searchBusinesses(businesses, filters.searchQuery);
  
  // Build graph data with filters
  const graphData = useGraphData(filteredBusinesses, relationships, {
    minConfidence: filters.minConfidence,
    selectedTypes: filters.selectedTypes.length > 0 ? filters.selectedTypes : null,
    selectedIndustries: filters.selectedIndustries.length > 0 ? filters.selectedIndustries : null
  });
  
  // Handle business selection
  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
  };
  
  const handleCloseDetail = () => {
    setSelectedBusiness(null);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-jax-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-jax-cyan border-t-transparent animate-spin mx-auto"></div>
          <p className="text-jax-gray-400">Loading business network...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-jax-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Data Not Found</h2>
              <p className="text-sm text-jax-gray-400 mb-4">{error}</p>
            </div>
            <div className="bg-jax-dark p-4 rounded-lg text-left space-y-2">
              <p className="text-xs text-jax-gray-500 mb-2">Run these commands to generate data:</p>
              <code className="block text-xs text-jax-cyan">npm install</code>
              <code className="block text-xs text-jax-cyan">npm run analyze</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate layout dimensions
  const headerHeight = 73; // Header height
  const sidebarWidth = 320; // Fixed sidebar width
  const detailPanelWidth = selectedBusiness ? 480 : 0;
  const graphWidth = dimensions.width - sidebarWidth - detailPanelWidth;
  const graphHeight = dimensions.height - headerHeight;
  
  return (
    <div className="min-h-screen bg-jax-dark">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="pt-[73px] flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-jax-gray-800 bg-jax-navy/50 overflow-y-auto" style={{ height: graphHeight }}>
          <div className="p-6 space-y-6">
            {/* Stats */}
            <NetworkStats 
              businesses={businesses}
              relationships={relationships}
              selectedBusiness={selectedBusiness}
            />
            
            {/* Filters */}
            <FilterPanel
              businesses={businesses}
              filters={filters}
              updateMinConfidence={updateMinConfidence}
              toggleType={toggleType}
              toggleIndustry={toggleIndustry}
              updateSearchQuery={updateSearchQuery}
              resetFilters={resetFilters}
            />
            
            {/* Instructions */}
            <div className="card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-jax-gray-400 uppercase tracking-wide">
                💡 Quick Tips
              </h3>
              <ul className="text-xs text-jax-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Click any business node to view partnerships</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Drag to rotate, scroll to zoom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Hover over connections for details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Use filters to focus on specific relationships</span>
                </li>
              </ul>
            </div>
            
            {/* Footer */}
            <div className="text-center pt-4 border-t border-jax-gray-800">
              <p className="text-xs text-jax-gray-500">
                Powered by <span className="text-gradient font-semibold">JAX AI Agency</span>
              </p>
              <p className="text-xs text-jax-gray-600 mt-1">
                Building AI solutions 🍞
              </p>
            </div>
          </div>
        </aside>
        
        {/* Graph Area */}
        <main className="flex-1 relative" style={{ width: graphWidth, height: graphHeight }}>
          {/* Business Search/Selector */}
          <div className="absolute top-6 left-6 right-6 z-20">
            <div className="max-w-md">
              <select
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const business = businesses.find(b => b.id === e.target.value);
                  if (business) handleBusinessSelect(business);
                }}
                className="w-full px-4 py-3 bg-jax-navy/95 backdrop-blur-sm border border-jax-gray-800 rounded-lg text-white font-medium text-sm focus:border-jax-cyan focus:outline-none focus:ring-2 focus:ring-jax-cyan/20 transition-all shadow-xl cursor-pointer hover:border-jax-cyan/50"
              >
                <option value="" className="bg-jax-navy">🔍 Select a business to explore...</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id} className="bg-jax-navy">
                    {business.name} • {business.industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <BusinessGraph3D
            key={`${graphWidth}-${graphHeight}`}
            graphData={graphData}
            onNodeClick={handleBusinessSelect}
            selectedNodeId={selectedBusiness?.id}
            width={graphWidth}
            height={graphHeight}
          />
          
          {/* Overlay hint */}
          {!selectedBusiness && graphData.nodes.length > 0 && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <div className="glass px-6 py-3 rounded-full shadow-xl animate-fade-in">
                <p className="text-sm text-white font-medium">
                  💡 Select from dropdown above or click any node to explore partnerships
                </p>
              </div>
            </div>
          )}
        </main>
        
        {/* Detail Panel */}
        {selectedBusiness && (
          <BusinessDetailPanel
            business={selectedBusiness}
            relationships={relationships}
            businesses={businesses}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}

export default App;

