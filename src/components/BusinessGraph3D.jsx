import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { GRAPH_CONFIG } from '../utils/constants';

/**
 * 3D Force Graph component for business network visualization
 */
const BusinessGraph3D = ({ graphData, onNodeClick, selectedNodeId, width, height }) => {
  const graphRef = useRef();
  
  // Configure graph on mount
  useEffect(() => {
    if (graphRef.current) {
      const graph = graphRef.current;
      
      // Set initial camera position - zoomed out to see whole network
      graph.cameraPosition({ z: 800 }, { x: 0, y: 0, z: 0 }, 2000);
      
      // Configure force simulation
      graph.d3Force('link').distance(150);
      graph.d3Force('charge').strength(-300);
      graph.d3Force('center').strength(0.05);
    }
  }, []);
  
  // Focus on selected node
  useEffect(() => {
    if (graphRef.current && selectedNodeId && graphData) {
      const node = graphData.nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const distance = 200;
        graphRef.current.cameraPosition(
          { x: node.x, y: node.y, z: node.z + distance },
          node,
          1000
        );
      }
    }
  }, [selectedNodeId, graphData]);
  
  // Node rendering with glow effect for selected
  const nodeThreeObject = useCallback((node) => {
    const isSelected = node.id === selectedNodeId;
    
    if (isSelected) {
      // Create larger sphere with glow for selected node
      const group = new THREE.Group();
      
      // Main sphere
      const geometry = new THREE.SphereGeometry(10);
      const material = new THREE.MeshLambertMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.9,
        emissive: node.color,
        emissiveIntensity: 0.5
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      
      // Glow effect
      const glowGeometry = new THREE.SphereGeometry(12);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);
      
      return group;
    }
    
    return false; // Use default rendering for non-selected nodes
  }, [selectedNodeId]);
  
  // Simple text label - always visible above nodes
  const nodeLabel = useCallback((node) => {
    return node.name;
  }, []);
  
  // Link label rendering with collaboration example
  const linkLabel = useCallback((link) => {
    const rel = link.relationship;
    const hasExample = rel?.collaboration_example && rel.collaboration_example !== 'No specific example provided';
    const hasSynergy = rel?.synergy_potential && rel.synergy_potential !== 'Complementary business synergy';
    
    return `
      <div style="
        background: rgba(10, 22, 40, 0.98);
        border: 1px solid ${link.color};
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-family: Inter, sans-serif;
        font-size: 12px;
        max-width: 320px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        ">
          <div style="color: ${link.color}; font-weight: 700; text-transform: capitalize; font-size: 13px;">
            ${link.type}
          </div>
          <div style="
            background: ${link.color}20;
            color: ${link.color};
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          ">
            ${link.confidence}%
          </div>
        </div>
        ${hasExample ? `
          <div style="
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 6px;
            padding: 8px;
            margin-top: 8px;
          ">
            <div style="color: #C4B5FD; font-size: 10px; font-weight: 600; margin-bottom: 4px;">
              💡 PARTNERSHIP EXAMPLE
            </div>
            <div style="color: #DDD6FE; font-size: 11px; line-height: 1.5; font-style: italic;">
              "${rel.collaboration_example.substring(0, 180)}${rel.collaboration_example.length > 180 ? '...' : ''}"
            </div>
          </div>
        ` : ''}
        ${hasSynergy ? `
          <div style="
            margin-top: 6px;
            padding: 6px;
            background: rgba(251, 191, 36, 0.08);
            border-radius: 4px;
          ">
            <div style="color: #FCD34D; font-size: 10px; font-weight: 600; margin-bottom: 2px;">
              🌟 UNIQUE SYNERGY
            </div>
            <div style="color: #FDE68A; font-size: 10px; line-height: 1.4;">
              ${rel.synergy_potential}
            </div>
          </div>
        ` : ''}
        <div style="
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          color: #64748B;
          font-size: 10px;
          text-align: center;
        ">
          Click node for full details →
        </div>
      </div>
    `;
  }, []);
  
  // Link styling
  const linkColor = useCallback((link) => link.color, []);
  const linkWidth = useCallback((link) => link.value, []);
  
  // Handle node click
  const handleNodeClick = useCallback((node) => {
    if (onNodeClick) {
      onNodeClick(node.business);
    }
  }, [onNodeClick]);
  
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-jax-gray-800 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-jax-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-sm text-jax-gray-400 max-w-md">
              No businesses or relationships to display. Please run the analysis script first.
            </p>
            <div className="mt-4 p-4 bg-jax-gray-900 rounded-lg text-left max-w-md mx-auto">
              <code className="text-xs text-jax-cyan">npm run analyze</code>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full graph-canvas relative">
      {/* 3D Controls Hint */}
      <div className="absolute bottom-6 left-6 z-10 bg-jax-navy/90 backdrop-blur-sm border border-jax-gray-800 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-jax-gray-400 font-medium mb-2">🎮 3D Controls</p>
        <div className="space-y-1 text-xs text-jax-gray-500">
          <p>• <span className="text-jax-cyan">Left-click + drag:</span> Rotate</p>
          <p>• <span className="text-jax-cyan">Right-click + drag:</span> Pan</p>
          <p>• <span className="text-jax-cyan">Scroll:</span> Zoom</p>
          <p>• <span className="text-jax-cyan">Click node:</span> View details</p>
        </div>
      </div>
      
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor={GRAPH_CONFIG.backgroundColor}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}
        nodeAutoColorBy="industry"
        nodeLabel={nodeLabel}
        nodeRelSize={6}
        nodeResolution={16}
        onNodeClick={handleNodeClick}
        nodeOpacity={0.9}
        linkLabel={linkLabel}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkOpacity={GRAPH_CONFIG.linkOpacity}
        linkDirectionalParticles={GRAPH_CONFIG.linkDirectionalParticles}
        linkDirectionalParticleWidth={GRAPH_CONFIG.linkDirectionalParticleWidth}
        d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
        d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
        enableNodeDrag={false}
        enableNavigationControls={true}
        controlType="orbit"
        showNavInfo={false}
      />
    </div>
  );
};

export default BusinessGraph3D;

