# 🔐 Environment Variables Reference

Quick reference for all environment variables used in the JAX Business Relationship Mapper.

---

## 📝 Required Variables

### `OPENAI_API_KEY`

**Required:** ✅ Yes  
**Type:** String  
**Format:** `sk-proj-xxxxxxxxxxxxx`  
**Example:** `sk-proj-abc123xyz789...`

Your OpenAI API key for AI analysis.

**How to get:**
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy immediately (won't be shown again)

**Setup:**
```bash
# In .env file
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

---

## ⚙️ Optional OpenAI Settings

### `OPENAI_MODEL`

**Required:** ❌ No  
**Default:** `gpt-4o`  
**Type:** String  
**Options:** `gpt-4o`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`

AI model for relationship analysis.

**Comparison:**
| Model | Quality | Speed | Cost per 27 biz |
|-------|---------|-------|-----------------|
| gpt-4o | ⭐⭐⭐⭐⭐ | Fast | ~$0.50-1.00 |
| gpt-4-turbo | ⭐⭐⭐⭐⭐ | Medium | ~$0.70-1.40 |
| gpt-4 | ⭐⭐⭐⭐ | Slow | ~$1.50-2.50 |
| gpt-3.5-turbo | ⭐⭐⭐ | Very Fast | ~$0.10-0.20 |

**Recommendation:** Use `gpt-4o` for best balance of quality, speed, and cost.

---

### `OPENAI_TEMPERATURE`

**Required:** ❌ No  
**Default:** `0.7`  
**Type:** Float  
**Range:** `0.0` to `2.0`

Controls AI creativity vs consistency.

**Guide:**
- `0.0-0.3`: Very deterministic, consistent
- `0.4-0.6`: Balanced, slightly conservative
- **`0.7-0.9`**: Balanced (recommended) ✅
- `1.0-1.5`: More creative, diverse
- `1.6-2.0`: Highly creative, less predictable

**Use Cases:**
```bash
# For consistent, focused analysis
OPENAI_TEMPERATURE=0.5

# For creative, diverse relationships
OPENAI_TEMPERATURE=1.0
```

---

### `OPENAI_MAX_TOKENS`

**Required:** ❌ No  
**Default:** `1000`  
**Type:** Integer  
**Range:** `500` to `4000`

Maximum tokens per API response.

**Guide:**
- `500-800`: Brief analysis, lower cost
- **`1000-1200`**: Standard detail (recommended) ✅
- `1500-2000`: Detailed analysis, higher cost
- `2000-4000`: Very detailed, expensive

**Impact:**
- Higher = More detailed reasoning and action items
- Higher = Higher API costs
- Too low = Incomplete responses

---

## 🔄 Retry & Rate Limiting Settings

### `MAX_RETRIES`

**Required:** ❌ No  
**Default:** `3`  
**Type:** Integer  
**Range:** `1` to `10`

Number of retry attempts on API failures.

**Use Cases:**
```bash
# Fast fail (development)
MAX_RETRIES=1

# Standard (production)
MAX_RETRIES=3

# Very persistent (unreliable network)
MAX_RETRIES=5
```

---

### `RETRY_DELAY`

**Required:** ❌ No  
**Default:** `1000`  
**Type:** Integer (milliseconds)  
**Range:** `500` to `10000`

Initial delay before retry. Uses exponential backoff.

**Example backoff sequence:**
- Attempt 1: 1000ms
- Attempt 2: 2000ms
- Attempt 3: 4000ms

---

### `RATE_LIMIT_DELAY`

**Required:** ❌ No  
**Default:** `500`  
**Type:** Integer (milliseconds)  
**Range:** `0` to `5000`

Delay between API requests to avoid rate limits.

**OpenAI Free Tier:** 3 requests/minute
**Recommended settings:**
```bash
# Free tier (safe)
RATE_LIMIT_DELAY=1000

# Paid tier (faster)
RATE_LIMIT_DELAY=500

# Aggressive (paid tier only)
RATE_LIMIT_DELAY=200
```

---

## 🎯 Analysis Configuration

### `MIN_CONFIDENCE_THRESHOLD`

**Required:** ❌ No  
**Default:** `50`  
**Type:** Integer  
**Range:** `0` to `100`

Minimum confidence score to include relationships.

**Guide:**
- `70-100`: Only high-confidence matches
- **`50-70`**: Balanced (recommended) ✅
- `30-50`: More relationships, some weak
- `0-30`: All relationships (noisy)

---

### `DEBUG_MODE`

**Required:** ❌ No  
**Default:** `false`  
**Type:** Boolean  
**Options:** `true`, `false`

Enable detailed console logging.

**When enabled, shows:**
- OpenAI configuration details
- Full API request/response data
- Detailed error traces
- Performance metrics

**Use Cases:**
```bash
# Normal operation
DEBUG_MODE=false

# Troubleshooting
DEBUG_MODE=true
```

---

## 📋 Configuration Presets

### Preset 1: Production (Recommended)

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
MAX_RETRIES=3
RATE_LIMIT_DELAY=500
MIN_CONFIDENCE_THRESHOLD=50
DEBUG_MODE=false
```

**Use for:** Normal production use
**Cost:** ~$0.50-1.00 per full analysis

---

### Preset 2: High Quality

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.5
OPENAI_MAX_TOKENS=1500
MAX_RETRIES=3
RATE_LIMIT_DELAY=500
MIN_CONFIDENCE_THRESHOLD=60
DEBUG_MODE=false
```

**Use for:** When you need best quality
**Cost:** ~$1.00-1.50 per full analysis

---

### Preset 3: Fast Testing

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=800
MAX_RETRIES=2
RATE_LIMIT_DELAY=300
MIN_CONFIDENCE_THRESHOLD=40
DEBUG_MODE=true
```

**Use for:** Development and testing
**Cost:** ~$0.10-0.20 per full analysis

---

### Preset 4: Rate Limited Account

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
MAX_RETRIES=5
RETRY_DELAY=2000
RATE_LIMIT_DELAY=2000
MIN_CONFIDENCE_THRESHOLD=50
DEBUG_MODE=false
```

**Use for:** Free tier or rate-limited accounts
**Cost:** Same as production, just slower

---

## 🛠️ How to Use

### 1. Copy Example File

```bash
cp .env.example .env
```

### 2. Edit Configuration

```bash
# Mac/Linux
nano .env

# Windows
notepad .env

# VS Code
code .env
```

### 3. Set Required Variables

Minimum setup:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 4. Test Configuration

```bash
# Test with sample data
npm run analyze:sample

# Check configuration is loaded
DEBUG_MODE=true npm run analyze:sample
```

---

## ✅ Validation

The application automatically validates:

✅ `OPENAI_API_KEY` exists  
✅ `OPENAI_API_KEY` format is valid  
✅ Numeric values are in valid ranges  
✅ Model name is supported

**Validation errors show helpful messages:**
```
❌ Error: OPENAI_API_KEY not found in environment variables

📝 Setup Instructions:
   1. Copy the example file: cp .env.example .env
   2. Edit .env and add your OpenAI API key
   3. Get a key at: https://platform.openai.com/api-keys
```

---

## 🔒 Security Checklist

Before deploying:

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has NO real keys
- [ ] Real keys are in `.env` (not `.env.example`)
- [ ] Different keys for dev/staging/prod
- [ ] API keys have usage limits set
- [ ] Team members have their own keys
- [ ] Keys are rotated periodically

---

## 📚 Related Documentation

- **[ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md)** - Detailed setup guide
- **[SETUP.md](./SETUP.md)** - General installation guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast setup (2 min)
- **[README.md](./README.md)** - Project overview

---

**Built with ❤️ by JAX AI Agency** 🍞

