import React, { useState, useEffect } from 'react';
import { 
  Header, 
  NetworkStats, 
  FilterPanel, 
  BusinessGraph3D, 
  BusinessDetailPanel,
  AboutModal
} from './components';
import useGraphData from './hooks/useGraphData';
import useBusinessFilter from './hooks/useBusinessFilter';
import { searchBusinesses, filterGraphByNode } from './utils/graph-builder';

/**
 * Main application component
 */
function App() {
  const [businesses, setBusinesses] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [detailPanelWidth, setDetailPanelWidth] = useState(600);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Check if mobile
  const isMobile = dimensions.width < 768;
  
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
  
  // Close sidebar when selecting a business on mobile
  useEffect(() => {
    if (isMobile && selectedBusiness) {
      setIsSidebarOpen(false);
    }
  }, [selectedBusiness, isMobile]);
  
  // Apply search filter
  const filteredBusinesses = searchBusinesses(businesses, filters.searchQuery);
  
  // Build graph data with filters
  const fullGraphData = useGraphData(filteredBusinesses, relationships, {
    minConfidence: filters.minConfidence,
    selectedTypes: filters.selectedTypes.length > 0 ? filters.selectedTypes : null,
    selectedIndustries: filters.selectedIndustries.length > 0 ? filters.selectedIndustries : null
  });
  
  // Filter graph to show only selected node's connections
  const graphData = selectedBusiness 
    ? filterGraphByNode(fullGraphData, selectedBusiness.id)
    : fullGraphData;
  
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
  const sidebarWidth = isMobile ? 0 : 320; // Hide sidebar width on mobile
  const currentDetailPanelWidth = selectedBusiness && !isMobile ? detailPanelWidth : 0;
  const graphWidth = isMobile ? dimensions.width : dimensions.width - sidebarWidth - currentDetailPanelWidth;
  const graphHeight = dimensions.height - headerHeight;
  
  return (
    <div className="min-h-screen bg-jax-dark">
      {/* Header */}
      <Header 
        onAboutClick={() => setIsAboutOpen(true)} 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />
      
      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="pt-[73px] flex">
        {/* Sidebar - Desktop: static, Mobile: slide-in */}
        <aside 
          className={`
            ${isMobile 
              ? 'fixed left-0 top-[73px] bottom-0 w-80 z-40 transform transition-transform duration-300 ease-in-out' 
              : 'w-80 flex-shrink-0'
            }
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            border-r border-jax-gray-800 bg-jax-navy overflow-y-auto
          `}
          style={{ height: isMobile ? 'calc(100vh - 73px)' : graphHeight }}
        >
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Mobile Close Button */}
            {isMobile && (
              <div className="flex justify-end -mt-2 -mr-2">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-jax-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
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
            
            {/* Stats */}
            <NetworkStats 
              businesses={businesses}
              relationships={relationships}
              selectedBusiness={selectedBusiness}
            />
            
            {/* Instructions - Hide on mobile */}
            <div className="card p-4 space-y-2 hidden md:block">
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
                Powered by <span className="text-gradient font-semibold">Vladimir Bichev</span>
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
          <div className="absolute top-3 md:top-6 left-3 md:left-6 right-3 md:right-6 z-20">
            <div className="max-w-md">
              <select
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const business = businesses.find(b => b.id === e.target.value);
                  if (business) handleBusinessSelect(business);
                }}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-jax-navy/95 backdrop-blur-sm border border-jax-gray-800 rounded-lg text-white font-medium text-sm focus:border-jax-cyan focus:outline-none focus:ring-2 focus:ring-jax-cyan/20 transition-all shadow-xl cursor-pointer hover:border-jax-cyan/50"
              >
                <option value="" className="bg-jax-navy">🔍 Select a business...</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id} className="bg-jax-navy">
                    {business.name} {!isMobile && `• ${business.industry}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 3D Graph Controls hint - Mobile */}
          {isMobile && !selectedBusiness && (
            <div className="absolute top-16 left-3 z-10">
              <div className="glass px-3 py-2 rounded-lg text-xs text-jax-gray-300">
                <p>📱 Pinch to zoom • Drag to rotate</p>
              </div>
            </div>
          )}
          
          <BusinessGraph3D
            key={`${graphWidth}-${graphHeight}`}
            graphData={graphData}
            onNodeClick={handleBusinessSelect}
            selectedNodeId={selectedBusiness?.id}
            width={graphWidth}
            height={graphHeight}
          />
          
          {/* Overlay hints - Desktop only */}
          {!selectedBusiness && graphData.nodes.length > 0 && !isMobile && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <div className="glass px-6 py-3 rounded-full shadow-xl animate-fade-in">
                <p className="text-sm text-white font-medium">
                  💡 Select from dropdown above or click any node to explore partnerships
                </p>
              </div>
            </div>
          )}
          
          {/* Show All Network Button */}
          {selectedBusiness && !isMobile && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex items-center gap-4">
                <div className="glass px-6 py-3 rounded-full shadow-xl">
                  <p className="text-sm text-white font-medium">
                    👁️ Viewing <span className="text-jax-cyan">{selectedBusiness.name}</span> network ({graphData.nodes.length - 1} connections)
                  </p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="btn btn-ghost text-sm px-4 py-2 shadow-xl"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Show All Network
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile: Selected Business Info Bar */}
          {selectedBusiness && isMobile && (
            <div className="absolute top-16 left-3 right-3 z-20">
              <div className="glass px-4 py-3 rounded-lg shadow-xl flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {selectedBusiness.name}
                  </p>
                  <p className="text-xs text-jax-gray-400">
                    {graphData.nodes.length - 1} connections
                  </p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="ml-3 p-2 text-jax-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </main>
        
        {/* Detail Panel - Desktop: side panel, Mobile: full screen modal */}
        {selectedBusiness && (
          <BusinessDetailPanel
            business={selectedBusiness}
            relationships={relationships}
            businesses={businesses}
            onClose={handleCloseDetail}
            onWidthChange={setDetailPanelWidth}
            isMobile={isMobile}
          />
        )}
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-jax-navy border-t border-jax-gray-800 safe-area-pb">
          <div className="flex items-center justify-around py-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center px-4 py-2 text-jax-gray-400 hover:text-jax-cyan"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-xs mt-1">Filters</span>
            </button>
            {selectedBusiness && (
              <button 
                onClick={() => {
                  // Scroll to detail panel or show it
                  const detailPanel = document.querySelector('[data-detail-panel]');
                  if (detailPanel) detailPanel.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center px-4 py-2 text-jax-cyan"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">Details</span>
              </button>
            )}
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="flex flex-col items-center px-4 py-2 text-jax-gray-400 hover:text-jax-cyan"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1">About</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

