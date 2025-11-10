# Quick Cost Reference

> **TL;DR**: For most use cases, incremental updates are the way to go!

## Quick Price List (GPT-4o-mini)

### Full Analysis

| Businesses | Cost | Time | Action |
|------------|------|------|--------|
| 20 | $0.10 | 10 min | ✅ Go for it |
| 50 | $0.64 | 1 hour | ✅ Reasonable |
| 100 | $2.60 | 4 hours | ✅ Still good |
| 200 | $10.45 | 16 hours | ⚠️ Consider batching |
| 500 | $65.50 | 4 days | ⚠️ Use incremental instead |
| 1000 | $262 | 17 days | ❌ Don't do this |

### Adding 1 New Business

| To Network Of | Cost | Time |
|---------------|------|------|
| 20 | $0.01 | 1 min |
| 50 | $0.03 | 2 min |
| 100 | $0.05 | 5 min |
| 200 | $0.11 | 10 min |
| 500 | $0.26 | 25 min |
| 1000 | $0.53 | 50 min |

## Commands

```bash
# First time - full analysis
npm run analyze

# Test with 10 businesses first
npm run analyze -- --sample=10

# Add new businesses (after updating CSV)
npm run analyze:incremental
```

## Best Practices

1. **Start small**: Test with `--sample=10` first
2. **Go incremental**: Use `analyze:incremental` for updates
3. **Never re-run full**: Unless you change the analysis logic
4. **Monitor costs**: Check https://platform.openai.com/usage

## Example Workflows

### Workflow 1: Starting Fresh
```bash
# 1. Add 20 businesses to businesses.csv
# 2. Run analysis
npm run analyze
# Cost: $0.10, Time: 10 minutes

# 3. Later, add 5 more businesses to CSV
# 4. Run incremental
npm run analyze:incremental
# Cost: $0.05, Time: ~5 minutes
```

### Workflow 2: Large Initial Batch
```bash
# 1. Start with 100 businesses
npm run analyze
# Cost: $2.60, Time: 4 hours (run overnight)

# 2. Weekly additions (assume 10 new per week)
npm run analyze:incremental
# Cost per week: $0.50, Time: ~50 minutes
# Monthly cost: ~$2.00 for updates vs $10+ for full re-runs
```

## ROI Calculation

**Time Saved**: Each relationship identified saves ~30 minutes of manual research.

**Example**: 
- Network of 50 businesses
- Full analysis: $0.64, finds ~125 relationships
- Value: 125 × 30 min = 62.5 hours saved
- Hourly rate: $50/hour → **$3,125 value for $0.64 cost**
- ROI: ~488,000% 🚀

## Questions?

See full details: [ANALYSIS-COSTS.md](./ANALYSIS-COSTS.md)

