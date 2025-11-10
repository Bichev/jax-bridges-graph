import Papa from 'papaparse';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse businesses CSV file into structured JSON
 * 
 * @param {string} filePath - Path to CSV file
 * @returns {Array<Object>} Array of business objects
 */
export const parseBusinessesCSV = (filePath) => {
  console.log('📄 Reading CSV file:', filePath);
  
  const csvContent = fs.readFileSync(filePath, 'utf8');
  
  const { data, errors } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  if (errors.length > 0) {
    console.warn('⚠️  CSV parsing warnings:', errors.length, 'issues found');
  }
  
  console.log(`✅ Parsed ${data.length} businesses from CSV`);
  
  return data.map((row, index) => {
    const business = {
      id: uuidv4(),
      name: sanitizeText(row['Company / Brand Name'] || row['Name'] || `Business ${index + 1}`),
      contact_name: sanitizeText(row['Name'] || 'Not specified'),
      description: sanitizeText(row['Your Product or Service in one sentence'] || 'Not specified'),
      website: sanitizeText(row['Business Website'] || ''),
      target_market: sanitizeText(row['Your Ideal Client / Target Market'] || 'Not specified'),
      current_needs: sanitizeText(row['Your current need (capital, marketing, legal, tech etc.)'] || 'Not specified'),
      contact_email: sanitizeText(row['Contact EMAIL'] || ''),
      contact_phone: sanitizeText(row['Contact Phone'] || ''),
      linkedin: sanitizeText(row['LinkedIn Profile URL'] || ''),
      fun_fact: sanitizeText(row['Fun Fact About You'] || ''),
      // Inferred fields for better categorization
      industry: inferIndustry(row),
      services: row['Your Product or Service in one sentence'] || 'Not specified'
    };
    
    return business;
  });
};

/**
 * Sanitize text input
 * @param {string} text - Raw text
 * @returns {string} Cleaned text
 */
const sanitizeText = (text) => {
  if (!text || text.trim() === '') return '';
  return text.trim().substring(0, 1000);
};

/**
 * Infer industry from business description and services
 * @param {Object} row - CSV row data
 * @returns {string} Industry category
 */
const inferIndustry = (row) => {
  const description = (row['Your Product or Service in one sentence'] || '').toLowerCase();
  const company = (row['Company / Brand Name'] || '').toLowerCase();
  const combined = description + ' ' + company;
  
  // Industry keyword matching
  if (/\b(ai|tech|software|automation|consulting)\b/i.test(combined)) return 'Technology';
  if (/\b(marketing|design|brand|creative|content)\b/i.test(combined)) return 'Marketing & Design';
  if (/\b(health|wellness|fitness|therapy|massage|mental)\b/i.test(combined)) return 'Health & Wellness';
  if (/\b(coach|training|speaking|consulting)\b/i.test(combined)) return 'Coaching & Consulting';
  if (/\b(real estate|property|commercial|appraisal)\b/i.test(combined)) return 'Real Estate';
  if (/\b(event|party|gift|craft|creative)\b/i.test(combined)) return 'Events & Gifts';
  if (/\b(food|cookie|restaurant|catering)\b/i.test(combined)) return 'Food & Beverage';
  if (/\b(freight|logistics|dispatch|transport)\b/i.test(combined)) return 'Logistics';
  if (/\b(clean|janitorial)\b/i.test(combined)) return 'Facilities Services';
  if (/\b(art|mural|paint|creative)\b/i.test(combined)) return 'Arts & Creative';
  
  return 'Professional Services';
};

/**
 * Save businesses to JSON file
 * @param {Array} businesses - Business objects array
 * @param {string} outputPath - Output file path
 */
export const saveBusinessesToJSON = (businesses, outputPath) => {
  const dataDir = path.dirname(outputPath);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(businesses, null, 2),
    'utf8'
  );
  
  console.log(`💾 Saved ${businesses.length} businesses to ${outputPath}`);
};

