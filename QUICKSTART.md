# ⚡ Quick Start - Get Running in 2 Minutes

## Prerequisites
- Node.js 18+ installed
- OpenAI API key ready

## Three Simple Commands

### 1️⃣ Install
```bash
npm install
```

### 2️⃣ Configure
```bash
# Create .env file and add your OpenAI API key
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

### 3️⃣ Run Analysis (Optional for testing)
```bash
# Quick test with 5 businesses (~1 minute)
npm run analyze:sample

# OR full analysis with all businesses (~10 minutes)
npm run analyze
```

### 4️⃣ Start App
```bash
npm run dev
```

🎉 **Done!** Open http://localhost:3000

---

## What You'll See

- **3D Network Graph** - All businesses visualized as connected nodes
- **Click Any Node** - View detailed partnership opportunities
- **Sidebar Filters** - Focus on specific relationship types
- **AI Insights** - Confidence scores, reasoning, and action items

---

## Next Steps

- 📖 Read [SETUP.md](./SETUP.md) for detailed instructions
- 🎨 Customize brand colors in `tailwind.config.js`
- 📊 Replace sample data with your own in `data/businesses.csv`
- 🚀 Deploy to Vercel with `vercel --prod`

---

**Need help?** Email hi@jaxaiagency.com or check the full documentation!

Built with ❤️ by JAX AI Agency 🍞

