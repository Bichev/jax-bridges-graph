#!/usr/bin/env node

import { parseBusinessesCSV, saveBusinessesToJSON } from './utils/csv-parser.js';
import { callOpenAI, buildAnalysisPrompt, parseAIResponse, getRateLimitDelay } from './utils/openai-client.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const DATA_DIR = path.join(__dirname, '../data');
const CSV_PATH = path.join(DATA_DIR, 'businesses.csv');
const BUSINESSES_JSON_PATH = path.join(DATA_DIR, 'businesses.json');
const RELATIONSHIPS_JSON_PATH = path.join(DATA_DIR, 'relationships.json');

/**
 * Main analysis workflow
 */
const main = async () => {
  console.log('🚀 JAX Business Relationship Analyzer\n');
  console.log('=' .repeat(50));
  
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY not found in environment variables');
    console.error('\n📝 Setup Instructions:');
    console.error('   1. Copy the example file: cp .env.example .env');
    console.error('   2. Edit .env and add your OpenAI API key');
    console.error('   3. Get a key at: https://platform.openai.com/api-keys\n');
    process.exit(1);
  }
  
  // Log configuration
  console.log('\n⚙️  Configuration:');
  console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-4o'}`);
  console.log(`   Temperature: ${process.env.OPENAI_TEMPERATURE || '0.7'}`);
  console.log(`   Max Tokens: ${process.env.OPENAI_MAX_TOKENS || '1000'}`);
  console.log(`   Max Retries: ${process.env.MAX_RETRIES || '3'}`);
  
  try {
    // Step 1: Parse CSV
    console.log('\n📊 Step 1: Parsing business data...');
    const businesses = parseBusinessesCSV(CSV_PATH);
    saveBusinessesToJSON(businesses, BUSINESSES_JSON_PATH);
    
    // Check for sample flag
    const sampleArg = process.argv.find(arg => arg.startsWith('--sample='));
    const sampleSize = sampleArg ? parseInt(sampleArg.split('=')[1]) : null;
    
    const businessesToAnalyze = sampleSize 
      ? businesses.slice(0, sampleSize)
      : businesses;
    
    if (sampleSize) {
      console.log(`\n🔬 Running in SAMPLE mode: analyzing ${sampleSize} businesses`);
    }
    
    // Step 2: Analyze relationships
    console.log(`\n🤖 Step 2: Analyzing relationships with AI...`);
    console.log(`Total pairs to analyze: ${businessesToAnalyze.length * (businessesToAnalyze.length - 1) / 2}`);
    
    const relationships = [];
    let analysisCount = 0;
    let totalPairs = 0;
    let skippedPairs = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < businessesToAnalyze.length; i++) {
      for (let j = i + 1; j < businessesToAnalyze.length; j++) {
        totalPairs++;
        const bizA = businessesToAnalyze[i];
        const bizB = businessesToAnalyze[j];
        
        // Skip if somehow the same business (safety check)
        if (bizA.id === bizB.id) {
          console.log(`\n⚠️  Skipping self-relationship: ${bizA.name}`);
          skippedPairs++;
          continue;
        }
        
        try {
          console.log(`\n[${totalPairs}/${businessesToAnalyze.length * (businessesToAnalyze.length - 1) / 2}] Analyzing:`);
          console.log(`  📍 ${bizA.name} <-> ${bizB.name}`);
          
          // Build prompt
          const prompt = buildAnalysisPrompt(bizA, bizB);
          
          // Call OpenAI
          const response = await callOpenAI([
            {
              role: 'system',
              content: 'You are an expert business consultant specializing in identifying strategic partnership opportunities. Analyze business profiles and return structured JSON data about potential relationships.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]);
          
          // Parse response
          const result = parseAIResponse(response.choices[0].message.content);
          
          if (result.relationships && result.relationships.length > 0) {
            // Transform relationships with proper IDs
            const transformedRelationships = result.relationships.map(rel => ({
              from_id: rel.from === 'Business A' ? bizA.id : bizB.id,
              to_id: rel.to === 'Business A' ? bizA.id : bizB.id,
              from_name: rel.from === 'Business A' ? bizA.name : bizB.name,
              to_name: rel.to === 'Business A' ? bizA.name : bizB.name,
              type: rel.type,
              confidence: rel.confidence,
              reasoning: rel.reasoning,
              value_prop: rel.value_prop,
              collaboration_example: rel.collaboration_example || 'No specific example provided',
              synergy_potential: rel.synergy_potential || 'Complementary business synergy',
              action_items: rel.action_items,
              estimated_value: rel.estimated_value,
              mutual_benefit: result.mutual_benefit
            }));
            
            // Filter out any self-relationships (safety check)
            const validRelationships = transformedRelationships.filter(rel => {
              if (rel.from_id === rel.to_id) {
                console.log(`  ⚠️  Filtered out invalid self-relationship for ${rel.from_name}`);
                return false;
              }
              return true;
            });
            
            relationships.push(...validRelationships);
            console.log(`  ✅ Found ${validRelationships.length} valid relationship(s)`);
            if (transformedRelationships.length !== validRelationships.length) {
              console.log(`  ⚠️  Filtered out ${transformedRelationships.length - validRelationships.length} invalid relationship(s)`);
            }
            validRelationships.forEach(rel => {
              console.log(`     ${rel.type.toUpperCase()}: ${rel.from_name} → ${rel.to_name} (${rel.confidence}%)`);
            });
          } else {
            console.log(`  ⚪ No strong relationships found`);
          }
          
          analysisCount++;
          
          // Rate limiting: delay between requests (from .env)
          const delay = getRateLimitDelay();
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (error) {
          console.error(`  ❌ Error analyzing ${bizA.name} <-> ${bizB.name}:`, error.message);
          // Continue with next pair
        }
      }
    }
    
    // Step 3: Save results
    console.log('\n💾 Step 3: Saving results...');
    
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(
      RELATIONSHIPS_JSON_PATH,
      JSON.stringify(relationships, null, 2),
      'utf8'
    );
    
    // Summary statistics
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 Analysis Complete!\n');
    console.log(`✅ Businesses analyzed: ${businessesToAnalyze.length}`);
    console.log(`✅ Pairs evaluated: ${analysisCount}`);
    console.log(`✅ Relationships found: ${relationships.length}`);
    if (skippedPairs > 0) {
      console.log(`⚠️  Skipped pairs: ${skippedPairs} (same business)`);
    }
    console.log(`✅ Duration: ${duration}s`);
    console.log(`✅ Avg confidence: ${(relationships.reduce((sum, r) => sum + r.confidence, 0) / relationships.length || 0).toFixed(1)}%`);
    
    // Relationship type breakdown
    const typeBreakdown = relationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Relationship Types:');
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n✨ Data saved to:');
    console.log(`   ${BUSINESSES_JSON_PATH}`);
    console.log(`   ${RELATIONSHIPS_JSON_PATH}`);
    console.log('\n🎉 Ready to visualize! Run: npm run dev\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
main();

