# 🔧 Environment Variables Setup Guide

## Quick Setup (2 Minutes)

### Step 1: Copy the Example File

```bash
cp .env.example .env
```

### Step 2: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in (or create a free account)
3. Click "Create new secret key"
4. Give it a name (e.g., "JAX Bridges Mapper")
5. **Copy the key immediately** (you won't see it again!)

### Step 3: Add Your API Key to .env

Open the `.env` file and replace the placeholder:

```bash
# Before:
OPENAI_API_KEY=your_openai_api_key_here

# After (with your real key):
OPENAI_API_KEY=sk-proj-abc123xyz...
```

### Step 4: Test It!

```bash
npm run analyze:sample
```

✅ If you see the analysis running, you're all set!

---

## 📋 All Available Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-abc123...` |

### Optional OpenAI Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_MODEL` | `gpt-4o` | AI model to use |
| `OPENAI_TEMPERATURE` | `0.7` | Creativity level (0-2) |
| `OPENAI_MAX_TOKENS` | `1000` | Max response length |

### Optional Performance Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_RETRIES` | `3` | Retry attempts on failures |
| `RETRY_DELAY` | `1000` | Initial retry delay (ms) |
| `RATE_LIMIT_DELAY` | `500` | Delay between requests (ms) |

### Optional Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `MIN_CONFIDENCE_THRESHOLD` | `50` | Minimum confidence score |
| `DEBUG_MODE` | `false` | Enable debug logging |

---

## 🎨 Configuration Examples

### For Best Quality (Higher Cost)

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.5
OPENAI_MAX_TOKENS=1500
```

**Use when:** You want the most accurate, detailed relationships
**Cost:** ~$1.00-1.50 for 27 businesses

### For Fast Testing (Lower Cost)

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=800
```

**Use when:** Testing, development, or tight budget
**Cost:** ~$0.10-0.20 for 27 businesses

### For Rate Limited Accounts

```bash
OPENAI_API_KEY=sk-proj-your-key
RATE_LIMIT_DELAY=2000
MAX_RETRIES=5
RETRY_DELAY=2000
```

**Use when:** You hit rate limits frequently
**Effect:** Slower but more reliable

### For Debug/Development

```bash
OPENAI_API_KEY=sk-proj-your-key
DEBUG_MODE=true
MIN_CONFIDENCE_THRESHOLD=40
```

**Use when:** Debugging issues or seeing more relationships
**Effect:** More logging, lower confidence threshold

---

## 💰 Cost Calculator

### By Model

| Model | Cost per 1K tokens | Avg per relationship | 27 businesses |
|-------|-------------------|---------------------|---------------|
| gpt-4o | $0.03 | $0.015 | **~$0.50-1.00** |
| gpt-4-turbo | $0.04 | $0.020 | **~$0.70-1.40** |
| gpt-3.5-turbo | $0.002 | $0.001 | **~$0.03-0.10** |

### Calculation

- **27 businesses** = 351 pairs to analyze
- Each pair requires ~1,500-2,000 tokens
- Total: ~525,000-700,000 tokens

**Recommendation:** Start with gpt-4o for best results

---

## 🔒 Security Best Practices

### ✅ DO

- ✅ Keep `.env` file in `.gitignore`
- ✅ Never commit `.env` to Git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically
- ✅ Monitor usage on OpenAI dashboard

### ❌ DON'T

- ❌ Share your `.env` file
- ❌ Commit API keys to GitHub
- ❌ Use production keys in development
- ❌ Hard-code API keys in source files
- ❌ Share keys in screenshots or docs

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY not found"

**Solution:**
```bash
# Check if .env file exists
ls -la .env

# If not, create it
cp .env.example .env

# Edit it with your key
nano .env  # or use your favorite editor
```

### "Invalid API key"

**Possible Issues:**
1. Key was copied incorrectly (check for extra spaces)
2. Key was revoked or expired
3. File encoding issue (should be UTF-8)

**Solution:**
```bash
# Generate a new key at platform.openai.com
# Copy it carefully (no spaces at start/end)
# Update .env file
```

### "Rate limit exceeded"

**Solution 1:** Increase delay
```bash
RATE_LIMIT_DELAY=2000  # 2 seconds instead of 0.5
```

**Solution 2:** Use paid OpenAI tier
- Go to https://platform.openai.com/account/billing
- Add payment method
- Higher rate limits automatically apply

### Environment variables not loading

**Solution:**
```bash
# Make sure dotenv is installed
npm install dotenv

# Check .env is in project root (not in subdirectory)
pwd
ls -la .env

# Try with explicit path
DOTENV_CONFIG_PATH=.env npm run analyze:sample
```

---

## 📊 Monitoring Usage

### Check Your OpenAI Costs

1. Go to https://platform.openai.com/usage
2. View usage by day/week/month
3. Set budget alerts
4. Monitor per-model costs

### Track Application Costs

The analysis script logs:
```
✅ Pairs evaluated: 351
✅ Duration: 487s
```

**Calculate cost:**
- Pairs × $0.015 (avg per pair with gpt-4o)
- 351 × $0.015 = **~$5.27** (worst case)
- Actual cost usually lower due to caching

---

## 🎯 Quick Reference Card

```bash
# Basic Setup
cp .env.example .env          # Create config
# Edit .env with your API key
npm run analyze:sample        # Test (5 businesses)
npm run analyze              # Full run (27 businesses)

# Check Configuration
cat .env                     # View settings
DEBUG_MODE=true npm run analyze:sample  # See detailed logs

# Cost Optimization
OPENAI_MODEL=gpt-3.5-turbo   # Cheaper model
OPENAI_MAX_TOKENS=800        # Shorter responses

# Performance Tuning
RATE_LIMIT_DELAY=2000        # Slower but safer
MAX_RETRIES=5                # More persistent
```

---

## ✅ Verification Checklist

Before running the full analysis:

- [ ] `.env` file exists in project root
- [ ] `OPENAI_API_KEY` is set with valid key
- [ ] Tested with `npm run analyze:sample`
- [ ] No errors in console
- [ ] OpenAI dashboard shows usage
- [ ] Budget alert set (optional but recommended)

---

## 🆘 Still Need Help?

1. **Check the logs** - They usually tell you what's wrong
2. **Read SETUP.md** - Comprehensive troubleshooting guide
3. **Check OpenAI status** - https://status.openai.com
4. **Email us** - hi@jaxaiagency.com

---

**Built with ❤️ by JAX AI Agency** 🍞

