import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { getBusinessRelationships } from '../utils/graph-builder';
import { 
  formatConfidence, 
  getConfidenceLevelColor, 
  formatContact,
  formatUrl,
  ensureHttps,
  sortByConfidence
} from '../utils/formatters';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '../utils/constants';

/**
 * Enrich relationships with their reverse counterparts
 * For each relationship shown, find the relationship in the opposite direction
 */
const enrichRelationshipsWithReverse = (businessId, businessRelationships, allRelationships, businesses) => {
  const businessMap = businesses.reduce((map, b) => {
    map[b.id] = b;
    return map;
  }, {});
  
  return businessRelationships.map(rel => {
    // Find the reverse relationship (opposite direction)
    const partnerId = rel.partner.id;
    const reverseRel = allRelationships.find(r => {
      // If current rel is A→B (from businessId to partnerId), find B→A (from partnerId to businessId)
      // If current rel is B→A (from partnerId to businessId), find A→B (from businessId to partnerId)
      if (rel.direction === 'outbound') {
        // Current: businessId → partnerId, find: partnerId → businessId
        return r.from_id === partnerId && r.to_id === businessId;
      } else {
        // Current: partnerId → businessId, find: businessId → partnerId
        return r.from_id === businessId && r.to_id === partnerId;
      }
    });
    
    return {
      ...rel,
      reverseRelationship: reverseRel || null
    };
  });
};

/**
 * Business detail panel showing relationships and opportunities
 */
const BusinessDetailPanel = ({ business, relationships, businesses, onClose, onWidthChange }) => {
  const [panelWidth, setPanelWidth] = useState(600); // Default width - increased for bidirectional view
  const [isResizing, setIsResizing] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const panelRef = useRef(null);
  
  if (!business) return null;
  
  const rawRelationships = getBusinessRelationships(business.id, relationships, businesses);
  const businessRelationships = sortByConfidence(
    enrichRelationshipsWithReverse(business.id, rawRelationships, relationships, businesses)
  );
  
  /**
   * Generate and download PDF with business details and partnership analysis
   */
  const handleExportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPos = margin;
      
      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace = 20) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };
      
      // Helper function to wrap text
      const wrapText = (text, maxWidth) => {
        // Remove emojis and clean up text
        const cleanText = (text || '')
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
          .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
          .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
          .trim();
        return doc.splitTextToSize(cleanText, maxWidth);
      };
      
      // Helper function to draw a section header with background
      const drawSectionHeader = (title, y) => {
        doc.setFillColor(240, 245, 250);
        doc.rect(margin, y - 2, contentWidth, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(title, margin + 2, y + 4);
        return y + 12;
      };
      
      // Helper function to draw a subsection label
      const drawSubsectionLabel = (label, iconText, color, y) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...color);
        doc.text(`${iconText} ${label}`, margin + 5, y);
        return y + 5;
      };
      
      // Header
      doc.setFillColor(10, 22, 40); // jax-navy
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(0, 217, 255); // jax-cyan
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('JAX Bridges', margin, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('Business Relationship Analysis', margin, 30);
      
      doc.setFontSize(8);
      doc.text(new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), margin, 38);
      
      yPos = 55;
      
      // Business Name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(business.name, margin, yPos);
      yPos += 10;
      
      // Industry Badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 217, 255);
      doc.text(`● ${business.industry}`, margin, yPos);
      yPos += 12;
      
      // Description
      if (business.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const descLines = wrapText(business.description, contentWidth);
        descLines.forEach(line => {
          checkNewPage();
          doc.text(line, margin, yPos);
          yPos += 6;
        });
        yPos += 5;
      }
      
      // Contact Information Section
      checkNewPage(40);
      yPos = drawSectionHeader('Contact Information', yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (business.contact_name && business.contact_name !== 'Not specified') {
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Contact:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        doc.text(business.contact_name, margin + 22, yPos);
        yPos += 5;
      }
      
      if (business.contact_email) {
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 102, 204);
        doc.text(business.contact_email, margin + 22, yPos);
        yPos += 5;
      }
      
      if (business.contact_phone) {
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Phone:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        doc.text(business.contact_phone, margin + 22, yPos);
        yPos += 5;
      }
      
      if (business.website) {
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Website:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 102, 204);
        doc.text(formatUrl(business.website), margin + 22, yPos);
        yPos += 5;
      }
      
      yPos += 3;
      
      // Target Market & Current Needs
      if ((business.target_market && business.target_market !== 'Not specified') || 
          (business.current_needs && business.current_needs !== 'Not specified')) {
        checkNewPage(25);
        
        if (business.target_market && business.target_market !== 'Not specified') {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 120);
          doc.text('TARGET MARKET', margin + 3, yPos);
          yPos += 5;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          const tmLines = wrapText(business.target_market, contentWidth - 8);
          tmLines.forEach(line => {
            checkNewPage();
            doc.text(line, margin + 5, yPos);
            yPos += 4.5;
          });
          yPos += 4;
        }
        
        if (business.current_needs && business.current_needs !== 'Not specified') {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 120);
          doc.text('CURRENT NEEDS', margin + 3, yPos);
          yPos += 5;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          const cnLines = wrapText(business.current_needs, contentWidth - 8);
          cnLines.forEach(line => {
            checkNewPage();
            doc.text(line, margin + 5, yPos);
            yPos += 4.5;
          });
          yPos += 4;
        }
      }
      
      // Partnership Opportunities Section
      checkNewPage(50);
      yPos = drawSectionHeader(`Partnership Opportunities (${businessRelationships.length})`, yPos);
      
      if (businessRelationships.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('No relationships found for this business.', margin, yPos);
      } else {
        // Add each relationship
        businessRelationships.forEach((rel, idx) => {
          const { partner, confidence, direction, reverseRelationship } = rel;
          const displayConfidence = reverseRelationship 
            ? Math.max(confidence, reverseRelationship.confidence)
            : confidence;
          
          checkNewPage(65);
          
          // Relationship box background
          doc.setFillColor(252, 252, 254);
          const boxStartY = yPos - 2;
          
          // Partner number badge
          doc.setFillColor(0, 217, 255);
          doc.circle(margin + 7, yPos + 2.5, 3, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(`${idx + 1}`, margin + (idx < 9 ? 5.7 : 5), yPos + 3.5);
          
          // Partner name
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 40);
          doc.text(partner.name, margin + 12, yPos + 3.5);
          
          // Confidence badge on the right
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          const confidenceText = `${formatConfidence(displayConfidence)}`;
          const confidenceWidth = doc.getTextWidth(confidenceText);
          const badgeX = pageWidth - margin - confidenceWidth - 4;
          doc.setFillColor(34, 139, 34);
          doc.roundedRect(badgeX - 2, yPos - 1, confidenceWidth + 4, 5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(confidenceText, badgeX, yPos + 2.5);
          yPos += 7;
          
          // Industry and direction indicator
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 120);
          doc.text(partner.industry, margin + 12, yPos);
          
          doc.setTextColor(0, 102, 204);
          const directionText = reverseRelationship ? '⇄ Bidirectional' : '→ One-way';
          doc.text(directionText, pageWidth - margin - 25, yPos);
          yPos += 8;
          
          // Inbound/Outbound relationships
          const inboundRel = direction === 'inbound' ? rel : reverseRelationship;
          const outboundRel = direction === 'outbound' ? rel : reverseRelationship;
          
          // What They Provide
          if (inboundRel) {
            yPos = drawSubsectionLabel(
              `WHAT THEY PROVIDE (${RELATIONSHIP_LABELS[inboundRel.type]})`,
              '<-',
              [30, 100, 180],
              yPos
            );
            
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 45, 45);
            const reasoningLines = wrapText(inboundRel.reasoning, contentWidth - 12);
            reasoningLines.forEach(line => {
              checkNewPage();
              doc.text(line, margin + 7, yPos);
              yPos += 4;
            });
            
            if (inboundRel.value_prop) {
              yPos += 2;
              doc.setFillColor(230, 255, 230);
              doc.rect(margin + 6, yPos - 3, contentWidth - 12, 1, 'F');
              yPos += 1;
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(34, 139, 34);
              doc.text('VALUE:', margin + 7, yPos);
              doc.setFont('helvetica', 'normal');
              const vpLines = wrapText(inboundRel.value_prop, contentWidth - 25);
              vpLines.forEach((line, lineIdx) => {
                checkNewPage();
                doc.text(line, margin + (lineIdx === 0 ? 20 : 7), yPos);
                yPos += 3.5;
              });
            }
            yPos += 4;
          }
          
          // What You Provide
          if (outboundRel) {
            yPos = drawSubsectionLabel(
              `WHAT YOU PROVIDE (${RELATIONSHIP_LABELS[outboundRel.type]})`,
              '->',
              [34, 139, 34],
              yPos
            );
            
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 45, 45);
            const reasoningLines = wrapText(outboundRel.reasoning, contentWidth - 12);
            reasoningLines.forEach(line => {
              checkNewPage();
              doc.text(line, margin + 7, yPos);
              yPos += 4;
            });
            
            if (outboundRel.value_prop) {
              yPos += 2;
              doc.setFillColor(230, 255, 230);
              doc.rect(margin + 6, yPos - 3, contentWidth - 12, 1, 'F');
              yPos += 1;
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(34, 139, 34);
              doc.text('VALUE:', margin + 7, yPos);
              doc.setFont('helvetica', 'normal');
              const vpLines = wrapText(outboundRel.value_prop, contentWidth - 25);
              vpLines.forEach((line, lineIdx) => {
                checkNewPage();
                doc.text(line, margin + (lineIdx === 0 ? 20 : 7), yPos);
                yPos += 3.5;
              });
            }
            yPos += 4;
          }
          
          // Collaboration Example
          if (rel.collaboration_example && rel.collaboration_example !== 'No specific example provided') {
            checkNewPage(12);
            
            // Light purple background box
            doc.setFillColor(248, 245, 255);
            const exampleStartY = yPos - 1;
            
            yPos = drawSubsectionLabel(
              'PARTNERSHIP SCENARIO',
              '[!]',
              [128, 0, 128],
              yPos
            );
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(90, 40, 90);
            const exampleLines = wrapText(rel.collaboration_example, contentWidth - 12);
            exampleLines.forEach(line => {
              checkNewPage();
              doc.text(line, margin + 7, yPos);
              yPos += 3.5;
            });
            
            // Draw box around example
            const exampleHeight = yPos - exampleStartY + 1;
            doc.setDrawColor(200, 180, 220);
            doc.rect(margin + 6, exampleStartY, contentWidth - 12, exampleHeight);
            
            yPos += 4;
          }
          
          // Synergy Potential
          if (rel.synergy_potential && rel.synergy_potential !== 'Complementary business synergy') {
            checkNewPage(10);
            
            yPos = drawSubsectionLabel(
              'UNIQUE SYNERGY',
              '[*]',
              [200, 140, 0],
              yPos
            );
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(140, 90, 0);
            const synergyLines = wrapText(rel.synergy_potential, contentWidth - 12);
            synergyLines.forEach(line => {
              checkNewPage();
              doc.text(line, margin + 7, yPos);
              yPos += 3.5;
            });
            yPos += 4;
          }
          
          // Action Items
          if (rel.action_items && rel.action_items.length > 0) {
            checkNewPage(12);
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 60);
            doc.text('NEXT STEPS:', margin + 5, yPos);
            yPos += 5;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            rel.action_items.forEach((item, itemIdx) => {
              checkNewPage();
              
              // Number badge
              doc.setFillColor(0, 217, 255);
              doc.circle(margin + 8, yPos - 1.5, 2, 'F');
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(255, 255, 255);
              doc.text(`${itemIdx + 1}`, margin + (itemIdx < 9 ? 7.2 : 6.8), yPos - 0.5);
              
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(50, 50, 50);
              const itemLines = wrapText(item, contentWidth - 20);
              itemLines.forEach((line, lineIdx) => {
                doc.text(line, margin + (lineIdx === 0 ? 12 : 12), yPos);
                yPos += 3.5;
              });
              yPos += 1;
            });
            yPos += 2;
          }
          
          // Draw subtle border around relationship
          const boxHeight = yPos - boxStartY + 1;
          doc.setDrawColor(220, 220, 230);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin + 2, boxStartY, contentWidth - 4, boxHeight, 2, 2);
          doc.setLineWidth(0.2); // Reset line width
          
          yPos += 6;
        });
      }
      
      // Footer on last page
      const totalPages = doc.internal.pages.length - 1; // Subtract the first empty page
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Generated by JAX Bridges Business Relationship Mapper', pageWidth / 2, pageHeight - 6, { align: 'center' });
      }
      
      // Save the PDF with a clean, descriptive filename
      const cleanBusinessName = business.name
        .replace(/[^a-z0-9\s-]/gi, '') // Remove special chars except spaces and hyphens
        .trim()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length to 50 chars
      
      const dateStamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `${cleanBusinessName}_Partnership_Analysis_${dateStamp}.pdf`;
      
      doc.save(fileName);
      
      // Show success message
      console.log(`✅ PDF exported successfully: ${fileName}`);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 4000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };
  
  // Handle resize
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      // Min width: 500px (for two-column view), Max width: 900px
      const constrainedWidth = Math.max(500, Math.min(900, newWidth));
      setPanelWidth(constrainedWidth);
      if (onWidthChange) {
        onWidthChange(constrainedWidth);
      }
    };
    
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  return (
    <div 
      ref={panelRef}
      className="fixed inset-y-0 right-0 bg-jax-navy border-l border-jax-gray-800 shadow-2xl z-50 overflow-y-auto animate-slide-left"
      style={{ width: window.innerWidth < 768 ? '100%' : `${panelWidth}px` }}
    >
      {/* Resize Handle - Fixed position so it doesn't scroll away */}
      <div
        className="hidden md:block fixed left-0 top-0 bottom-0 w-1 hover:w-2 bg-jax-cyan/20 hover:bg-jax-cyan cursor-ew-resize transition-all z-[60]"
        onMouseDown={handleResizeStart}
        style={{ 
          boxShadow: isResizing ? '0 0 10px rgba(0, 217, 255, 0.5)' : 'none',
          left: `calc(100vw - ${panelWidth}px)`
        }}
      />
      <div className="sticky top-0 bg-jax-navy/95 backdrop-blur-sm border-b border-jax-gray-800 z-50 pt-20 md:pt-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-white">Business Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-jax-cyan hover:bg-jax-cyan/80 text-jax-navy font-semibold rounded-lg transition-colors"
              aria-label="Save to PDF"
              title="Export business analysis to PDF"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Save to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-jax-gray-800 rounded-lg transition-colors relative z-50"
              aria-label="Close panel"
            >
              <svg className="w-6 h-6 text-jax-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Success Notification */}
        {showExportSuccess && (
          <div className="mx-6 mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3 animate-slide-down">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-300 mb-1">PDF Exported Successfully!</p>
              <p className="text-xs text-green-400/80">
                Check your Downloads folder for the partnership analysis PDF.
                <br />
                <span className="text-green-500/60 italic">
                  Tip: To choose save location, enable "Ask where to save each file" in your browser settings.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-6">
        {/* Business Info Card */}
        <div className="card p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{business.name}</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-jax-cyan/10 border border-jax-cyan/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-jax-cyan" />
              <span className="text-sm text-jax-cyan font-medium">{business.industry}</span>
            </div>
          </div>
          
          <p className="text-jax-gray-300 leading-relaxed">{business.description}</p>
          
          {/* Contact Info */}
          <div className="space-y-2 pt-4 border-t border-jax-gray-800">
            {business.contact_name && business.contact_name !== 'Not specified' && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="Contact"
                value={business.contact_name}
              />
            )}
            
            {business.contact_email && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                label="Email"
                value={
                  <a href={`mailto:${business.contact_email}`} className="text-jax-cyan hover:underline">
                    {business.contact_email}
                  </a>
                }
              />
            )}
            
            {business.contact_phone && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                label="Phone"
                value={
                  <a href={`tel:${business.contact_phone}`} className="text-jax-cyan hover:underline">
                    {business.contact_phone}
                  </a>
                }
              />
            )}
            
            {business.website && (
              <InfoRow 
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
                label="Website"
                value={
                  <a href={ensureHttps(business.website)} target="_blank" rel="noopener noreferrer" className="text-jax-cyan hover:underline">
                    {formatUrl(business.website)}
                  </a>
                }
              />
            )}
          </div>
          
          {/* Target Market & Needs */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-jax-gray-800">
            {business.target_market && business.target_market !== 'Not specified' && (
              <div>
                <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-1">Target Market</p>
                <p className="text-sm text-jax-gray-300">{business.target_market}</p>
              </div>
            )}
            
            {business.current_needs && business.current_needs !== 'Not specified' && (
              <div>
                <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-1">Current Needs</p>
                <p className="text-sm text-jax-gray-300">{business.current_needs}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Relationships Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Partnership Opportunities
            </h3>
            <span className="badge bg-jax-cyan/10 text-jax-cyan">
              {businessRelationships.length}
            </span>
          </div>
          
          {businessRelationships.length === 0 ? (
            <div className="card p-6 text-center">
              <svg className="w-12 h-12 text-jax-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-jax-gray-400">
                No relationships found for this business.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessRelationships.map((rel, idx) => (
                <RelationshipCard key={`${rel.from_id}-${rel.to_id}-${idx}`} relationship={rel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Info row component
 */
const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 text-jax-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-jax-gray-500 block">{label}</span>
        <div className="text-sm text-jax-gray-300 break-words">{value}</div>
      </div>
    </div>
  );
};

/**
 * Partnership content component - "Why This Works" section
 */
const WhyThisWorksBox = ({ relationship }) => {
  if (!relationship) {
    return (
      <div className="bg-jax-gray-800/30 border border-jax-gray-800 rounded-lg p-3 flex items-center justify-center min-h-[80px]">
        <p className="text-xs text-jax-gray-600 italic">No partnership identified</p>
      </div>
    );
  }
  
  return (
    <div className="bg-jax-gray-800/30 border border-jax-gray-800 rounded-lg p-3">
      <p className="text-xs font-semibold text-jax-cyan uppercase mb-1.5">Why This Works</p>
      <p className="text-xs text-jax-gray-300 leading-relaxed">{relationship.reasoning}</p>
    </div>
  );
};

/**
 * Partnership content component - "Value Proposition" section
 */
const ValuePropositionBox = ({ relationship }) => {
  if (!relationship) {
    return (
      <div className="bg-jax-gray-800/50 border border-jax-gray-800/50 rounded-lg p-3 flex items-center justify-center min-h-[60px]">
        <p className="text-xs text-jax-gray-600 italic">-</p>
      </div>
    );
  }
  
  const { value_prop } = relationship;
  
  return (
    <div className={`bg-green-500/5 border rounded-lg p-3 ${value_prop ? 'border-green-500/20' : 'border-jax-gray-800/50'}`}>
      <p className="text-xs font-semibold text-green-400 uppercase mb-1.5">Value Proposition</p>
      {value_prop ? (
        <p className="text-xs text-green-300 leading-relaxed font-medium">{value_prop}</p>
      ) : (
        <p className="text-xs text-jax-gray-600 italic">No specific value proposition identified</p>
      )}
    </div>
  );
};

/**
 * Relationship card component
 */
const RelationshipCard = ({ relationship }) => {
  const [showCopied, setShowCopied] = useState(false);
  
  const { 
    type, 
    confidence, 
    collaboration_example,
    synergy_potential,
    action_items, 
    partner, 
    direction,
    reverseRelationship
  } = relationship;
  
  // Determine which relationship is inbound and which is outbound
  const inboundRel = direction === 'inbound' ? relationship : reverseRelationship;
  const outboundRel = direction === 'outbound' ? relationship : reverseRelationship;
  
  // Handle contact button click
  const handleContactClick = async (e) => {
    e.preventDefault();
    
    // Try to copy email to clipboard
    try {
      await navigator.clipboard.writeText(partner.contact_email);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
    
    // Also try to open mailto (will work if email client is configured)
    window.location.href = `mailto:${partner.contact_email}?subject=Partnership Opportunity from JAX Bridges`;
  };
  
  // Use the highest confidence between both directions
  const displayConfidence = reverseRelationship 
    ? Math.max(confidence, reverseRelationship.confidence)
    : confidence;
  
  return (
    <div className="card-hover p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white mb-1">
            {partner.name}
          </h4>
          <p className="text-sm text-jax-gray-400">{partner.industry}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`badge ${getConfidenceLevelColor(displayConfidence)}`}>
            {formatConfidence(displayConfidence)}
          </span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-jax-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xs text-jax-gray-400 font-medium">
              {reverseRelationship ? 'Bidirectional' : 'One-way'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Bidirectional Partnership View - Grid layout for equal heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {/* Headers Row */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <h5 className="text-xs font-bold text-jax-gray-400 uppercase">What They Provide</h5>
          {inboundRel && (
            <div className="flex items-center gap-1.5">
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: RELATIONSHIP_COLORS[inboundRel.type] }}
              />
              <span className="text-xs text-jax-gray-500 font-medium uppercase tracking-wide">
                {RELATIONSHIP_LABELS[inboundRel.type]}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <h5 className="text-xs font-bold text-jax-gray-400 uppercase">What You Provide</h5>
          {outboundRel && (
            <div className="flex items-center gap-1.5">
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: RELATIONSHIP_COLORS[outboundRel.type] }}
              />
              <span className="text-xs text-jax-gray-500 font-medium uppercase tracking-wide">
                {RELATIONSHIP_LABELS[outboundRel.type]}
              </span>
            </div>
          )}
        </div>
        
        {/* Why This Works Row - Both boxes will have equal height */}
        <WhyThisWorksBox relationship={inboundRel} />
        <WhyThisWorksBox relationship={outboundRel} />
        
        {/* Value Proposition Row - Both boxes will have equal height and be aligned */}
        <ValuePropositionBox relationship={inboundRel} />
        <ValuePropositionBox relationship={outboundRel} />
      </div>
      
      {/* Collaboration Example - NEW! */}
      {collaboration_example && collaboration_example !== 'No specific example provided' && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                💡 Real Partnership Scenario
                <span className="text-xs font-normal text-purple-400/60">(AI-Generated Example)</span>
              </h4>
              <p className="text-sm text-purple-100 leading-relaxed italic">
                "{collaboration_example}"
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Synergy Potential - NEW! */}
      {synergy_potential && synergy_potential !== 'Complementary business synergy' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-400 uppercase mb-1">🌟 Unique Synergy</p>
              <p className="text-xs text-amber-200 leading-relaxed">{synergy_potential}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Items */}
      {action_items && action_items.length > 0 && (
        <div className="pt-3 border-t border-jax-gray-800">
          <p className="text-xs text-jax-gray-500 font-semibold uppercase mb-2">Next Steps</p>
          <ul className="space-y-2">
            {action_items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-jax-cyan/10 text-jax-cyan flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-jax-gray-300 flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Contact Button */}
      {partner.contact_email && (
        <div className="pt-3">
          <button
            onClick={handleContactClick}
            className="btn btn-primary w-full relative"
          >
            {showCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact {partner.name}
              </>
            )}
          </button>
          <p className="text-xs text-jax-gray-500 text-center mt-2">
            {partner.contact_email}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessDetailPanel;

