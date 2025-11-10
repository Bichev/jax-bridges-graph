import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is required in .env file');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration from environment variables
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY) || 500;

// Log configuration (only in debug mode)
if (process.env.DEBUG_MODE === 'true') {
  console.log('🔧 OpenAI Configuration:');
  console.log(`   Model: ${MODEL}`);
  console.log(`   Temperature: ${TEMPERATURE}`);
  console.log(`   Max Tokens: ${MAX_TOKENS}`);
  console.log(`   Max Retries: ${MAX_RETRIES}`);
  console.log(`   Rate Limit Delay: ${RATE_LIMIT_DELAY}ms`);
}

/**
 * Call OpenAI API with retry logic and error handling
 * 
 * @param {Array} messages - Array of message objects
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} API response
 */
export const callOpenAI = async (messages, maxRetries = MAX_RETRIES) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" }
      });
      
      return response;
      
    } catch (error) {
      attempts++;
      
      if (error.status === 429) {
        // Rate limit hit - exponential backoff
        const waitTime = Math.pow(2, attempts) * 1000;
        console.warn(`⏳ Rate limit hit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } else if (error.status >= 500) {
        // Server error - retry
        console.warn(`⚠️  OpenAI server error, attempt ${attempts}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        // Client error - don't retry
        throw error;
      }
    }
  }
  
  throw new Error(`❌ Failed after ${maxRetries} attempts`);
};

/**
 * Get rate limit delay from environment
 * @returns {number} Delay in milliseconds
 */
export const getRateLimitDelay = () => {
  return RATE_LIMIT_DELAY;
};

/**
 * Build analysis prompt for relationship detection
 * @param {Object} bizA - First business
 * @param {Object} bizB - Second business
 * @returns {string} Formatted prompt
 */
export const buildAnalysisPrompt = (bizA, bizB) => {
  return `Analyze potential business relationships between these two Jacksonville businesses:

BUSINESS A:
Name: ${bizA.name}
Contact: ${bizA.contact_name}
Industry: ${bizA.industry}
Description: ${bizA.description}
Services: ${bizA.services}
Target Market: ${bizA.target_market}
Current Needs: ${bizA.current_needs}

BUSINESS B:
Name: ${bizB.name}
Contact: ${bizB.contact_name}
Industry: ${bizB.industry}
Description: ${bizB.description}
Services: ${bizB.services}
Target Market: ${bizB.target_market}
Current Needs: ${bizB.current_needs}

Evaluate ALL possible relationship types:
1. VENDOR: Could A provide services to B, or B to A? (directional)
2. PARTNER: Could they collaborate on joint offerings? (mutual)
3. REFERRAL: Do they serve similar customers without competing? (mutual)
4. COLLABORATION: Could they work together on projects/events? (mutual)
5. SUPPLY_CHAIN: Are their services sequential in a customer journey? (directional)

Return ONLY valid JSON with this exact structure:
{
  "relationships": [
    {
      "from": "Business A" or "Business B",
      "to": "Business A" or "Business B",
      "type": "vendor" | "partner" | "referral" | "collaboration" | "supply_chain",
      "confidence": 0-100 (integer),
      "reasoning": "2-3 sentences explaining WHY this relationship makes business sense",
      "value_prop": "Specific quantifiable benefit (revenue potential, cost savings, market access)",
      "collaboration_example": "A detailed, concrete example of how this partnership would work in practice. Include specific scenario, deliverables, and outcomes. Make it vivid and realistic (2-3 sentences).",
      "synergy_potential": "Specific description of the unique synergy between these two businesses - what makes THIS pairing special vs generic partnerships (1-2 sentences)",
      "action_items": [
        "Specific actionable step 1",
        "Specific actionable step 2",
        "Specific actionable step 3"
      ],
      "estimated_value": "high" | "medium" | "low"
    }
  ],
  "mutual_benefit": true or false
}

IMPORTANT:
- Only include relationships with confidence >= 50
- Be specific about value exchange and benefits
- Action items should be concrete, not generic advice
- collaboration_example MUST be a REAL, VIVID scenario (not generic statements)
- synergy_potential should highlight what makes THIS pairing UNIQUE
- Use real business scenarios that could happen next week
- If NO meaningful relationship exists (confidence < 50), return empty relationships array
- Focus on PRACTICAL, REVENUE-GENERATING partnerships

EXAMPLES OF GOOD collaboration_example:
✅ "JAX AI Agency could build a custom chatbot for Communikate Design's clients. For instance, a real estate client needs a 24/7 property inquiry bot. Communikate handles branding/design, JAX AI builds the AI backend, they split the $5K project fee, and both get portfolio pieces."
✅ "Jazzi's Creations hosts a team-building craft workshop at Bluebird Health Partners' quarterly company meeting. 25 employees create personalized mugs while networking. Jazzi earns $500, Bluebird gets employee engagement, both gain corporate client experience."

EXAMPLES OF BAD collaboration_example (too generic):
❌ "They could work together on projects and share clients."
❌ "Both businesses could benefit from collaboration."

Make every example VIVID, SPECIFIC, and ACTIONABLE!`;
};

/**
 * Parse AI response and extract relationships
 * @param {string} responseText - Raw AI response
 * @returns {Object} Parsed relationships object
 */
export const parseAIResponse = (responseText) => {
  try {
    // Clean up markdown code blocks if present
    let cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
      throw new Error('Invalid response structure: missing relationships array');
    }
    
    // Validate each relationship
    parsed.relationships.forEach((rel, idx) => {
      if (!rel.from || !rel.to || !rel.type || typeof rel.confidence !== 'number') {
        throw new Error(`Invalid relationship at index ${idx}: missing required fields`);
      }
      
      if (rel.confidence < 0 || rel.confidence > 100) {
        throw new Error(`Invalid confidence score at index ${idx}: ${rel.confidence}`);
      }
    });
    
    return parsed;
    
  } catch (error) {
    console.error('❌ Failed to parse AI response:', error.message);
    console.error('Raw response:', responseText.substring(0, 200) + '...');
    return { relationships: [], mutual_benefit: false };
  }
};

