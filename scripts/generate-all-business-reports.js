/**
 * Generate Consolidated Partnership Reports for ALL Businesses
 * 
 * This script generates the same PDF that the "Save to PDF" button creates,
 * but for every business automatically. Each business gets one PDF containing
 * all their partnership opportunities.
 * 
 * Usage:
 *   node scripts/generate-all-business-reports.js
 * 
 * Output:
 *   Creates PDFs in output/business-reports/ folder
 */

import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Brand colors (matching JAX Bridges style)
const COLORS = {
  navy: [10, 22, 40],        // #0A1628
  cyan: [0, 217, 255],       // #00D9FF
  lightGray: [240, 245, 250],
  darkGray: [40, 40, 40],
  mediumGray: [100, 100, 100],
  textGray: [60, 60, 60],
  footerGray: [150, 150, 150],
  green: [34, 139, 34],
  blue: [30, 100, 180],
  purple: [128, 0, 128],
  amber: [200, 140, 0]
};

// Relationship labels
const RELATIONSHIP_LABELS = {
  referral: 'Referral',
  collaboration: 'Collaboration',
  vendor: 'Vendor',
  client: 'Client'
};

/**
 * Sanitize text for PDF (remove problematic characters)
 */
function sanitizeForPDF(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Keep common accented characters, remove others
      const commonChars = 'áéíóúàèìòùâêîôûäëïöüñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑÇ';
      return commonChars.includes(char) ? char : '';
    })
    .trim();
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .replace(/_+/g, '_')
    .substring(0, 50);
}

/**
 * Format URL for display
 */
function formatUrl(url) {
  if (!url) return '';
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/**
 * Format confidence as percentage
 */
function formatConfidence(confidence) {
  return `${Math.round(confidence)}%`;
}

/**
 * Get business relationships (replicating graph-builder.js logic)
 */
function getBusinessRelationships(businessId, relationships, businesses) {
  const businessMap = businesses.reduce((map, b) => {
    map[b.id] = b;
    return map;
  }, {});
  
  const result = [];
  
  relationships.forEach(rel => {
    if (rel.from_id === businessId) {
      // Outbound relationship
      const partner = businessMap[rel.to_id];
      if (partner) {
        result.push({
          ...rel,
          partner,
          direction: 'outbound'
        });
      }
    } else if (rel.to_id === businessId) {
      // Inbound relationship
      const partner = businessMap[rel.from_id];
      if (partner) {
        result.push({
          ...rel,
          partner,
          direction: 'inbound'
        });
      }
    }
  });
  
  return result;
}

/**
 * Enrich relationships with reverse counterparts
 */
function enrichRelationshipsWithReverse(businessId, businessRelationships, allRelationships, businesses) {
  const businessMap = businesses.reduce((map, b) => {
    map[b.id] = b;
    return map;
  }, {});
  
  return businessRelationships.map(rel => {
    const partnerId = rel.partner.id;
    const reverseRel = allRelationships.find(r => {
      if (rel.direction === 'outbound') {
        return r.from_id === partnerId && r.to_id === businessId;
      } else {
        return r.from_id === businessId && r.to_id === partnerId;
      }
    });
    
    return {
      ...rel,
      reverseRelationship: reverseRel || null
    };
  });
}

/**
 * Sort relationships by confidence (highest first)
 */
function sortByConfidence(relationships) {
  return [...relationships].sort((a, b) => {
    const confA = a.reverseRelationship 
      ? Math.max(a.confidence, a.reverseRelationship.confidence)
      : a.confidence;
    const confB = b.reverseRelationship 
      ? Math.max(b.confidence, b.reverseRelationship.confidence)
      : b.confidence;
    return confB - confA;
  });
}

/**
 * Group relationships by partner (to avoid duplicates)
 */
function groupByPartner(relationships) {
  const grouped = new Map();
  
  relationships.forEach(rel => {
    const partnerId = rel.partner.id;
    if (!grouped.has(partnerId)) {
      grouped.set(partnerId, rel);
    }
  });
  
  return Array.from(grouped.values());
}

/**
 * PDF Generator Class for Business Reports
 */
class BusinessReportPDF {
  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (2 * this.margin);
    this.yPos = this.margin;
    this.currentPage = 1;
  }

  /**
   * Check if we need a new page
   */
  checkNewPage(requiredSpace = 20) {
    if (this.yPos + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentPage++;
      this.yPos = this.margin;
      return true;
    }
    return false;
  }

  /**
   * Wrap text to fit width
   */
  wrapText(text, maxWidth) {
    const cleanText = sanitizeForPDF(text);
    return this.doc.splitTextToSize(cleanText, maxWidth);
  }

  /**
   * Draw section header with background
   */
  drawSectionHeader(title, y) {
    this.doc.setFillColor(...COLORS.lightGray);
    this.doc.rect(this.margin, y - 2, this.contentWidth, 8, 'F');
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text(title, this.margin + 2, y + 4);
    return y + 12;
  }

  /**
   * Draw subsection label
   */
  drawSubsectionLabel(label, iconText, color, y) {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    this.doc.text(`${iconText} ${label}`, this.margin + 5, y);
    return y + 5;
  }

  /**
   * Generate the complete PDF for a business
   */
  generate(business, businessRelationships, outputPath) {
    // Header
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('JAX Bridges', this.margin, 20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Business Relationship Analysis', this.margin, 30);
    
    this.doc.setFontSize(8);
    this.doc.text(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), this.margin, 38);
    
    this.yPos = 55;
    
    // Business Name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(sanitizeForPDF(business.name), this.margin, this.yPos);
    this.yPos += 10;
    
    // Industry Badge
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text(`• ${sanitizeForPDF(business.industry)}`, this.margin, this.yPos);
    this.yPos += 12;
    
    // Description
    if (business.description) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.textGray);
      const descLines = this.wrapText(business.description, this.contentWidth);
      descLines.forEach(line => {
        this.checkNewPage();
        this.doc.text(line, this.margin, this.yPos);
        this.yPos += 6;
      });
      this.yPos += 5;
    }
    
    // Contact Information Section
    this.checkNewPage(40);
    this.yPos = this.drawSectionHeader('Contact Information', this.yPos);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    if (business.contact_name && business.contact_name !== 'Not specified') {
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Contact:', this.margin + 3, this.yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.darkGray);
      this.doc.text(sanitizeForPDF(business.contact_name), this.margin + 22, this.yPos);
      this.yPos += 5;
    }
    
    if (business.contact_email) {
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Email:', this.margin + 3, this.yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 102, 204);
      this.doc.text(business.contact_email, this.margin + 22, this.yPos);
      this.yPos += 5;
    }
    
    if (business.contact_phone) {
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Phone:', this.margin + 3, this.yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.darkGray);
      this.doc.text(business.contact_phone, this.margin + 22, this.yPos);
      this.yPos += 5;
    }
    
    if (business.website) {
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Website:', this.margin + 3, this.yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 102, 204);
      this.doc.text(formatUrl(business.website), this.margin + 22, this.yPos);
      this.yPos += 5;
    }
    
    this.yPos += 3;
    
    // Target Market & Current Needs
    if ((business.target_market && business.target_market !== 'Not specified') || 
        (business.current_needs && business.current_needs !== 'Not specified')) {
      this.checkNewPage(25);
      
      if (business.target_market && business.target_market !== 'Not specified') {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(100, 100, 120);
        this.doc.text('TARGET MARKET', this.margin + 3, this.yPos);
        this.yPos += 5;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(50, 50, 50);
        const tmLines = this.wrapText(business.target_market, this.contentWidth - 8);
        tmLines.forEach(line => {
          this.checkNewPage();
          this.doc.text(line, this.margin + 5, this.yPos);
          this.yPos += 4.5;
        });
        this.yPos += 4;
      }
      
      if (business.current_needs && business.current_needs !== 'Not specified') {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(100, 100, 120);
        this.doc.text('CURRENT NEEDS', this.margin + 3, this.yPos);
        this.yPos += 5;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(50, 50, 50);
        const cnLines = this.wrapText(business.current_needs, this.contentWidth - 8);
        cnLines.forEach(line => {
          this.checkNewPage();
          this.doc.text(line, this.margin + 5, this.yPos);
          this.yPos += 4.5;
        });
        this.yPos += 4;
      }
    }
    
    // Partnership Opportunities Section
    this.checkNewPage(50);
    this.yPos = this.drawSectionHeader(`Partnership Opportunities (${businessRelationships.length})`, this.yPos);
    
    if (businessRelationships.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('No relationships found for this business.', this.margin, this.yPos);
    } else {
      // Add each relationship
      businessRelationships.forEach((rel, idx) => {
        this.addRelationship(rel, idx);
      });
    }
    
    // Add footers to all pages
    this.addFooters();
    
    // Save
    this.doc.save(outputPath);
  }

  /**
   * Add a relationship to the PDF
   */
  addRelationship(rel, idx) {
    const { partner, confidence, direction, reverseRelationship } = rel;
    const displayConfidence = reverseRelationship 
      ? Math.max(confidence, reverseRelationship.confidence)
      : confidence;
    
    this.checkNewPage(65);
    
    // Partner number badge
    this.doc.setFillColor(...COLORS.cyan);
    this.doc.circle(this.margin + 7, this.yPos + 2.5, 3, 'F');
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`${idx + 1}`, this.margin + (idx < 9 ? 5.7 : 5), this.yPos + 3.5);
    
    // Partner name
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(20, 20, 40);
    this.doc.text(sanitizeForPDF(partner.name), this.margin + 12, this.yPos + 3.5);
    
    // Confidence badge on the right
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    const confidenceText = formatConfidence(displayConfidence);
    const confidenceWidth = this.doc.getTextWidth(confidenceText);
    const badgeX = this.pageWidth - this.margin - confidenceWidth - 4;
    this.doc.setFillColor(...COLORS.green);
    this.doc.roundedRect(badgeX - 2, this.yPos - 1, confidenceWidth + 4, 5, 1, 1, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(confidenceText, badgeX, this.yPos + 2.5);
    this.yPos += 7;
    
    // Industry and direction indicator
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 120);
    this.doc.text(sanitizeForPDF(partner.industry), this.margin + 12, this.yPos);
    
    this.doc.setTextColor(0, 102, 204);
    const directionText = reverseRelationship ? '<-> Bidirectional' : '-> One-way';
    this.doc.text(directionText, this.pageWidth - this.margin - 25, this.yPos);
    this.yPos += 8;
    
    // Inbound/Outbound relationships
    const inboundRel = direction === 'inbound' ? rel : reverseRelationship;
    const outboundRel = direction === 'outbound' ? rel : reverseRelationship;
    
    // What They Provide
    if (inboundRel) {
      const typeLabel = RELATIONSHIP_LABELS[inboundRel.type] || inboundRel.type;
      this.yPos = this.drawSubsectionLabel(
        `WHAT THEY PROVIDE (${typeLabel})`,
        '<-',
        COLORS.blue,
        this.yPos
      );
      
      this.doc.setFontSize(8.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(45, 45, 45);
      const reasoningLines = this.wrapText(inboundRel.reasoning, this.contentWidth - 12);
      reasoningLines.forEach(line => {
        this.checkNewPage();
        this.doc.text(line, this.margin + 7, this.yPos);
        this.yPos += 4;
      });
      
      if (inboundRel.value_prop) {
        this.yPos += 2;
        this.doc.setFillColor(230, 255, 230);
        this.doc.rect(this.margin + 6, this.yPos - 3, this.contentWidth - 12, 1, 'F');
        this.yPos += 1;
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...COLORS.green);
        this.doc.text('VALUE:', this.margin + 7, this.yPos);
        this.doc.setFont('helvetica', 'normal');
        const vpLines = this.wrapText(inboundRel.value_prop, this.contentWidth - 25);
        vpLines.forEach((line, lineIdx) => {
          this.checkNewPage();
          this.doc.text(line, this.margin + (lineIdx === 0 ? 20 : 7), this.yPos);
          this.yPos += 3.5;
        });
      }
      this.yPos += 4;
    }
    
    // What You Provide
    if (outboundRel) {
      const typeLabel = RELATIONSHIP_LABELS[outboundRel.type] || outboundRel.type;
      this.yPos = this.drawSubsectionLabel(
        `WHAT YOU PROVIDE (${typeLabel})`,
        '->',
        COLORS.green,
        this.yPos
      );
      
      this.doc.setFontSize(8.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(45, 45, 45);
      const reasoningLines = this.wrapText(outboundRel.reasoning, this.contentWidth - 12);
      reasoningLines.forEach(line => {
        this.checkNewPage();
        this.doc.text(line, this.margin + 7, this.yPos);
        this.yPos += 4;
      });
      
      if (outboundRel.value_prop) {
        this.yPos += 2;
        this.doc.setFillColor(230, 255, 230);
        this.doc.rect(this.margin + 6, this.yPos - 3, this.contentWidth - 12, 1, 'F');
        this.yPos += 1;
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...COLORS.green);
        this.doc.text('VALUE:', this.margin + 7, this.yPos);
        this.doc.setFont('helvetica', 'normal');
        const vpLines = this.wrapText(outboundRel.value_prop, this.contentWidth - 25);
        vpLines.forEach((line, lineIdx) => {
          this.checkNewPage();
          this.doc.text(line, this.margin + (lineIdx === 0 ? 20 : 7), this.yPos);
          this.yPos += 3.5;
        });
      }
      this.yPos += 4;
    }
    
    // Collaboration Example
    if (rel.collaboration_example && rel.collaboration_example !== 'No specific example provided') {
      this.checkNewPage(12);
      
      this.yPos = this.drawSubsectionLabel(
        'PARTNERSHIP SCENARIO',
        '[!]',
        COLORS.purple,
        this.yPos
      );
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(90, 40, 90);
      const exampleLines = this.wrapText(rel.collaboration_example, this.contentWidth - 12);
      exampleLines.forEach(line => {
        this.checkNewPage();
        this.doc.text(line, this.margin + 7, this.yPos);
        this.yPos += 3.5;
      });
      this.yPos += 4;
    }
    
    // Synergy Potential
    if (rel.synergy_potential && rel.synergy_potential !== 'Complementary business synergy') {
      this.checkNewPage(10);
      
      this.yPos = this.drawSubsectionLabel(
        'UNIQUE SYNERGY',
        '[*]',
        COLORS.amber,
        this.yPos
      );
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(140, 90, 0);
      const synergyLines = this.wrapText(rel.synergy_potential, this.contentWidth - 12);
      synergyLines.forEach(line => {
        this.checkNewPage();
        this.doc.text(line, this.margin + 7, this.yPos);
        this.yPos += 3.5;
      });
      this.yPos += 4;
    }
    
    // Action Items
    if (rel.action_items && rel.action_items.length > 0) {
      this.checkNewPage(12);
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(40, 40, 60);
      this.doc.text('NEXT STEPS:', this.margin + 5, this.yPos);
      this.yPos += 5;
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(50, 50, 50);
      rel.action_items.forEach((item, itemIdx) => {
        this.checkNewPage();
        
        // Number badge
        this.doc.setFillColor(...COLORS.cyan);
        this.doc.circle(this.margin + 8, this.yPos - 1.5, 2, 'F');
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(`${itemIdx + 1}`, this.margin + (itemIdx < 9 ? 7.2 : 6.8), this.yPos - 0.5);
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(50, 50, 50);
        const itemLines = this.wrapText(item, this.contentWidth - 20);
        itemLines.forEach((line, lineIdx) => {
          this.doc.text(line, this.margin + 12, this.yPos);
          this.yPos += 3.5;
        });
        this.yPos += 1;
      });
      this.yPos += 2;
    }
    
    this.yPos += 6;
  }

  /**
   * Add footers to all pages
   */
  addFooters() {
    const totalPages = this.currentPage;
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...COLORS.footerGray);
      this.doc.text(`Page ${i} of ${totalPages}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
      this.doc.text('Generated by JAX Bridges Business Relationship Mapper', this.pageWidth / 2, this.pageHeight - 6, { align: 'center' });
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Business Report Generator\n');
  console.log('=' .repeat(60));
  
  // Paths
  const dataDir = path.join(__dirname, '..', 'data');
  const outputDir = path.join(__dirname, '..', 'output', 'business-reports');
  const relationshipsPath = path.join(dataDir, 'relationships.json');
  const businessesPath = path.join(dataDir, 'businesses.json');
  
  // Check if files exist
  if (!fs.existsSync(relationshipsPath)) {
    console.error('❌ Error: relationships.json not found');
    process.exit(1);
  }
  
  if (!fs.existsSync(businessesPath)) {
    console.error('❌ Error: businesses.json not found');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}\n`);
  } else {
    console.log(`📁 Output directory exists: ${outputDir}\n`);
  }
  
  // Load data
  console.log('📖 Loading data...');
  const relationships = JSON.parse(fs.readFileSync(relationshipsPath, 'utf-8'));
  const businesses = JSON.parse(fs.readFileSync(businessesPath, 'utf-8'));
  
  console.log(`   ✓ Loaded ${relationships.length} relationships`);
  console.log(`   ✓ Loaded ${businesses.length} businesses\n`);
  
  // Generate PDFs for each business
  console.log('📄 Generating Business Reports...');
  console.log('-'.repeat(60));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizeFilename(business.name)}_Partnership_Analysis_${dateStamp}.pdf`;
    const outputPath = path.join(outputDir, filename);
    
    try {
      // Get relationships for this business
      const rawRelationships = getBusinessRelationships(business.id, relationships, businesses);
      const enrichedRelationships = enrichRelationshipsWithReverse(
        business.id, 
        rawRelationships, 
        relationships, 
        businesses
      );
      const sortedRelationships = sortByConfidence(enrichedRelationships);
      const groupedRelationships = groupByPartner(sortedRelationships);
      
      // Generate PDF
      const pdfGenerator = new BusinessReportPDF();
      pdfGenerator.generate(business, groupedRelationships, outputPath);
      
      successCount++;
      console.log(`   ✓ [${i + 1}/${businesses.length}] ${business.name} (${groupedRelationships.length} partnerships)`);
    } catch (error) {
      errorCount++;
      console.error(`   ✗ [${i + 1}/${businesses.length}] Error: ${business.name}`);
      console.error(`      ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION COMPLETE\n');
  console.log(`   ✅ Successfully generated: ${successCount} PDFs`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} PDFs`);
  }
  console.log(`   📂 Output folder: ${outputDir}`);
  console.log(`   👥 Total businesses: ${businesses.length}`);
  console.log('\n' + '='.repeat(60));
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

