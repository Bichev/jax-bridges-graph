#!/usr/bin/env node

import { parseBusinessesCSV } from './utils/csv-parser.js';
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
 * Incremental analysis - only analyze new businesses against existing ones
 */
const main = async () => {
  console.log('🔄 JAX Business Relationship Analyzer (INCREMENTAL MODE)\n');
  console.log('=' .repeat(50));
  
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  try {
    // Step 1: Load existing data
    console.log('\n📂 Step 1: Loading existing data...');
    
    if (!fs.existsSync(BUSINESSES_JSON_PATH) || !fs.existsSync(RELATIONSHIPS_JSON_PATH)) {
      console.error('\n❌ Error: Existing data not found. Run full analysis first:');
      console.error('   npm run analyze\n');
      process.exit(1);
    }
    
    const existingBusinesses = JSON.parse(fs.readFileSync(BUSINESSES_JSON_PATH, 'utf8'));
    const existingRelationships = JSON.parse(fs.readFileSync(RELATIONSHIPS_JSON_PATH, 'utf8'));
    
    console.log(`   ✅ Loaded ${existingBusinesses.length} existing businesses`);
    console.log(`   ✅ Loaded ${existingRelationships.length} existing relationships`);
    
    // Step 2: Parse CSV to find new businesses
    console.log('\n📊 Step 2: Checking for new businesses...');
    const allBusinesses = parseBusinessesCSV(CSV_PATH);
    
    const existingIds = new Set(existingBusinesses.map(b => b.id));
    const newBusinesses = allBusinesses.filter(b => !existingIds.has(b.id));
    
    if (newBusinesses.length === 0) {
      console.log('\n✅ No new businesses found. All businesses are up to date!');
      console.log('   To add new businesses, update businesses.csv and run this script again.\n');
      process.exit(0);
    }
    
    console.log(`\n🆕 Found ${newBusinesses.length} new business(es) to analyze:`);
    newBusinesses.forEach((biz, idx) => {
      console.log(`   ${idx + 1}. ${biz.name} (${biz.industry})`);
    });
    
    // Step 3: Analyze only new businesses against existing ones
    console.log(`\n🤖 Step 3: Analyzing new businesses...`);
    const totalPairs = newBusinesses.length * existingBusinesses.length;
    console.log(`Total pairs to analyze: ${totalPairs}`);
    
    const newRelationships = [];
    let analysisCount = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < newBusinesses.length; i++) {
      const newBiz = newBusinesses[i];
      console.log(`\n--- Analyzing new business: ${newBiz.name} ---`);
      
      for (let j = 0; j < existingBusinesses.length; j++) {
        const existingBiz = existingBusinesses[j];
        analysisCount++;
        
        try {
          console.log(`\n[${analysisCount}/${totalPairs}] Analyzing:`);
          console.log(`  📍 ${newBiz.name} <-> ${existingBiz.name}`);
          
          // Build prompt
          const prompt = buildAnalysisPrompt(newBiz, existingBiz);
          
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
              from_id: rel.from === 'Business A' ? newBiz.id : existingBiz.id,
              to_id: rel.to === 'Business A' ? newBiz.id : existingBiz.id,
              from_name: rel.from === 'Business A' ? newBiz.name : existingBiz.name,
              to_name: rel.to === 'Business A' ? newBiz.name : existingBiz.name,
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
            
            newRelationships.push(...transformedRelationships);
            console.log(`  ✅ Found ${transformedRelationships.length} relationship(s)`);
            transformedRelationships.forEach(rel => {
              console.log(`     ${rel.type.toUpperCase()}: ${rel.from_name} → ${rel.to_name} (${rel.confidence}%)`);
            });
          } else {
            console.log(`  ⚪ No strong relationships found`);
          }
          
          // Rate limiting
          const delay = getRateLimitDelay();
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (error) {
          console.error(`  ❌ Error analyzing ${newBiz.name} <-> ${existingBiz.name}:`, error.message);
        }
      }
    }
    
    // Step 4: Merge and save results
    console.log('\n💾 Step 4: Merging and saving results...');
    
    // Add new businesses to the businesses list
    const updatedBusinesses = [...existingBusinesses, ...newBusinesses];
    
    // Merge relationships (existing + new)
    const updatedRelationships = [...existingRelationships, ...newRelationships];
    
    // Save updated data
    fs.writeFileSync(
      BUSINESSES_JSON_PATH,
      JSON.stringify(updatedBusinesses, null, 2),
      'utf8'
    );
    
    fs.writeFileSync(
      RELATIONSHIPS_JSON_PATH,
      JSON.stringify(updatedRelationships, null, 2),
      'utf8'
    );
    
    // Summary statistics
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 Incremental Analysis Complete!\n');
    console.log(`✅ New businesses added: ${newBusinesses.length}`);
    console.log(`✅ Pairs evaluated: ${analysisCount}`);
    console.log(`✅ New relationships found: ${newRelationships.length}`);
    console.log(`✅ Duration: ${duration}s`);
    console.log(`✅ Total businesses: ${updatedBusinesses.length}`);
    console.log(`✅ Total relationships: ${updatedRelationships.length}`);
    
    if (newRelationships.length > 0) {
      console.log(`✅ Avg confidence (new): ${(newRelationships.reduce((sum, r) => sum + r.confidence, 0) / newRelationships.length).toFixed(1)}%`);
      
      // New relationship type breakdown
      const typeBreakdown = newRelationships.reduce((acc, rel) => {
        acc[rel.type] = (acc[rel.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 New Relationship Types:');
      Object.entries(typeBreakdown).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }
    
    console.log('\n✨ Updated data saved to:');
    console.log(`   ${BUSINESSES_JSON_PATH}`);
    console.log(`   ${RELATIONSHIPS_JSON_PATH}`);
    console.log('\n🎉 Ready to visualize! Run: npm run dev\n');
    
    // Cost estimate
    const estimatedInputTokens = analysisCount * 700;
    const estimatedOutputTokens = analysisCount * 700;
    const estimatedCost = (estimatedInputTokens / 1_000_000 * 0.15) + (estimatedOutputTokens / 1_000_000 * 0.60);
    
    console.log('💰 Estimated Cost:');
    console.log(`   API Calls: ${analysisCount}`);
    console.log(`   Est. Input Tokens: ${estimatedInputTokens.toLocaleString()}`);
    console.log(`   Est. Output Tokens: ${estimatedOutputTokens.toLocaleString()}`);
    console.log(`   Est. Total Cost: $${estimatedCost.toFixed(4)}\n`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
main();

