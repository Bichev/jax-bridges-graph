/**
 * Bridge to Business - Judges Research Report PDF Generator
 * 
 * Converts the Bridge_to_Business_Judges_Research_Report.md into a 
 * professionally formatted PDF with clickable table of contents
 * 
 * Usage:
 *   node scripts/generate-judges-report-pdf.js
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
  footerGray: [150, 150, 150]
};

/**
 * Parse markdown file and extract structured content
 */
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const sections = [];
  let currentSection = null;
  let currentSubsection = null;
  let contentBuffer = [];
  let aboutSection = null; // Track the About JAX AI Agency section
  
  lines.forEach((line, index) => {
    // Special case: About JAX AI Agency section
    if (line.match(/^## ABOUT JAX AI AGENCY/)) {
      // Save previous section first
      if (currentSection) {
        if (contentBuffer.length > 0) {
          if (currentSubsection) {
            currentSubsection.content = contentBuffer.join('\n').trim();
          } else {
            currentSection.intro = contentBuffer.join('\n').trim();
          }
        }
        sections.push(currentSection);
      }
      
      // Start About section (special handling, no subsections)
      aboutSection = {
        isAbout: true,
        content: ''
      };
      currentSection = null;
      currentSubsection = null;
      contentBuffer = [];
      return;
    }
    
    // If we're in About section, collect all content
    if (aboutSection) {
      if (line.trim() && !line.match(/^---/)) {
        contentBuffer.push(line);
      }
      return;
    }
    
    // Main business section (## 1. BUSINESS NAME)
    if (line.match(/^## \d+\. /)) {
      // Save previous section
      if (currentSection) {
        if (contentBuffer.length > 0) {
          if (currentSubsection) {
            currentSubsection.content = contentBuffer.join('\n').trim();
          } else {
            currentSection.intro = contentBuffer.join('\n').trim();
          }
        }
        sections.push(currentSection);
      }
      
      // Start new section
      const match = line.match(/^## (\d+)\. (.+)/);
      currentSection = {
        number: match[1],
        title: match[2].toUpperCase(),
        subsections: [],
        intro: ''
      };
      currentSubsection = null;
      contentBuffer = [];
    }
    // Subsection (### Subsection Name)
    else if (line.match(/^### /)) {
      // Save previous subsection content
      if (contentBuffer.length > 0 && currentSubsection) {
        currentSubsection.content = contentBuffer.join('\n').trim();
        contentBuffer = [];
      }
      
      const subsectionTitle = line.replace(/^### /, '').trim();
      currentSubsection = {
        title: subsectionTitle,
        content: ''
      };
      if (currentSection) {
        currentSection.subsections.push(currentSubsection);
      }
    }
    // Regular content
    else if (line.trim() && !line.match(/^---/)) {
      contentBuffer.push(line);
    }
  });
  
  // Save last regular section
  if (currentSection) {
    if (contentBuffer.length > 0) {
      if (currentSubsection) {
        currentSubsection.content = contentBuffer.join('\n').trim();
      } else {
        currentSection.intro = contentBuffer.join('\n').trim();
      }
    }
    sections.push(currentSection);
  }
  
  // Save About section if it exists
  if (aboutSection && contentBuffer.length > 0) {
    aboutSection.content = contentBuffer.join('\n').trim();
  }
  
  return { sections, aboutSection };
}

/**
 * Extract executive summary and metadata
 */
function extractFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let title = '';
  let eventInfo = '';
  let executiveSummary = '';
  let capturing = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
    } else if (line.startsWith('**Event Date:**')) {
      eventInfo = line.replace('**Event Date:**', '').trim();
    } else if (line.startsWith('**Location:**')) {
      eventInfo += '\n' + line.replace('**Location:**', '').trim();
    } else if (line.startsWith('## Executive Summary')) {
      capturing = true;
      continue;
    } else if (capturing && line.startsWith('##')) {
      break;
    } else if (capturing && line.trim() && !line.startsWith('---')) {
      executiveSummary += line + '\n';
    }
  }
  
  return { title, eventInfo, executiveSummary: executiveSummary.trim() };
}

/**
 * Main PDF generation class
 */
class JudgesReportPDF {
  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (2 * this.margin);
    this.yPos = this.margin;
    this.tocEntries = []; // Store TOC entries with page numbers
    this.currentPage = 1;
  }
  
  /**
   * Add a new page if needed
   */
  checkNewPage(requiredSpace = 20) {
    if (this.yPos + requiredSpace > this.pageHeight - 25) {
      // Don't add footer here - we'll add all footers at the end
      this.doc.addPage();
      this.currentPage++;
      this.yPos = this.margin;
      return true;
    }
    return false;
  }
  
  /**
   * Add footer to current page
   */
  addFooter() {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.footerGray);
    this.doc.text(
      `Page ${this.currentPage}`,
      this.pageWidth / 2,
      this.pageHeight - 12,
      { align: 'center' }
    );
    this.doc.text(
      'Bridge to Business - Judge Research Report',
      this.pageWidth / 2,
      this.pageHeight - 8,
      { align: 'center' }
    );
  }
  
  /**
   * Wrap text to fit width
   */
  wrapText(text, maxWidth, fontSize = 10) {
    this.doc.setFontSize(fontSize);
    // Clean markdown formatting
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1')     // Remove italic
      .replace(/`(.+?)`/g, '$1')       // Remove code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .trim();
    return this.doc.splitTextToSize(cleanText, maxWidth);
  }
  
  /**
   * Add cover page
   */
  addCoverPage(frontMatter) {
    // Full navy background
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Decorative cyan accent bar
    this.doc.setFillColor(...COLORS.cyan);
    this.doc.rect(0, 70, this.pageWidth, 3, 'F');
    
    // Main title
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    
    const titleLines = this.doc.splitTextToSize(frontMatter.title, this.contentWidth);
    let titleY = 90;
    titleLines.forEach(line => {
      this.doc.text(line, this.pageWidth / 2, titleY, { align: 'center' });
      titleY += 12;
    });
    
    // Event info
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255);
    const eventLines = frontMatter.eventInfo.split('\n');
    let eventY = titleY + 20;
    eventLines.forEach(line => {
      this.doc.text(line, this.pageWidth / 2, eventY, { align: 'center' });
      eventY += 7;
    });
    
    // Bottom branding
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text('JAX AI AGENCY', this.pageWidth / 2, this.pageHeight - 40, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(200, 200, 200);
    this.doc.text('VV Pro AI, LLC', this.pageWidth / 2, this.pageHeight - 32, { align: 'center' });
    
    // Date
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.footerGray);
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(`Generated: ${today}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    
    // New page for content
    this.doc.addPage();
    this.currentPage++;
    this.yPos = this.margin;
  }
  
  /**
   * Add Executive Summary
   */
  addExecutiveSummary(frontMatter) {
    // Section header with background
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(this.margin - 5, this.yPos - 2, this.contentWidth + 10, 12, 'F');
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text('EXECUTIVE SUMMARY', this.margin, this.yPos + 6);
    this.yPos += 16; // REDUCED spacing
    
    // Content
    const summaryLines = frontMatter.executiveSummary.split('\n');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textGray);
    
    summaryLines.forEach(line => {
      if (line.startsWith('**JAX AI Agency Value Propositions:**')) {
        this.checkNewPage(25);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...COLORS.darkGray);
        this.doc.text('JAX AI Agency Value Propositions:', this.margin, this.yPos);
        this.yPos += 6;
        this.doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('- ')) {
        this.checkNewPage(6);
        this.doc.setTextColor(...COLORS.textGray);
        const bulletText = line.replace('- ', '');
        const wrapped = this.wrapText(bulletText, this.contentWidth - 10);
        wrapped.forEach((wLine, idx) => {
          if (idx === 0) {
            this.doc.text('•', this.margin + 3, this.yPos);
            this.doc.text(wLine, this.margin + 8, this.yPos);
          } else {
            this.doc.text(wLine, this.margin + 8, this.yPos);
          }
          this.yPos += 5; // REDUCED spacing
        });
      } else if (line.trim()) {
        this.checkNewPage(8);
        const wrapped = this.wrapText(line, this.contentWidth);
        wrapped.forEach(wLine => {
          this.doc.text(wLine, this.margin, this.yPos);
          this.yPos += 5; // REDUCED spacing
        });
      }
    });
    
    this.yPos += 8; // REDUCED spacing
  }
  
  /**
   * Add Table of Contents with hyperlinks
   */
  addTableOfContents(sections) {
    this.checkNewPage(40);
    
    // Section header
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(this.margin - 5, this.yPos - 2, this.contentWidth + 10, 12, 'F');
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text('TABLE OF CONTENTS', this.margin, this.yPos + 6);
    this.yPos += 18;
    
    // Placeholder entries (we'll come back and add page numbers)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    sections.forEach((section, idx) => {
      this.checkNewPage(8);
      
      // Store TOC position for later linking
      const tocY = this.yPos;
      const tocPage = this.currentPage;
      
      // Number
      this.doc.setTextColor(...COLORS.darkGray);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${section.number}.`, this.margin + 5, this.yPos);
      
      // Title (will be replaced with link later)
      const titleText = section.title;
      const linkId = `business-${section.number}`;
      
      // Store for later - we'll add the link after we know the destination page
      this.tocEntries.push({
        linkId,
        tocPage,
        tocY,
        x: this.margin + 15,
        text: titleText,
        section
      });
      
      // Don't render text yet - we'll do it later with the link
      
      this.yPos += 7;
    });
    
    this.yPos += 10;
  }
  
  /**
   * Add section divider
   */
  addSectionDivider() {
    this.checkNewPage(15);
    this.doc.setDrawColor(...COLORS.cyan);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 10;
  }
  
  /**
   * Add business section
   */
  addBusinessSection(section) {
    // Add destination for TOC link
    this.doc.addPage();
    this.currentPage++;
    this.yPos = this.margin;
    
    const destinationPage = this.currentPage;
    
    // Update TOC entry with actual page number
    const tocEntry = this.tocEntries.find(entry => entry.linkId === `business-${section.number}`);
    if (tocEntry) {
      tocEntry.destinationPage = destinationPage;
    }
    
    // Section number badge - FIXED: Better centering
    this.doc.setFillColor(...COLORS.cyan);
    this.doc.circle(this.margin + 8, this.yPos + 6, 8, 'F');
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.navy);
    // Use better vertical alignment for circle center
    this.doc.text(section.number, this.margin + 8, this.yPos + 9.5, { align: 'center' });
    
    // Section title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.darkGray);
    const titleLines = this.wrapText(section.title, this.contentWidth - 30, 18);
    let titleY = this.yPos + 8;
    titleLines.forEach(line => {
      this.doc.text(line, this.margin + 20, titleY);
      titleY += 8;
    });
    
    this.yPos = titleY + 6; // REDUCED spacing
    
    // Subsections
    section.subsections.forEach(subsection => {
      this.checkNewPage(25);
      
      // Subsection header with background
      this.doc.setFillColor(...COLORS.lightGray);
      this.doc.rect(this.margin, this.yPos - 2, this.contentWidth, 8, 'F');
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...COLORS.darkGray);
      this.doc.text(subsection.title, this.margin + 3, this.yPos + 4);
      this.yPos += 11; // REDUCED spacing
      
      // Subsection content
      this.addSubsectionContent(subsection.content);
      this.yPos += 5; // REDUCED spacing
    });
  }
  
  /**
   * Add subsection content with formatting
   */
  addSubsectionContent(content) {
    const lines = content.split('\n');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    let inBulletList = false;
    let inNumberedList = false; // Track if we're in a numbered list
    
    lines.forEach(line => {
      if (!line.trim()) {
        this.yPos += 2; // REDUCED spacing
        return;
      }
      
      // Bullet point with dash - CHANGED: All regular text now
      if (line.match(/^-\s+\*\*(.+?):\*\*/)) {
        this.checkNewPage(12);
        inBulletList = true;
        
        // Regular label (no longer bold)
        const match = line.match(/^-\s+\*\*(.+?):\*\*\s*(.+)/);
        if (match) {
          this.doc.setFont('helvetica', 'normal'); // CHANGED: Was bold, now regular
          this.doc.setTextColor(...COLORS.textGray);
          this.doc.text('•', this.margin + 3, this.yPos);
          this.doc.text(`${match[1]}: `, this.margin + 8, this.yPos); // Regular label with space
          
          // Regular text after colon
          if (match[2]) {
            const labelWidth = this.doc.getTextWidth(`${match[1]}: `);
            
            // Better width calculation to prevent overflow
            const availableWidth = this.contentWidth - labelWidth - 10;
            const wrapped = this.wrapText(match[2], availableWidth);
            
            wrapped.forEach((wLine, idx) => {
              if (idx === 0) {
                this.doc.text(wLine, this.margin + 8 + labelWidth, this.yPos);
                this.yPos += 5;
              } else {
                this.checkNewPage(5);
                this.doc.text(wLine, this.margin + 10, this.yPos);
                this.yPos += 5;
              }
            });
          } else {
            this.yPos += 5;
          }
        }
      }
      // Regular bullet (or sub-bullet under numbered list)
      else if (line.match(/^-\s+/)) {
        this.checkNewPage(8);
        inBulletList = true;
        
        const bulletText = line.replace(/^-\s+/, '');
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...COLORS.textGray);
        
        // FIXED: Use deeper indent if we're under a numbered list
        const bulletIndent = inNumberedList ? 15 : 3;
        const textIndent = inNumberedList ? 20 : 8;
        const wrapWidth = inNumberedList ? this.contentWidth - 22 : this.contentWidth - 12;
        
        const wrapped = this.wrapText(bulletText, wrapWidth);
        
        wrapped.forEach((wLine, idx) => {
          if (idx === 0) {
            this.doc.text('-', this.margin + bulletIndent, this.yPos);
            this.doc.text(wLine, this.margin + textIndent, this.yPos);
          } else {
            this.checkNewPage(5);
            this.doc.text(wLine, this.margin + textIndent, this.yPos); // Consistent indentation
          }
          this.yPos += 5;
        });
      }
      // Numbered list - FIXED: Not bold, just regular text
      else if (line.match(/^\d+\.\s+/)) {
        this.checkNewPage(8);
        inNumberedList = true; // We're now in a numbered list context
        
        const match = line.match(/^(\d+)\.\s+(.+)/);
        if (match) {
          // CHANGED: Numbers are now regular, not bold
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(...COLORS.textGray);
          this.doc.text(`${match[1]}.`, this.margin + 3, this.yPos);
          
          // Text stays regular
          const wrapped = this.wrapText(match[2], this.contentWidth - 12);
          wrapped.forEach((wLine, idx) => {
            if (idx === 0) {
              this.doc.text(wLine, this.margin + 10, this.yPos);
            } else {
              this.checkNewPage(5);
              this.doc.text(wLine, this.margin + 10, this.yPos); // FIXED: Proper indentation
            }
            this.yPos += 5;
          });
        }
      }
      // Regular heading (no longer bold)
      else if (line.match(/^\*\*(.+?):\*\*/)) {
        this.checkNewPage(10);
        inBulletList = false;
        inNumberedList = false; // Reset when we hit a new section
        
        const match = line.match(/^\*\*(.+?):\*\*\s*(.+)/);
        if (match) {
          this.doc.setFont('helvetica', 'normal'); // CHANGED: Was bold, now regular
          this.doc.setTextColor(...COLORS.textGray);
          this.doc.text(`${match[1]}: `, this.margin + 2, this.yPos);
          
          if (match[2]) {
            const labelWidth = this.doc.getTextWidth(`${match[1]}: `);
            
            // Better width calculation to prevent overflow
            const availableWidth = this.contentWidth - labelWidth - 4;
            const wrapped = this.wrapText(match[2], availableWidth);
            
            wrapped.forEach((wLine, idx) => {
              if (idx === 0) {
                this.doc.text(wLine, this.margin + 2 + labelWidth, this.yPos);
                this.yPos += 5;
              } else {
                this.checkNewPage(5);
                this.doc.text(wLine, this.margin + 2, this.yPos);
                this.yPos += 5;
              }
            });
          } else {
            this.yPos += 5;
          }
        }
      }
      // Regular paragraph
      else {
        this.checkNewPage(8);
        inBulletList = false;
        inNumberedList = false; // Reset on regular paragraph
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...COLORS.textGray);
        const wrapped = this.wrapText(line, this.contentWidth);
        wrapped.forEach(wLine => {
          this.checkNewPage(5);
          this.doc.text(wLine, this.margin, this.yPos);
          this.yPos += 5;
        });
      }
    });
  }
  
  /**
   * Add About JAX AI Agency section
   */
  addAboutSection(aboutSection) {
    if (!aboutSection || !aboutSection.content) return;
    
    this.checkNewPage(40);
    
    // Section header
    this.doc.setFillColor(...COLORS.navy);
    this.doc.rect(this.margin - 5, this.yPos - 2, this.contentWidth + 10, 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.cyan);
    this.doc.text('ABOUT JAX AI AGENCY', this.margin, this.yPos + 6);
    this.yPos += 16;
    
    // Render content using the subsection formatter
    this.addSubsectionContent(aboutSection.content);
  }
  
  /**
   * Generate the complete PDF
   */
  generate(inputPath, outputPath) {
    console.log('📄 Generating Bridge to Business Judges Report PDF...\n');
    
    // Parse content
    console.log('📖 Parsing markdown content...');
    const frontMatter = extractFrontMatter(inputPath);
    const { sections, aboutSection } = parseMarkdown(inputPath);
    console.log(`   ✓ Found ${sections.length} business profiles\n`);
    
    // Build PDF
    console.log('🎨 Building PDF with brand styling...');
    this.addCoverPage(frontMatter);
    this.addExecutiveSummary(frontMatter);
    this.addTableOfContents(sections);
    
    console.log('   ✓ Cover page, executive summary, and TOC added');
    
    // Add each business section
    console.log('   ✓ Adding business profiles...');
    sections.forEach((section, idx) => {
      this.addBusinessSection(section);
      console.log(`      ${idx + 1}. ${section.title}`);
    });
    
    // REMOVED: About section per user request
    // if (aboutSection) {
    //   console.log('   ✓ Adding About JAX AI Agency section');
    //   this.addAboutSection(aboutSection);
    // }
    
    const totalPages = this.currentPage;
    
    // FIXED: Add ALL footers and page numbers in one pass (no duplication)
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      // Skip cover page (page 1)
      if (i > 1) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(...COLORS.footerGray);
        // Page number
        this.doc.text(
          `Page ${i - 1} of ${totalPages - 1}`, // Exclude cover from count
          this.pageWidth / 2,
          this.pageHeight - 12,
          { align: 'center' }
        );
        // Footer text
        this.doc.text(
          'Bridge to Business - Judge Research Report',
          this.pageWidth / 2,
          this.pageHeight - 8,
          { align: 'center' }
        );
      }
    }
    
    // Update TOC links with actual destinations
    this.tocEntries.forEach(entry => {
      if (entry.destinationPage) {
        this.doc.setPage(entry.tocPage);
        this.doc.setTextColor(0, 100, 200);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.doc.textWithLink(entry.text, entry.x, entry.tocY, {
          pageNumber: entry.destinationPage
        });
        
        // Add page number
        this.doc.setTextColor(...COLORS.mediumGray);
        this.doc.text(
          `Page ${entry.destinationPage - 1}`,
          this.pageWidth - this.margin - 5,
          entry.tocY,
          { align: 'right' }
        );
      }
    });
    
    // Save PDF
    console.log('\n💾 Saving PDF...');
    this.doc.save(outputPath);
    console.log(`   ✓ PDF saved to: ${outputPath}`);
    console.log(`   ✓ Total pages: ${totalPages}`);
    console.log('\n✅ PDF generation complete!\n');
  }
}

/**
 * Main execution
 */
function main() {
  const inputPath = path.join(__dirname, '..', 'doc', 'Bridge_to_Business_Judges_Research_Report.md');
  const outputDir = path.join(__dirname, '..', 'doc');
  const dateStamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(outputDir, `Bridge_to_Business_Judges_Report_${dateStamp}.pdf`);
  
  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }
  
  try {
    const pdfGenerator = new JudgesReportPDF();
    pdfGenerator.generate(inputPath, outputPath);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

// Run the script
main();

