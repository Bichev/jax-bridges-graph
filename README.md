# JAX Business Relationship Mapper

> AI-powered tool that automatically analyzes business profiles and identifies meaningful partnership opportunities for the JAX Bridges cohort.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🤖 AI-Powered Analysis** - OpenAI GPT-4o analyzes business profiles to detect vendor, partner, referral, collaboration, and supply chain opportunities
- **💡 Real Partnership Examples** - ✨ **NEW!** Every relationship includes vivid, concrete scenarios showing exactly how partnerships would work in practice
- **🌟 Unique Synergy Insights** - ✨ **NEW!** AI identifies what makes each pairing special and valuable beyond generic partnerships
- **🌐 3D Network Visualization** - Interactive force-directed graph showing all business relationships with enhanced tooltips
- **📊 Smart Insights** - Confidence scores, reasoning, value propositions, and actionable next steps for each relationship
- **🎯 Personalized Reports** - Click any business to see their top partnership opportunities ranked by potential value
- **📈 Network Analytics** - Summary statistics and relationship breakdowns for the entire cohort

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd jax-bridges-graph

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Usage

```bash
# 1. Run AI analysis on business data (first time setup)
npm run analyze

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
jax-bridges-graph/
├── data/
│   ├── businesses.csv          # Input: Business profiles
│   ├── businesses.json         # Processed business data
│   └── relationships.json      # AI-generated relationships
│
├── scripts/
│   ├── analyze-relationships.js    # Main analysis CLI
│   └── utils/
│       ├── csv-parser.js           # CSV parsing utilities
│       └── openai-client.js        # OpenAI API wrapper
│
├── src/
│   ├── components/
│   │   ├── BusinessGraph3D.jsx     # 3D network graph
│   │   ├── BusinessDetailPanel.jsx # Detail view & reports
│   │   ├── NetworkStats.jsx        # Analytics dashboard
│   │   ├── Header.jsx              # App header
│   │   └── index.js                # Component exports
│   │
│   ├── utils/
│   │   ├── graph-builder.js        # Graph data transformer
│   │   ├── formatters.js           # Data formatters
│   │   └── constants.js            # App constants
│   │
│   ├── hooks/
│   │   ├── useGraphData.js         # Graph data hook
│   │   └── useBusinessFilter.js    # Filter hook
│   │
│   ├── styles/
│   │   └── index.css               # Global styles
│   │
│   ├── App.jsx                     # Root component
│   └── main.jsx                    # Entry point
│
├── .env.example                    # Environment template
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Visualization:** react-force-graph-3d, Three.js
- **AI Analysis:** OpenAI GPT-4o
- **Deployment:** Vercel
- **Data Processing:** Node.js, PapaParse

## 📝 Data Format

### Input CSV Format

The `data/businesses.csv` file should contain these columns:

| Column | Description |
|--------|-------------|
| Name | Contact person name |
| Company / Brand Name | Business name |
| Your Product or Service in one sentence | Brief description |
| Business Website | Company website URL |
| Your Ideal Client / Target Market | Target audience |
| Your current need | Capital, marketing, legal, tech, etc. |
| Contact EMAIL | Contact email |
| Contact Phone | Phone number (optional) |
| LinkedIn Profile URL | LinkedIn URL (optional) |

### Output Format

**businesses.json** - Parsed and structured business profiles with UUIDs

**relationships.json** - AI-detected relationships with:
- Relationship type (vendor, partner, referral, collaboration, supply_chain)
- Confidence score (0-100)
- Reasoning and value proposition
- **💡 Collaboration examples** - Real scenarios of how partnerships work ✨ **NEW!**
- **🌟 Synergy potential** - What makes each pairing unique ✨ **NEW!**
- Actionable next steps
- Estimated value tier

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Analysis Options

Run analysis with custom parameters:

```bash
# Analyze only first 5 businesses (for testing)
npm run analyze:sample

# Full analysis with all businesses
npm run analyze
```

## 🎯 Usage Guide

1. **Explore the Network** - The 3D graph shows all businesses as nodes connected by relationship lines
2. **Click a Business** - See detailed partnership opportunities for that business
3. **Review Insights** - Read AI-generated reasoning and specific action items
4. **Filter Results** - Use filters to focus on specific relationship types or confidence levels
5. **Take Action** - Contact potential partners using provided email/phone information

## 🤝 Contributing

This is a POC (Proof of Concept) project. For questions or suggestions, contact:

**Vlad - JAX AI Agency**
- Email: hi@jaxaiagency.com
- Website: https://jaxaiagency.com
- LinkedIn: linkedin.com/in/bichev

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- JAX Bridges program and cohort members
- OpenAI for GPT-4 API
- Jacksonville entrepreneurial community

---

**Built with ❤️ by JAX AI Agency** | Baking AI solutions (and sourdough bread) 🍞

