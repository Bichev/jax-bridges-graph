/**
 * Text Sanitization Utilities
 * 
 * Provides functions to clean and sanitize text for various use cases,
 * including PDF export, display, and data processing.
 * 
 * @module textSanitizer
 */

/**
 * Sanitize text for PDF export
 * Removes emojis, special Unicode characters, and PDF-incompatible symbols
 * Converts Unicode arrows to ASCII equivalents
 * 
 * @param {string} text - Raw text to sanitize
 * @returns {string} Cleaned text safe for PDF rendering
 * 
 * @example
 * sanitizeForPDF('Hello → World! 🎉')
 * // Returns: 'Hello -> World!'
 */
export const sanitizeForPDF = (text) => {
  if (!text) return '';
  
  return text
    // FIRST: Convert Unicode characters we want to preserve (do this BEFORE removing ranges)
    // Clean up Unicode arrows (convert to ASCII)
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/⇄/g, '<->')
    .replace(/↔/g, '<->')
    .replace(/⟶/g, '->')
    .replace(/⟵/g, '<-')
    .replace(/⇒/g, '=>')
    .replace(/⇐/g, '<=')
    // Replace bullet points with asterisks
    .replace(/•/g, '*')
    .replace(/●/g, '*')
    .replace(/○/g, '*')
    .replace(/◦/g, '-')
    // SECOND: Remove bracket-based frame indicators (markdown-style)
    .replace(/\[!\]\s*/g, '')               // [!] indicator
    .replace(/\[\*\]\s*/g, '')              // [*] indicator
    .replace(/\[!!\]\s*/g, '')              // [!!] indicator
    .replace(/\[\?\]\s*/g, '')              // [?] indicator
    .replace(/\[i\]\s*/gi, '')              // [i] or [I] indicator
    .replace(/\[x\]\s*/gi, '')              // [x] or [X] indicator
    // THIRD: Remove problematic icon font artifacts (but preserve percentage signs)
    .replace(/[!%][\u00C0-\u00FF]/g, '')    // Icon font artifacts like !Ä, %I (with diacritics)
    .replace(/![�\uFFFD]/g, '')             // Replacement characters after !
    .replace(/^%[\u0041-\u005A]\s+/gm, '')  // Leading %[A-Z] with space (e.g., "%I Professional")
    .replace(/^!\s+/gm, '')                 // Leading ! with space
    // FOURTH: Remove emoji ranges and symbols we don't want
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols (after bullets are converted)
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{2190}-\u{21FF}]/gu, '')   // Arrows (after conversion to ASCII)
    .replace(/[\u{2300}-\u{23FF}]/gu, '')   // Misc Technical
    .replace(/[\u{25A0}-\u{25FF}]/gu, '')   // Geometric shapes
    .replace(/[\u{2B00}-\u{2BFF}]/gu, '')   // Misc symbols and arrows
    // Remove other problematic Unicode
    .replace(/[\uFFFD]/g, '')               // Replacement character
    .replace(/[\u0000-\u001F]/g, '')        // Control characters
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitize text for general display
 * Less aggressive than PDF sanitization - keeps some Unicode
 * but removes problematic characters and normalizes whitespace
 * 
 * @param {string} text - Raw text to sanitize
 * @returns {string} Cleaned text
 * 
 * @example
 * sanitizeForDisplay('Hello  World!  ')
 * // Returns: 'Hello World!'
 */
export const sanitizeForDisplay = (text) => {
  if (!text) return '';
  
  return text
    // Remove problematic icon font artifacts
    .replace(/[!%][\u00C0-\u00FF]/g, '')    // Icon font artifacts like !Ä, %I
    .replace(/[!%][�\uFFFD]/g, '')          // Replacement characters
    .replace(/[\uFFFD]/g, '')               // Replacement character
    .replace(/[\u0000-\u001F]/g, '')        // Control characters (except newlines)
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Clean text extracted from PDFs
 * Removes common PDF extraction artifacts and encoding issues
 * 
 * @param {string} text - Text extracted from PDF
 * @returns {string} Cleaned text
 * 
 * @example
 * cleanPDFExtraction('H e l l o   W o r l d')
 * // Returns: 'H e l l o W o r l d'
 */
export const cleanPDFExtraction = (text) => {
  if (!text) return '';
  
  return text
    // Remove PDF encoding artifacts
    .replace(/[!%][\u00C0-\u00FF]/g, '')    // Icon font artifacts like !Ä, %I
    .replace(/[!%][�\uFFFD]/g, '')          // Replacement characters
    .replace(/[\uFFFD]/g, '')               // Replacement character
    // Clean up spaced-out text (common in PDFs)
    .replace(/([a-z])\s+([a-z])/gi, '$1$2') // Remove spaces between letters
    // Remove control characters
    .replace(/[\u0000-\u001F]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Remove all emojis from text
 * Useful when emojis cause rendering or encoding issues
 * 
 * @param {string} text - Text containing emojis
 * @returns {string} Text without emojis
 * 
 * @example
 * removeEmojis('Hello 🌍 World 🎉!')
 * // Returns: 'Hello  World !'
 */
export const removeEmojis = (text) => {
  if (!text) return '';
  
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convert Unicode arrows to ASCII equivalents
 * Useful for ensuring compatibility with various systems
 * 
 * @param {string} text - Text containing Unicode arrows
 * @returns {string} Text with ASCII arrows
 * 
 * @example
 * convertArrowsToASCII('A → B ⇄ C')
 * // Returns: 'A -> B <-> C'
 */
export const convertArrowsToASCII = (text) => {
  if (!text) return '';
  
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/⇄/g, '<->')
    .replace(/↔/g, '<->')
    .replace(/⟶/g, '->')
    .replace(/⟵/g, '<-')
    .replace(/⇒/g, '=>')
    .replace(/⇐/g, '<=')
    .replace(/⇨/g, '->')
    .replace(/⇦/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v');
};

/**
 * Sanitize text for CSV export
 * Escapes special CSV characters and removes problematic Unicode
 * 
 * @param {string} text - Text to sanitize for CSV
 * @returns {string} CSV-safe text
 * 
 * @example
 * sanitizeForCSV('Hello, "World"!')
 * // Returns: 'Hello, ""World""!'
 */
export const sanitizeForCSV = (text) => {
  if (!text) return '';
  
  return text
    // Remove problematic characters
    .replace(/[\uFFFD]/g, '')
    .replace(/[\u0000-\u001F]/g, '')
    // Escape double quotes for CSV
    .replace(/"/g, '""')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalize whitespace in text
 * Converts multiple spaces/tabs/newlines to single spaces
 * 
 * @param {string} text - Text with irregular whitespace
 * @returns {string} Text with normalized whitespace
 * 
 * @example
 * normalizeWhitespace('Hello\n\n  World\t!')
 * // Returns: 'Hello World !'
 */
export const normalizeWhitespace = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .trim();
};

export default {
  sanitizeForPDF,
  sanitizeForDisplay,
  cleanPDFExtraction,
  removeEmojis,
  convertArrowsToASCII,
  sanitizeForCSV,
  normalizeWhitespace
};

