/**
 * Generate PDFs for All Business Relationships
 * 
 * This script reads relationships.json and creates individual PDF files
 * for each unique business pair, containing all their relationships.
 * 
 * Usage:
 *   node scripts/generate-all-relationship-pdfs.js
 * 
 * Output:
 *   Creates PDFs in output/relationship-pdfs/ folder
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
  green: [34, 197, 94],      // Success green
  yellow: [234, 179, 8],     // Warning yellow
  orange: [249, 115, 22]     // Medium orange
};

/**
 * Sanitize filename by removing/replacing invalid characters
 */
function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .replace(/_+/g, '_')
    .substring(0, 100); // Limit length
}

/**
 * Get confidence color based on value
 */
function getConfidenceColor(confidence) {
  if (confidence >= 80) return COLORS.green;
  if (confidence >= 60) return COLORS.yellow;
  return COLORS.orange;
}

/**
 * Get estimated value color
 */
function getValueColor(value) {
  switch (value?.toLowerCase()) {
    case 'high': return COLORS.green;
    case 'medium': return COLORS.yellow;
    case 'low': return COLORS.orange;
    default: return COLORS.mediumGray;
  }
}

/**
 * PDF Generator Class for Relationship Documents
 */
class RelationshipPDF {
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
    if (this.yPos + requiredSpace > this.pageHeight - 25) {
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
  wrapText(text, maxWidth, fontSize = 10) {
    this.doc.setFontSize(fontSize);
    const cleanText = String(text || '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim();
    return this.doc.splitTextToSize(cleanText, maxWidth);
  }

  /**
   * Add cover/header section
   */
  addHeader(business1, business2, relationshipCount) {
    // Navy header bar
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Cyan accent line
    this.doc.setFillColor(...COLORS.cyan);
    this.doc.rect(0, 50, this.pageWidth, 3, 'F');
    
    // Title
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BUSINESS RELATIONSHIP ANALYSIS', this.pageWidth / 2, 20, { align: 'center' });
    
    // Business names
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.text(`${business1} ↔ ${business2}`, this.pageWidth / 2, 35, { align: 'center' });
    
    // Relationship count badge
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text(`${relationshipCount} Relationship${relationshipCount > 1 ? 's' : ''} Identified`, this.pageWidth / 2, 45, { align: 'center' });
    
    this.yPos = 65;
  }

  /**
   * Add business info section
   */
  addBusinessInfo(businesses, fromName, toName) {
    const fromBusiness = businesses.find(b => b.name === fromName);
    const toBusiness = businesses.find(b => b.name === toName);
    
    if (!fromBusiness && !toBusiness) return;
    
    // Section header
    this.doc.setFillColor(...COLORS.lightGray);
    this.doc.rect(this.margin, this.yPos - 2, this.contentWidth, 10, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text('BUSINESS PROFILES', this.margin + 3, this.yPos + 5);
    this.yPos += 15;
    
    // Add each business
    [fromBusiness, toBusiness].forEach((business, idx) => {
      if (!business) return;
      
      this.checkNewPage(40);
      
      // Business name with cyan accent
      this.doc.setFillColor(...COLORS.cyan);
      this.doc.rect(this.margin, this.yPos - 1, 3, 8, 'F');
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.navy);
      this.doc.text(business.name, this.margin + 6, this.yPos + 5);
      this.yPos += 10;
      
      // Contact info
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.textGray);
      
      if (business.contact_name) {
        this.doc.text(`Contact: ${business.contact_name}`, this.margin + 6, this.yPos);
        this.yPos += 5;
      }
      if (business.industry) {
        this.doc.text(`Industry: ${business.industry}`, this.margin + 6, this.yPos);
        this.yPos += 5;
      }
      if (business.description) {
        const descLines = this.wrapText(business.description, this.contentWidth - 10, 9);
        descLines.forEach(line => {
          this.doc.text(line, this.margin + 6, this.yPos);
          this.yPos += 4;
        });
      }
      
      this.yPos += 8;
    });
    
    this.yPos += 5;
  }

  /**
   * Add a single relationship section
   */
  addRelationship(relationship, index, total) {
    this.checkNewPage(60);
    
    // Relationship header
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(this.margin, this.yPos - 2, this.contentWidth, 12, 'F');
    
    // Type badge
    const typeText = relationship.type?.toUpperCase() || 'RELATIONSHIP';
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text(`${typeText} ${index}/${total}`, this.margin + 3, this.yPos + 6);
    
    // Confidence badge on right
    const confidenceColor = getConfidenceColor(relationship.confidence);
    this.doc.setFillColor(...confidenceColor);
    this.doc.roundedRect(this.pageWidth - this.margin - 35, this.yPos, 32, 8, 2, 2, 'F');
    this.doc.setFontSize(9);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`${relationship.confidence}% conf`, this.pageWidth - this.margin - 32, this.yPos + 5.5);
    
    this.yPos += 18;
    
    // Direction indicator
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.mediumGray);
    this.doc.text(`${relationship.from_name} → ${relationship.to_name}`, this.margin, this.yPos);
    this.yPos += 8;
    
    // Sections
    this.addLabeledSection('Reasoning', relationship.reasoning);
    this.addLabeledSection('Value Proposition', relationship.value_prop);
    this.addLabeledSection('Collaboration Example', relationship.collaboration_example);
    this.addLabeledSection('Synergy Potential', relationship.synergy_potential);
    
    // Action Items
    if (relationship.action_items && relationship.action_items.length > 0) {
      this.checkNewPage(20);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.darkGray);
      this.doc.text('Action Items:', this.margin, this.yPos);
      this.yPos += 6;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.textGray);
      
      relationship.action_items.forEach((item, idx) => {
        this.checkNewPage(10);
        const wrapped = this.wrapText(`${idx + 1}. ${item}`, this.contentWidth - 10, 9);
        wrapped.forEach((line, lineIdx) => {
          this.doc.text(line, this.margin + (lineIdx === 0 ? 3 : 10), this.yPos);
          this.yPos += 4;
        });
        this.yPos += 2;
      });
    }
    
    // Estimated value and mutual benefit
    this.checkNewPage(15);
    this.yPos += 3;
    
    const valueColor = getValueColor(relationship.estimated_value);
    this.doc.setFillColor(...valueColor);
    this.doc.roundedRect(this.margin, this.yPos - 3, 45, 8, 2, 2, 'F');
    this.doc.setFontSize(8);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`Value: ${relationship.estimated_value?.toUpperCase() || 'N/A'}`, this.margin + 3, this.yPos + 2);
    
    if (relationship.mutual_benefit) {
      this.doc.setFillColor(...COLORS.green);
      this.doc.roundedRect(this.margin + 50, this.yPos - 3, 40, 8, 2, 2, 'F');
      this.doc.text('MUTUAL BENEFIT', this.margin + 53, this.yPos + 2);
    }
    
    this.yPos += 15;
    
    // Divider line
    this.doc.setDrawColor(...COLORS.lightGray);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 10;
  }

  /**
   * Add labeled text section
   */
  addLabeledSection(label, content) {
    if (!content) return;
    
    this.checkNewPage(15);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text(`${label}:`, this.margin, this.yPos);
    this.yPos += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textGray);
    const wrapped = this.wrapText(content, this.contentWidth - 5, 9);
    wrapped.forEach(line => {
      this.checkNewPage(5);
      this.doc.text(line, this.margin + 3, this.yPos);
      this.yPos += 4;
    });
    this.yPos += 4;
  }

  /**
   * Add footer to all pages
   */
  addFooters() {
    const totalPages = this.currentPage;
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...COLORS.footerGray);
      
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 12,
        { align: 'center' }
      );
      
      this.doc.text(
        'JAX Bridges Business Relationship Analysis',
        this.pageWidth / 2,
        this.pageHeight - 8,
        { align: 'center' }
      );
    }
  }

  /**
   * Generate PDF for a business pair
   */
  generate(business1, business2, relationships, businesses, outputPath) {
    this.addHeader(business1, business2, relationships.length);
    this.addBusinessInfo(businesses, business1, business2);
    
    relationships.forEach((rel, idx) => {
      this.addRelationship(rel, idx + 1, relationships.length);
    });
    
    this.addFooters();
    this.doc.save(outputPath);
  }
}

/**
 * Group relationships by business pairs (undirected)
 */
function groupRelationshipsByPair(relationships) {
  const pairs = new Map();
  
  relationships.forEach(rel => {
    // Create consistent key (alphabetically sorted)
    const names = [rel.from_name, rel.to_name].sort();
    const key = `${names[0]}|||${names[1]}`;
    
    if (!pairs.has(key)) {
      pairs.set(key, {
        business1: names[0],
        business2: names[1],
        relationships: []
      });
    }
    
    pairs.get(key).relationships.push(rel);
  });
  
  return Array.from(pairs.values());
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Relationship PDF Generator\n');
  console.log('=' .repeat(60));
  
  // Paths
  const dataDir = path.join(__dirname, '..', 'data');
  const outputDir = path.join(__dirname, '..', 'output', 'relationship-pdfs');
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
  
  // Group relationships by business pairs
  console.log('🔗 Grouping relationships by business pairs...');
  const pairs = groupRelationshipsByPair(relationships);
  console.log(`   ✓ Found ${pairs.length} unique business pairs\n`);
  
  // Generate PDFs
  console.log('📄 Generating PDFs...');
  console.log('-'.repeat(60));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const filename = `${sanitizeFilename(pair.business1)}_x_${sanitizeFilename(pair.business2)}.pdf`;
    const outputPath = path.join(outputDir, filename);
    
    try {
      const pdfGenerator = new RelationshipPDF();
      pdfGenerator.generate(
        pair.business1,
        pair.business2,
        pair.relationships,
        businesses,
        outputPath
      );
      
      successCount++;
      console.log(`   ✓ [${i + 1}/${pairs.length}] ${pair.business1} ↔ ${pair.business2} (${pair.relationships.length} relationships)`);
    } catch (error) {
      errorCount++;
      console.error(`   ✗ [${i + 1}/${pairs.length}] Error: ${pair.business1} ↔ ${pair.business2}`);
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
  console.log(`   📄 Total relationships: ${relationships.length}`);
  console.log(`   🔗 Unique business pairs: ${pairs.length}`);
  console.log('\n' + '='.repeat(60));
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

