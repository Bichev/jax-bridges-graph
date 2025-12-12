# Bridge to Business - Judges Report PDF Generator

## Overview

This document describes the PDF generation script that converts the Bridge to Business Judges Research Report from Markdown to a professionally formatted PDF with JAX Bridges brand styling.

## Features

### 1. **Professional Brand Styling**
- **Cover Page**: Full navy background with cyan accents, event details, and JAX AI Agency branding
- **Color Scheme**: Uses JAX Bridges colors (Navy #0A1628, Cyan #00D9FF)
- **Typography**: Professional Helvetica fonts with proper hierarchy

### 2. **Table of Contents with Hyperlinks**
- Automatically generated after Executive Summary
- Clickable links that jump to each business section
- Page numbers for easy navigation
- Blue link styling for clear visual indication

### 3. **Structured Content**
- **Executive Summary**: Prominently displayed with value propositions
- **12 Business Profiles**: Each on a separate page with:
  - Numbered badge (cyan circle)
  - Organization Profile
  - Current Operations & Challenges
  - Pain Points & Opportunities
  - Value Proposition
  - Pitch Angle

### 4. **Smart Formatting**
- **Auto Page Breaks**: Content flows across pages intelligently
- **Bullet Points**: Properly formatted with indentation
- **Bold Labels**: Key information stands out
- **Section Headers**: Gray background bars for visual separation
- **Page Numbers**: Footer on every page (except cover)

### 5. **Markdown Support**
- Automatically converts markdown formatting:
  - `**bold**` → Bold text
  - `- bullet` → Bullet points
  - `1. numbered` → Numbered lists
  - Preserves structure and hierarchy

## Usage

### Basic Command

```bash
npm run generate-judges-report
```

Or directly:

```bash
node scripts/generate-judges-report-pdf.js
```

### Output

- **Location**: `doc/Bridge_to_Business_Judges_Report_YYYY-MM-DD.pdf`
- **Filename**: Auto-generated with current date
- **Pages**: ~27 pages (depending on content)

## Example Output

```
📄 Generating Bridge to Business Judges Report PDF...

📖 Parsing markdown content...
   ✓ Found 12 business profiles

🎨 Building PDF with brand styling...
   ✓ Cover page, executive summary, and TOC added
   ✓ Adding business profiles...
      1. AULD & WHITE CONSTRUCTORS
      2. BAPTIST HEALTH JACKSONVILLE
      3. DUVAL COUNTY PUBLIC SCHOOLS (DCPS)
      4. FLORIDA BLUE
      5. JACKSONVILLE AVIATION AUTHORITY (JAA)
      6. JEA (JACKSONVILLE ELECTRIC AUTHORITY)
      7. JACKSONVILLE TRANSPORTATION AUTHORITY (JTA)
      8. JAXPORT (JACKSONVILLE PORT AUTHORITY)
      9. JACKSONVILLE WOMEN'S BUSINESS CENTER (JWBC)
      10. JIM MORAN INSTITUTE FOR GLOBAL ENTREPRENEURSHIP
      11. PERFECTLY SUITED CAREER CONSULTING
      12. SOUTHEASTERN GROCERS (WINN-DIXIE & HARVEYS)

💾 Saving PDF...
   ✓ PDF saved to: doc/Bridge_to_Business_Judges_Report_2025-11-18.pdf
   ✓ Total pages: 27

✅ PDF generation complete!
```

## Technical Details

### Dependencies
- **jsPDF**: PDF generation library (already installed)
- **Node.js**: ES modules with import/export
- **File System**: Reads markdown, writes PDF

### Script Location
- **Path**: `scripts/generate-judges-report-pdf.js`
- **Input**: `doc/Bridge_to_Business_Judges_Research_Report.md`
- **Output**: `doc/Bridge_to_Business_Judges_Report_YYYY-MM-DD.pdf`

### Brand Colors Used

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Navy | #0A1628 | 10, 22, 40 | Cover page background, headers |
| Cyan | #00D9FF | 0, 217, 255 | Accents, links, titles |
| Light Gray | #F0F5FA | 240, 245, 250 | Section backgrounds |
| Dark Gray | #282828 | 40, 40, 40 | Body text |
| Medium Gray | #646464 | 100, 100, 100 | Secondary text |

## PDF Structure

```
┌─────────────────────────────────────┐
│ 1. COVER PAGE                       │
│    - Title                          │
│    - Event details                  │
│    - JAX AI Agency branding        │
│    - Date                          │
├─────────────────────────────────────┤
│ 2. EXECUTIVE SUMMARY               │
│    - Overview                       │
│    - Value propositions             │
├─────────────────────────────────────┤
│ 3. TABLE OF CONTENTS               │
│    - Clickable links                │
│    - Page numbers                   │
├─────────────────────────────────────┤
│ 4-15. BUSINESS PROFILES (x12)      │
│    - Organization Profile           │
│    - Current Operations             │
│    - Pain Points                    │
│    - Value Proposition              │
│    - Pitch                          │
└─────────────────────────────────────┘
```

## Customization

### Modifying Colors

Edit the `COLORS` object in the script:

```javascript
const COLORS = {
  navy: [10, 22, 40],        // #0A1628
  cyan: [0, 217, 255],       // #00D9FF
  // ... other colors
};
```

### Adjusting Page Margins

Modify the `margin` property in the constructor:

```javascript
constructor() {
  this.margin = 20; // Default: 20 units
  // ...
}
```

### Changing Font Sizes

Font sizes are set throughout the script:
- **Title**: 32pt
- **Section Headers**: 18pt
- **Subsection Headers**: 12pt
- **Body Text**: 10pt
- **Footer**: 8pt

## Troubleshooting

### PDF Not Generating?

1. **Check file exists**: Ensure `doc/Bridge_to_Business_Judges_Research_Report.md` exists
2. **Check permissions**: Ensure write access to `doc/` folder
3. **Check console**: Look for error messages

### Formatting Issues?

1. **Markdown syntax**: Ensure markdown is properly formatted
2. **Special characters**: The script handles most markdown, but complex formatting may need adjustment
3. **Long text**: Very long sections may need manual page break adjustments

### Links Not Working?

1. **PDF Reader**: Ensure you're using a PDF reader that supports internal links (Adobe, Preview, Chrome)
2. **Re-generate**: Try regenerating the PDF

## Maintenance

### Updating Content

1. Edit `doc/Bridge_to_Business_Judges_Research_Report.md`
2. Run `npm run generate-judges-report`
3. New PDF generated with updated content

### Adding New Sections

The script automatically detects:
- `## N. BUSINESS NAME` → New business section
- `### Subsection` → Subsections within business

## Future Enhancements

Potential improvements:
- [ ] Add images/logos support
- [ ] Custom fonts (beyond Helvetica)
- [ ] Charts and graphs
- [ ] Multi-column layout options
- [ ] Configurable themes
- [ ] Export to other formats (DOCX, HTML)

## Related Files

- **Script**: `scripts/generate-judges-report-pdf.js`
- **Input**: `doc/Bridge_to_Business_Judges_Research_Report.md`
- **Style Reference**: `src/components/BusinessDetailPanel.jsx` (PDF export function)
- **Text Sanitization**: `src/utils/textSanitizer.js`

## Credits

- **Generator**: JAX AI Agency
- **Framework**: jsPDF
- **Brand**: JAX Bridges Business Relationship Mapper
- **Date**: November 2025

---

**Questions?** Contact the JAX AI Agency team or refer to the main project README.

