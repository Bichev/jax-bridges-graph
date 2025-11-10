# Business Relationship Analysis - Cost & Time Guide

## Overview

This document provides detailed cost and time estimates for analyzing business relationships at different scales using the JAX Bridges Network analyzer.

## Current Configuration

- **AI Model**: `gpt-4o-mini`
- **Token Limits**: 1,000 max output tokens per API call
- **Rate Limiting**: 500ms delay between API calls (configurable via `RATE_LIMIT_DELAY`)
- **Retry Logic**: 3 attempts with exponential backoff

## Pricing (GPT-4o-mini)

| Token Type | Cost per 1M tokens |
|------------|-------------------|
| Input | $0.15 |
| Cached Input | $0.075 |
| Output | $0.60 |

> Note: First-time analysis uses standard input pricing. Subsequent re-analyses of the same businesses may benefit from prompt caching (50% discount on input tokens).

## Token Usage Estimates

Based on current prompt structure:

- **System Message**: ~50 tokens
- **User Prompt (per business pair)**: ~650-750 tokens
  - Business A details: ~250 tokens
  - Business B details: ~250 tokens
  - Instructions & examples: ~200 tokens
- **Average Output Response**: ~600-800 tokens (detailed relationship analysis with examples)

**Conservative Estimates Used:**
- **Input**: 700 tokens per API call
- **Output**: 700 tokens per API call

---

## Full Analysis Costs

Full analysis uses **pairwise comparison**: Every business is compared with every other business.

**Formula**: For `n` businesses, total API calls = `n × (n-1) / 2`

### Cost & Time Breakdown

| Businesses | API Calls | Input Cost | Output Cost | **Total Cost** | Estimated Time* | Practical? |
|------------|-----------|------------|-------------|----------------|-----------------|------------|
| **20** | 190 | $0.02 | $0.08 | **$0.10** | ~10 minutes | ✅ Excellent |
| **50** | 1,225 | $0.13 | $0.51 | **$0.64** | ~1 hour | ✅ Good |
| **100** | 4,950 | $0.52 | $2.08 | **$2.60** | ~4 hours | ✅ Acceptable |
| **200** | 19,900 | $2.09 | $8.36 | **$10.45** | ~16 hours | ⚠️ Slow |
| **500** | 124,750 | $13.10 | $52.40 | **$65.50** | ~104 hours (~4 days) | ⚠️ Very Slow |
| **1,000** | 499,500 | $52.45 | $209.79 | **$262.24** | ~416 hours (~17 days) | ❌ Impractical |
| **10,000** | 49,995,000 | $5,249.48 | $20,997.90 | **$26,247.38** | ~1,735 days (~5 years) | ❌ Not Feasible |

*\*Time estimates include API response time (~2-3 seconds) + rate limit delay (500ms). Actual time may vary based on OpenAI API performance.*

### Detailed Calculations

#### 20 Businesses
```
API Calls: 20 × 19 / 2 = 190
Input Tokens: 190 × 700 = 133,000 tokens (0.133M)
Output Tokens: 190 × 700 = 133,000 tokens (0.133M)
Input Cost: 0.133M × $0.15 = $0.02
Output Cost: 0.133M × $0.60 = $0.08
Total Cost: $0.10
Time: 190 calls × 3 seconds = ~10 minutes
```

#### 100 Businesses
```
API Calls: 100 × 99 / 2 = 4,950
Input Tokens: 4,950 × 700 = 3,465,000 tokens (3.465M)
Output Tokens: 4,950 × 700 = 3,465,000 tokens (3.465M)
Input Cost: 3.465M × $0.15 = $0.52
Output Cost: 3.465M × $0.60 = $2.08
Total Cost: $2.60
Time: 4,950 calls × 3 seconds = ~4 hours
```

---

## Incremental Analysis (Adding New Business)

When adding **one new business** to an existing network, only that business needs to be compared against all existing businesses.

**Formula**: For 1 new business added to `n` existing businesses, API calls = `n`

### Cost & Time for Adding 1 Business

| Existing Businesses | API Calls Needed | Input Cost | Output Cost | **Total Cost** | Estimated Time |
|---------------------|------------------|------------|-------------|----------------|----------------|
| **20** | 20 | $0.002 | $0.008 | **$0.01** | ~1 minute | ✅ |
| **50** | 50 | $0.005 | $0.021 | **$0.03** | ~2.5 minutes | ✅ |
| **100** | 100 | $0.011 | $0.042 | **$0.05** | ~5 minutes | ✅ |
| **200** | 200 | $0.021 | $0.084 | **$0.11** | ~10 minutes | ✅ |
| **500** | 500 | $0.053 | $0.210 | **$0.26** | ~25 minutes | ✅ |
| **1,000** | 1,000 | $0.105 | $0.420 | **$0.53** | ~50 minutes | ✅ |
| **5,000** | 5,000 | $0.525 | $2.10 | **$2.63** | ~4 hours | ⚠️ |
| **10,000** | 10,000 | $1.05 | $4.20 | **$5.25** | ~8 hours | ⚠️ |

**Key Insight**: Incremental analysis is **highly efficient** - you can easily add new businesses to networks of up to 1,000 businesses for under $1 and in under an hour.

### Example: Adding 10 New Businesses to 100 Existing

```
Each new business: 100 API calls
Total for 10: 10 × 100 = 1,000 API calls

Input Tokens: 1,000 × 700 = 700,000 tokens (0.7M)
Output Tokens: 1,000 × 700 = 700,000 tokens (0.7M)
Input Cost: 0.7M × $0.15 = $0.11
Output Cost: 0.7M × $0.60 = $0.42
Total Cost: $0.53
Time: 1,000 calls × 3 seconds = ~50 minutes
```

---

## Optimization Strategies

### 1. Use Incremental Analysis (Recommended)

Instead of re-analyzing the entire network when adding businesses:

```bash
# Step 1: Full analysis of initial batch
npm run analyze

# Step 2: When adding new businesses, only analyze new ones
npm run analyze:incremental
```

**Savings Example**: Adding 10 businesses to a network of 100
- **Without optimization**: Re-analyze 110 businesses = 5,995 API calls = **$3.14**
- **With incremental**: Only analyze 10 new × 100 existing = 1,000 calls = **$0.53**
- **Savings**: $2.61 (83% reduction)

### 2. Use Sample Testing

Before running expensive full analyses, test with a sample:

```bash
# Analyze just 5 businesses to test
npm run analyze -- --sample=5

# Or 10 businesses
npm run analyze -- --sample=10
```

**Use Case**: Validate your business data quality before committing to full analysis.

### 3. Adjust Rate Limiting

For faster processing (if OpenAI API limits allow), reduce the delay:

```bash
# In .env file
RATE_LIMIT_DELAY=200  # Faster (from default 500ms)
```

**Trade-off**: Lower delay = faster completion but higher risk of hitting rate limits.

### 4. Batch Processing

For very large datasets (500+ businesses), consider batching:

```bash
# Process businesses 0-100
npm run analyze -- --start=0 --end=100

# Process businesses 100-200
npm run analyze -- --start=100 --end=200
```

This allows you to pause and resume large analyses.

### 5. Use Confidence Filtering

Set a higher minimum confidence threshold to reduce noise:

```javascript
// In the analysis script, only save relationships with confidence >= 60
if (rel.confidence >= 60) {
  relationships.push(rel);
}
```

This reduces storage and improves UX without increasing costs.

---

## Recommended Approach by Scale

### Small Networks (< 50 businesses)
- **Strategy**: Full analysis, re-run as needed
- **Cost**: < $1 per run
- **Time**: < 1 hour
- **Frequency**: Can afford to re-analyze weekly

### Medium Networks (50-200 businesses)
- **Strategy**: Full analysis initially, then incremental for new businesses
- **Initial Cost**: $0.64 - $10.45
- **Incremental Cost**: $0.03 - $0.11 per business
- **Update Frequency**: Full re-analysis monthly, incremental daily/weekly

### Large Networks (200-1,000 businesses)
- **Strategy**: Full analysis quarterly, incremental for all additions
- **Initial Cost**: $10.45 - $262.24
- **Incremental Cost**: $0.11 - $0.53 per business
- **Important**: Never re-run full analysis unless data structure changes

### Enterprise Networks (1,000+ businesses)
- **Strategy**: Custom batching + incremental only
- **Initial Cost**: $262+ (one-time investment)
- **Incremental Cost**: $0.53 - $5.25 per business
- **Important**: Consider alternative architectures (graph databases, clustering)

---

## Running Analysis Commands

### Full Analysis

```bash
# Analyze all businesses in businesses.csv
npm run analyze

# Analyze a sample (testing)
npm run analyze -- --sample=10
```

### Configuration

Edit `.env` file to customize:

```bash
# Model selection
OPENAI_MODEL=gpt-4o-mini

# Performance tuning
OPENAI_MAX_TOKENS=1000          # Max output per call
RATE_LIMIT_DELAY=500            # Milliseconds between calls
MAX_RETRIES=3                    # Retry attempts on failure

# Analysis parameters
OPENAI_TEMPERATURE=0.7           # Creativity vs consistency (0-1)
```

### Monitoring Progress

The script outputs real-time progress:

```
[150/190] Analyzing:
  📍 JAX AI Agency <-> Creative Marketing Co.
  ✅ Found 2 valid relationship(s)
     VENDOR: JAX AI Agency → Creative Marketing Co. (85%)
     REFERRAL: Creative Marketing Co. → JAX AI Agency (72%)
```

### Understanding Output

After completion, you'll see:

```
📈 Analysis Complete!

✅ Businesses analyzed: 20
✅ Pairs evaluated: 190
✅ Relationships found: 47
✅ Duration: 563.25s
✅ Avg confidence: 74.5%

📊 Relationship Types:
   vendor: 12
   partner: 8
   referral: 18
   collaboration: 7
   supply_chain: 2
```

---

## Cost Optimization Tips

1. **Start small**: Test with 10-20 businesses before scaling
2. **Use incremental updates**: Never re-analyze unchanged business pairs
3. **Leverage prompt caching**: OpenAI may cache repeated prompts (50% input discount)
4. **Adjust temperature**: Lower temperature (0.3-0.5) = more deterministic, potentially shorter responses
5. **Filter by confidence**: Only process high-confidence relationships (saves frontend processing)
6. **Batch API calls**: Process multiple pairs in a single prompt (requires prompt restructuring)

---

## Error Handling & Retry Costs

The script includes automatic retry logic:

- **Rate Limits (429)**: Exponential backoff (2s, 4s, 8s)
- **Server Errors (5xx)**: 3 retry attempts
- **Client Errors (4xx)**: No retry (fix data/config)

**Cost Impact**: Failed calls that retry successfully incur full API costs. However, the script is designed to fail gracefully and continue with remaining pairs.

---

## API Key & Security

Your OpenAI API key is stored in `.env` (never committed to Git):

```bash
OPENAI_API_KEY=sk-proj-...
```

**Important**: 
- Keep your `.env` file secure
- Never share or commit your API key
- Monitor usage at: https://platform.openai.com/usage

---

## Questions & Support

For questions about costs, performance, or optimization:

1. Check OpenAI Pricing: https://openai.com/pricing
2. Monitor API Usage: https://platform.openai.com/usage
3. Review script logs for detailed timing information
4. Adjust `.env` configuration based on your needs

---

## Summary Table

| Scale | Initial Cost | Cost Per New Business | Recommended Strategy |
|-------|--------------|----------------------|---------------------|
| 20 businesses | $0.10 (10 min) | $0.01 (1 min) | Full re-runs OK |
| 50 businesses | $0.64 (1 hr) | $0.03 (2 min) | Full + incremental |
| 100 businesses | $2.60 (4 hrs) | $0.05 (5 min) | Incremental only |
| 200 businesses | $10.45 (16 hrs) | $0.11 (10 min) | Incremental only |
| 500 businesses | $65.50 (4 days) | $0.26 (25 min) | Batch + incremental |
| 1,000 businesses | $262.24 (17 days) | $0.53 (50 min) | One-time + incremental |

**Bottom Line**: The incremental approach makes this system **scalable and cost-effective** for networks of any practical size.

