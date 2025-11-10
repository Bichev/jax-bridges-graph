/**
 * PDF Text Cleaning Utility
 * 
 * This script demonstrates how to clean text extracted from PDFs
 * and fix common encoding issues like icon font artifacts (!Ä, %I, etc.)
 * 
 * Usage:
 *   node scripts/clean-pdf-text.js "text to clean"
 *   or just run it to see examples
 */

import { 
  sanitizeForPDF, 
  cleanPDFExtraction,
  convertArrowsToASCII 
} from '../src/utils/textSanitizer.js';

/**
 * Examples of problematic text patterns found in PDFs
 */
const PROBLEM_EXAMPLES = [
  {
    name: 'Icon font artifacts',
    input: '!Ä Bidirectional relationship',
    expected: 'Bidirectional relationship'
  },
  {
    name: 'Industry icons',
    input: '%I Professional Services',
    expected: 'Professional Services'
  },
  {
    name: 'Unicode arrows',
    input: 'Company A → Company B ⇄ Company C',
    expected: 'Company A -> Company B <-> Company C'
  },
  {
    name: 'Mixed problematic characters',
    input: '!� WHAT THEY PROVIDE (Referral)',
    expected: 'WHAT THEY PROVIDE (Referral)'
  },
  {
    name: 'Bracket frame indicators',
    input: '[!] PARTNERSHIP SCENARIO',
    expected: 'PARTNERSHIP SCENARIO'
  },
  {
    name: 'Multiple bracket frames',
    input: '[*] UNIQUE SYNERGY and [!] PARTNERSHIP SCENARIO',
    expected: 'UNIQUE SYNERGY and PARTNERSHIP SCENARIO'
  },
  {
    name: 'Emojis and special symbols',
    input: 'Hello 🌍 World • Item 1 ● Item 2',
    expected: 'Hello World * Item 1 * Item 2'
  },
  {
    name: 'Replacement characters',
    input: 'Text with � replacement � characters',
    expected: 'Text with replacement characters'
  }
];

/**
 * Run cleaning examples and display results
 */
function runExamples() {
  console.log('\n📄 PDF Text Cleaning Examples\n');
  console.log('=' .repeat(80));
  
  PROBLEM_EXAMPLES.forEach(({ name, input, expected }, index) => {
    console.log(`\n${index + 1}. ${name}`);
    console.log('-'.repeat(80));
    console.log('Input:    ', JSON.stringify(input));
    
    const cleaned = sanitizeForPDF(input);
    console.log('Cleaned:  ', JSON.stringify(cleaned));
    console.log('Expected: ', JSON.stringify(expected));
    
    const matches = cleaned === expected;
    console.log('Status:   ', matches ? '✅ PASS' : '⚠️  DIFF');
    
    if (!matches) {
      console.log('Note: Output may vary slightly from expected');
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✨ All examples processed!\n');
}

/**
 * Clean user-provided text
 */
function cleanUserText(text) {
  console.log('\n📝 Cleaning provided text...\n');
  console.log('Original:');
  console.log(text);
  console.log('\n' + '-'.repeat(80));
  
  console.log('\n🧹 sanitizeForPDF():');
  console.log(sanitizeForPDF(text));
  
  console.log('\n🔄 cleanPDFExtraction():');
  console.log(cleanPDFExtraction(text));
  
  console.log('\n➡️  convertArrowsToASCII():');
  console.log(convertArrowsToASCII(text));
  
  console.log('\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Clean user-provided text
    const text = args.join(' ');
    cleanUserText(text);
  } else {
    // Run examples
    runExamples();
    
    console.log('\n💡 Tip: You can also clean specific text:');
    console.log('   node scripts/clean-pdf-text.js "your text here"');
    console.log('\n');
  }
}

// Run the script
main();

