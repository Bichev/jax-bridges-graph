# Coding Guidelines
## JAX Business Relationship Mapper

**Version:** 1.0.0  
**Last Updated:** November 9, 2024  
**Target Developers:** Solo developer using Cursor AI IDE

---

## Purpose

This document defines coding standards, best practices, and conventions for developing the JAX Business Relationship Mapper. Following these guidelines ensures consistency, maintainability, and quality throughout the codebase.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [File Organization](#file-organization)
3. [Naming Conventions](#naming-conventions)
4. [React Component Guidelines](#react-component-guidelines)
5. [JavaScript Standards](#javascript-standards)
6. [CSS & Styling](#css--styling)
7. [Data Handling](#data-handling)
8. [AI Integration](#ai-integration)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)
11. [Testing Guidelines](#testing-guidelines)
12. [Git & Version Control](#git--version-control)
13. [Documentation](#documentation)
14. [Security Best Practices](#security-best-practices)

---

## Project Setup

### Initial Configuration

```bash
# Create project with Vite
npm create vite@latest jax-business-mapper -- --template react

# Navigate to project
cd jax-business-mapper

# Install core dependencies
npm install react-force-graph-3d three

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install analysis script dependencies
npm install openai papaparse dotenv

# Create environment file
cp .env.example .env
```

### Required .env Variables

```bash
# .env (DO NOT COMMIT)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# .env.example (COMMIT THIS)
OPENAI_API_KEY=your_openai_api_key_here
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "analyze": "node scripts/analyze-relationships.js",
    "analyze:sample": "node scripts/analyze-relationships.js --sample=5"
  }
}
```

---

## File Organization

### Directory Structure

```
jax-business-mapper/
├── data/                          # Data files (version controlled)
│   ├── businesses.csv             # Input: Business profiles
│   ├── businesses.json            # Parsed business data
│   └── relationships.json         # Generated relationships
│
├── scripts/                       # CLI analysis tools
│   ├── analyze-relationships.js   # Main analysis script
│   └── utils/
│       ├── csv-parser.js          # CSV parsing utilities
│       └── openai-client.js       # OpenAI API wrapper
│
├── src/                           # React application source
│   ├── components/                # React components
│   │   ├── BusinessGraph3D.jsx
│   │   ├── RelationshipReport.jsx
│   │   ├── NetworkStats.jsx
│   │   ├── Header.jsx
│   │   └── index.js               # Component exports
│   │
│   ├── utils/                     # Frontend utilities
│   │   ├── graph-builder.js       # Graph data structure builder
│   │   ├── formatters.js          # Data formatting functions
│   │   └── constants.js           # App-wide constants
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useGraphData.js
│   │   └── useBusinessFilter.js
│   │
│   ├── styles/                    # Global styles
│   │   └── index.css
│   │
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
│
├── public/                        # Static assets
│   └── favicon.ico
│
├── .env.example                   # Environment template (COMMIT)
├── .env                           # Environment secrets (NEVER COMMIT)
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
├── README.md                      # Project overview & setup
├── ARCHITECTURE.md                # System architecture
├── PRD.md                         # Product requirements
└── CODING-GUIDELINES.md           # This document
```

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase.jsx | `BusinessGraph3D.jsx` |
| Utility Functions | camelCase.js | `graph-builder.js` |
| Constants | UPPER_SNAKE_CASE.js | `API_CONSTANTS.js` |
| Styles | kebab-case.css | `graph-styles.css` |
| Data Files | kebab-case.json | `relationships.json` |
| Scripts | kebab-case.js | `analyze-relationships.js` |

---

## Naming Conventions

### Variables & Functions

```javascript
// ✅ Good: Descriptive, camelCase
const businessCount = 20;
const analyzeRelationship = (bizA, bizB) => {};
const getConfidenceScore = () => {};

// ❌ Bad: Abbreviations, unclear
const bc = 20;
const ar = (a, b) => {};
const gcs = () => {};
```

### Constants

```javascript
// ✅ Good: UPPER_SNAKE_CASE for true constants
const MAX_BUSINESSES = 50;
const API_BASE_URL = 'https://api.openai.com/v1';
const RELATIONSHIP_TYPES = {
  VENDOR: 'vendor',
  PARTNER: 'partner',
  REFERRAL: 'referral',
  COLLABORATION: 'collaboration',
  SUPPLY_CHAIN: 'supply_chain'
};

// ❌ Bad: camelCase for constants
const maxBusinesses = 50;
const apiBaseUrl = 'https://api.openai.com/v1';
```

### React Components

```javascript
// ✅ Good: PascalCase, descriptive
const BusinessGraph3D = () => {};
const RelationshipReportCard = () => {};
const NetworkStatsDashboard = () => {};

// ❌ Bad: camelCase, unclear
const graph = () => {};
const report = () => {};
const dashboard = () => {};
```

### Boolean Variables

```javascript
// ✅ Good: Prefix with is/has/can/should
const isLoading = true;
const hasRelationships = false;
const canAnalyze = true;
const shouldRetry = false;

// ❌ Bad: No prefix
const loading = true;
const relationships = false;
const analyze = true;
```

### Event Handlers

```javascript
// ✅ Good: Prefix with 'handle' or 'on'
const handleNodeClick = (node) => {};
const onBusinessSelect = (business) => {};
const handleFilterChange = (filter) => {};

// ❌ Bad: No prefix
const nodeClick = (node) => {};
const businessSelect = (business) => {};
```

---

## React Component Guidelines

### Component Structure

```jsx
// ✅ Good: Consistent structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css'; // If component-specific styles

/**
 * Brief description of what this component does
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Description of data prop
 * @param {Function} props.onSelect - Description of callback
 */
const ComponentName = ({ data, onSelect }) => {
  // 1. State declarations
  const [localState, setLocalState] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Computed values
  const derivedValue = useMemo(() => {
    return someComputation(data);
  }, [data]);
  
  // 5. Early returns (loading, error states)
  if (!data) {
    return <div>Loading...</div>;
  }
  
  // 6. Main render
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
};

// PropTypes for type checking
ComponentName.propTypes = {
  data: PropTypes.array.isRequired,
  onSelect: PropTypes.func
};

// Default props
ComponentName.defaultProps = {
  onSelect: () => {}
};

export default ComponentName;
```

### Functional Components Over Class Components

```jsx
// ✅ Good: Functional component with hooks
const BusinessCard = ({ business, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div onClick={() => onSelect(business)}>
      <h3>{business.name}</h3>
      {isExpanded && <p>{business.description}</p>}
    </div>
  );
};

// ❌ Bad: Class component (avoid for new code)
class BusinessCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: false };
  }
  
  render() {
    return <div>{/* ... */}</div>;
  }
}
```

### Component Size Guidelines

- **Small Components:** <50 lines (preferred)
- **Medium Components:** 50-150 lines (acceptable)
- **Large Components:** 150+ lines (refactor into smaller pieces)

### Prop Drilling vs Context

```jsx
// ✅ Good: Use props for 1-2 levels deep
<Parent businesses={businesses}>
  <Child businesses={businesses} />
</Parent>

// ✅ Good: Use Context for 3+ levels or app-wide state
const BusinessContext = React.createContext();

const App = () => {
  const [businesses, setBusinesses] = useState([]);
  
  return (
    <BusinessContext.Provider value={{ businesses, setBusinesses }}>
      <DeepChild /> {/* Can access businesses without prop drilling */}
    </BusinessContext.Provider>
  );
};
```

### Custom Hooks

```jsx
// ✅ Good: Extract reusable logic into hooks
const useGraphData = (businesses, relationships, filter) => {
  const [graphData, setGraphData] = useState(null);
  
  useEffect(() => {
    const nodes = businesses.map(b => ({
      id: b.id,
      name: b.name,
      val: getConnectionCount(b.id, relationships)
    }));
    
    const links = relationships
      .filter(r => r.confidence >= filter.minConfidence)
      .map(r => ({
        source: r.from_id,
        target: r.to_id,
        value: r.confidence / 20
      }));
    
    setGraphData({ nodes, links });
  }, [businesses, relationships, filter]);
  
  return graphData;
};

// Usage
const MyComponent = () => {
  const graphData = useGraphData(businesses, relationships, filter);
  // ...
};
```

---

## JavaScript Standards

### Modern ES6+ Syntax

```javascript
// ✅ Good: Use const/let, not var
const immutableValue = 42;
let mutableValue = 0;

// ✅ Good: Arrow functions for inline callbacks
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// ✅ Good: Destructuring
const { name, industry } = business;
const [first, second] = array;

// ✅ Good: Template literals
const message = `Business ${name} operates in ${industry}`;

// ✅ Good: Spread operator
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, updatedField: 'value' };

// ✅ Good: Optional chaining
const email = business?.contact?.email;

// ✅ Good: Nullish coalescing
const name = business.name ?? 'Unknown Business';
```

### Async/Await Over Promises

```javascript
// ✅ Good: Async/await (more readable)
const analyzeRelationship = async (bizA, bizB) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Analysis failed:', error);
    return null;
  }
};

// ❌ Avoid: Promise chains (unless simple)
const analyzeRelationship = (bizA, bizB) => {
  return openai.chat.completions.create({ /* ... */ })
    .then(response => JSON.parse(response.choices[0].message.content))
    .catch(error => {
      console.error('Analysis failed:', error);
      return null;
    });
};
```

### Function Documentation

```javascript
/**
 * Analyzes potential relationship between two businesses using AI
 * 
 * @param {Object} businessA - First business object
 * @param {string} businessA.id - Business UUID
 * @param {string} businessA.name - Business name
 * @param {Object} businessB - Second business object
 * @returns {Promise<Object|null>} Relationship object or null if none found
 * @throws {Error} If OpenAI API call fails after retries
 * 
 * @example
 * const relationship = await analyzeRelationship(bizA, bizB);
 * if (relationship) {
 *   console.log(`Found ${relationship.type} relationship`);
 * }
 */
const analyzeRelationship = async (businessA, businessB) => {
  // Implementation
};
```

### Pure Functions Preferred

```javascript
// ✅ Good: Pure function (no side effects)
const calculateConfidenceScore = (relationship) => {
  const baseScore = relationship.mutual_benefit ? 70 : 50;
  const typeBonus = relationship.type === 'vendor' ? 10 : 0;
  return Math.min(baseScore + typeBonus, 100);
};

// ❌ Bad: Impure function (modifies external state)
let globalScore = 0;
const calculateConfidenceScore = (relationship) => {
  globalScore = relationship.mutual_benefit ? 70 : 50;
  return globalScore;
};
```

### Error Objects Over Strings

```javascript
// ✅ Good: Throw Error objects
throw new Error(`Business with id ${id} not found`);

// ✅ Good: Custom error classes
class AnalysisError extends Error {
  constructor(message, businessId) {
    super(message);
    this.name = 'AnalysisError';
    this.businessId = businessId;
  }
}

// ❌ Bad: Throw strings
throw 'Business not found';
```

---

## CSS & Styling

### Tailwind CSS Preferred

```jsx
// ✅ Good: Use Tailwind utility classes
const BusinessCard = ({ business }) => (
  <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition">
    <h3 className="text-xl font-bold text-cyan-400">{business.name}</h3>
    <p className="text-slate-300 mt-2">{business.industry}</p>
  </div>
);

// ⚠️ Acceptable: Custom CSS for complex layouts
// Use only when Tailwind becomes too verbose
import './BusinessCard.css';
```

### Brand Colors as Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'jax-cyan': '#00D9FF',
        'jax-navy': '#0A1628',
        'jax-white': '#FFFFFF'
      }
    }
  }
};

// Usage in components
<div className="bg-jax-navy text-jax-cyan">
  {/* Content */}
</div>
```

### Responsive Design

```jsx
// ✅ Good: Mobile-first responsive classes
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Scales: 100% → 50% → 33% */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Font scales with screen size */}
</div>

<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>
```

### CSS Organization

```css
/* src/styles/index.css */

/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Custom base styles */
@layer base {
  body {
    @apply bg-slate-900 text-white antialiased;
  }
}

/* 3. Custom component styles */
@layer components {
  .btn-primary {
    @apply bg-jax-cyan text-jax-navy px-4 py-2 rounded-lg hover:bg-cyan-400 transition;
  }
}

/* 4. Custom utilities */
@layer utilities {
  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }
}
```

---

## Data Handling

### CSV Parsing Standards

```javascript
// scripts/utils/csv-parser.js
import Papa from 'papaparse';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse businesses CSV file into structured JSON
 * 
 * @param {string} filePath - Path to CSV file
 * @returns {Array<Object>} Array of business objects
 */
export const parseBusinessesCSV = (filePath) => {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  
  const { data, errors } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_')
  });
  
  if (errors.length > 0) {
    console.warn('CSV parsing warnings:', errors);
  }
  
  return data.map((row, index) => ({
    id: uuidv4(),
    name: row.business_name || `Unknown Business ${index + 1}`,
    industry: row.industry || 'Not specified',
    services: row.services_offered || 'Not specified',
    target_market: row.target_market || 'Not specified',
    business_model: row.business_model || 'B2B',
    needs: row.current_needs || 'Not specified',
    looking_for: row.looking_for || 'Not specified',
    contact: row.contact_email || ''
  }));
};
```

### JSON Validation

```javascript
// Validate relationship structure before saving
const validateRelationship = (relationship) => {
  const requiredFields = [
    'from_id', 'to_id', 'type', 'confidence', 
    'reasoning', 'value_prop', 'action_items'
  ];
  
  for (const field of requiredFields) {
    if (!(field in relationship)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Type validations
  if (typeof relationship.confidence !== 'number' || 
      relationship.confidence < 0 || 
      relationship.confidence > 100) {
    throw new Error('Confidence must be number 0-100');
  }
  
  if (!Array.isArray(relationship.action_items) || 
      relationship.action_items.length === 0) {
    throw new Error('Action items must be non-empty array');
  }
  
  return true;
};
```

### Data Sanitization

```javascript
// Sanitize user input before processing
const sanitizeBusinessInput = (business) => ({
  ...business,
  name: business.name.trim().substring(0, 100),
  industry: business.industry.trim().substring(0, 50),
  services: business.services.trim().substring(0, 500),
  contact: business.contact.trim().toLowerCase()
});
```

---

## AI Integration

### OpenAI API Best Practices

```javascript
// scripts/utils/openai-client.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Call OpenAI API with retry logic and error handling
 * 
 * @param {Object} params - OpenAI completion parameters
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} API response
 */
export const callOpenAI = async (params, maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 800,
        ...params
      });
      
      return response;
      
    } catch (error) {
      attempts++;
      
      if (error.status === 429) {
        // Rate limit hit - exponential backoff
        const waitTime = Math.pow(2, attempts) * 1000;
        console.warn(`Rate limit hit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } else if (error.status >= 500) {
        // Server error - retry
        console.warn(`OpenAI server error, attempt ${attempts}/${maxRetries}`);
        
      } else {
        // Client error - don't retry
        throw error;
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
};
```

### Prompt Engineering

```javascript
// Build structured prompts with clear instructions
const buildAnalysisPrompt = (bizA, bizB) => {
  return `Analyze potential business relationship between these two companies:

BUSINESS A:
Name: ${bizA.name}
Industry: ${bizA.industry}
Services: ${bizA.services}
Target Market: ${bizA.target_market}
Business Model: ${bizA.business_model}
Current Needs: ${bizA.needs}
Looking For: ${bizA.looking_for}

BUSINESS B:
Name: ${bizB.name}
Industry: ${bizB.industry}
Services: ${bizB.services}
Target Market: ${bizB.target_market}
Business Model: ${bizB.business_model}
Current Needs: ${bizB.needs}
Looking For: ${bizB.looking_for}

Evaluate ALL possible relationship types:
- VENDOR: Could A provide services to B, or B to A?
- PARTNER: Could they collaborate on joint offerings?
- REFERRAL: Do they serve similar customers without competing?
- COLLABORATION: Could they work together on projects/events?
- SUPPLY_CHAIN: Are their services sequential (A→B or B→A)?

Return ONLY valid JSON (no markdown, no code blocks):
{
  "relationships": [
    {
      "from": "Business A" or "Business B",
      "to": "Business A" or "Business B",
      "type": "vendor|partner|referral|collaboration|supply_chain",
      "confidence": 0-100,
      "reasoning": "2-3 sentences explaining WHY this relationship makes sense",
      "value_prop": "Specific benefit (quantify if possible)",
      "action_items": ["specific step 1", "specific step 2", "specific step 3"],
      "estimated_value": "high|medium|low"
    }
  ],
  "mutual_benefit": true or false
}

If NO meaningful relationship exists, return: {"relationships": [], "mutual_benefit": false}

Focus on PRACTICAL, ACTIONABLE relationships. Be specific about value exchange.`;
};
```

### Response Parsing

```javascript
// Robust JSON parsing from AI responses
const parseAIResponse = (responseText) => {
  try {
    // Clean up markdown code blocks if present
    let cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
      throw new Error('Invalid response structure');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', responseText);
    return { relationships: [], mutual_benefit: false };
  }
};
```

---

## Error Handling

### Try-Catch Blocks

```javascript
// ✅ Good: Specific error handling
const analyzeAllRelationships = async () => {
  try {
    const businesses = await loadBusinesses();
    
    const relationships = [];
    for (let i = 0; i < businesses.length; i++) {
      for (let j = i + 1; j < businesses.length; j++) {
        try {
          const result = await analyzeRelationship(businesses[i], businesses[j]);
          if (result) relationships.push(result);
        } catch (error) {
          // Log and continue on single failure
          console.error(`Failed to analyze ${businesses[i].name} <-> ${businesses[j].name}:`, error.message);
        }
      }
    }
    
    return relationships;
    
  } catch (error) {
    // Fatal error - stop execution
    console.error('Critical error in analysis:', error);
    throw error;
  }
};
```

### Error Logging

```javascript
// scripts/utils/logger.js
import fs from 'fs';

const LOG_FILE = './logs/analysis.log';

export const logError = (context, error, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      ...data
    }
  };
  
  // Log to console
  console.error(`[${context}]`, error.message);
  
  // Log to file
  fs.appendFileSync(
    LOG_FILE,
    JSON.stringify(logEntry, null, 2) + '\n',
    'utf8'
  );
};

// Usage
try {
  await analyzeRelationship(bizA, bizB);
} catch (error) {
  logError('ANALYSIS_FAILED', error, {
    businessA: bizA.id,
    businessB: bizB.id
  });
}
```

### User-Friendly Error Messages

```jsx
// React error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>We're having trouble loading the network graph.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
          <details>
            <summary>Technical Details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## Performance Optimization

### React Performance

```jsx
// ✅ Good: Memoize expensive computations
const MyComponent = ({ businesses, relationships }) => {
  const graphData = useMemo(() => {
    return buildGraphData(businesses, relationships);
  }, [businesses, relationships]);
  
  return <Graph data={graphData} />;
};

// ✅ Good: Memoize callbacks
const MyComponent = ({ onSelect }) => {
  const handleClick = useCallback((node) => {
    onSelect(node);
  }, [onSelect]);
  
  return <Graph onNodeClick={handleClick} />;
};

// ✅ Good: Memoize components
const BusinessCard = React.memo(({ business }) => (
  <div>{business.name}</div>
));
```

### Data Processing

```javascript
// ✅ Good: Build lookup maps for O(1) access
const buildBusinessMap = (businesses) => {
  return businesses.reduce((map, business) => {
    map[business.id] = business;
    return map;
  }, {});
};

// Usage
const businessMap = buildBusinessMap(businesses);
const business = businessMap[id]; // O(1) instead of O(n) find()
```

### Debouncing & Throttling

```javascript
// Debounce search input
import { debounce } from 'lodash';

const SearchComponent = () => {
  const handleSearch = debounce((query) => {
    // Expensive search operation
  }, 300);
  
  return <input onChange={(e) => handleSearch(e.target.value)} />;
};
```

---

## Testing Guidelines

### Unit Tests (Future Enhancement)

```javascript
// Example test structure (using Vitest)
import { describe, test, expect } from 'vitest';
import { buildGraphData } from './graph-builder';

describe('buildGraphData', () => {
  test('creates nodes from businesses', () => {
    const businesses = [
      { id: '1', name: 'Test Business' }
    ];
    const relationships = [];
    
    const result = buildGraphData(businesses, relationships);
    
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe('1');
  });
  
  test('creates links from relationships', () => {
    const businesses = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' }
    ];
    const relationships = [
      { from_id: '1', to_id: '2', confidence: 80 }
    ];
    
    const result = buildGraphData(businesses, relationships);
    
    expect(result.links).toHaveLength(1);
    expect(result.links[0].source).toBe('1');
    expect(result.links[0].target).toBe('2');
  });
});
```

### Manual Testing Checklist

```markdown
## Pre-Deployment Testing

### Data Processing
- [ ] CSV with 10 businesses parses correctly
- [ ] CSV with empty cells handles gracefully
- [ ] Analysis script completes for 5 businesses
- [ ] relationships.json file created successfully
- [ ] Summary statistics are accurate

### UI Functionality
- [ ] 3D graph renders on page load
- [ ] Can rotate, zoom, pan graph
- [ ] Node click shows business details
- [ ] Relationship filtering works
- [ ] All links are clickable and correct

### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance
- [ ] Page loads in <3 seconds
- [ ] Graph renders smoothly (30+ FPS)
- [ ] No console errors
- [ ] No memory leaks
```

---

## Git & Version Control

### Commit Message Format

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style (formatting, no logic change)
refactor: Code refactoring
test: Adding or updating tests
chore: Build process, dependencies

# Examples:
feat(analysis): add confidence score calculation
fix(graph): resolve node overlap issue
docs(readme): update setup instructions
style(components): format code with prettier
refactor(utils): extract CSV parsing logic
chore(deps): upgrade react to 18.2.0
```

### Branch Strategy

```bash
# Main branch (production-ready)
main

# Development workflow (for POC, keep it simple)
feature/business-graph-3d
feature/relationship-report
fix/csv-parser-error

# Merge to main when feature is complete
git checkout main
git merge feature/business-graph-3d
git push origin main
```

### .gitignore Essentials

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.production

# Build output
dist/
build/

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# DO COMMIT THESE:
# data/businesses.csv (sample data)
# data/relationships.json (demo output)
# .env.example (template)
```

---

## Documentation

### README.md Structure

```markdown
# JAX Business Relationship Mapper

Brief description of what the tool does.

## Features
- AI-powered relationship detection
- Interactive 3D network visualization
- Personalized partnership reports

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation
\`\`\`bash
npm install
cp .env.example .env
# Edit .env with your OpenAI API key
\`\`\`

### Usage
\`\`\`bash
# Run analysis
npm run analyze

# Start dev server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure
[Link to ARCHITECTURE.md]

## Contributing
[Guidelines for contributors]

## License
[License information]
```

### Inline Code Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Use exponential backoff to avoid hammering the API during rate limits
await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));

// ❌ Bad: Comment states the obvious
// Wait for some time
await new Promise(resolve => setTimeout(resolve, 2000));

// ✅ Good: Document complex logic
/**
 * Force-directed graph layout requires careful tuning of physics parameters.
 * These values were determined through experimentation to balance:
 * - Visual clustering (gravity too high = blob, too low = explosion)
 * - Edge length (affects relationship visibility)
 * - Charge strength (node repulsion to prevent overlap)
 */
const graphConfig = {
  gravity: -50,
  linkDistance: 100,
  chargeStrength: -200
};
```

---

## Security Best Practices

### Environment Variables

```javascript
// ✅ Good: Load from environment
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// ❌ Bad: Hardcode secrets
const apiKey = 'sk-proj-xxxxx'; // NEVER DO THIS
```

### API Key Protection

```javascript
// scripts/analyze-relationships.js
// ✅ Server-side script: API key stays in Node.js

// src/components/MyComponent.jsx
// ❌ NEVER call OpenAI API directly from React components
// This would expose your API key in browser
```

### Input Sanitization

```javascript
// ✅ Good: Sanitize inputs before processing
const sanitizeCSVInput = (value) => {
  return value
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000);  // Limit length
};
```

### Content Security Policy

```javascript
// vite.config.js
export default {
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
};
```

---

## AI Assistant (Cursor) Specific Guidelines

### Code Generation Prompts

```markdown
When asking Cursor to generate code:

✅ Good prompts:
- "Create a React component that displays business relationships as cards with confidence scores"
- "Write a function to parse CSV with these columns: name, industry, services. Handle missing values."
- "Add error handling to the OpenAI API call with 3 retry attempts and exponential backoff"

❌ Vague prompts:
- "Make a component"
- "Parse the CSV"
- "Fix the error"

Include context:
- File names and locations
- Expected input/output
- Error messages (if debugging)
- Relevant code snippets
```

### Code Review Checklist

```markdown
Before accepting AI-generated code, verify:

- [ ] Follows naming conventions (camelCase, PascalCase, etc.)
- [ ] Includes JSDoc comments for functions
- [ ] Handles errors appropriately
- [ ] Uses modern ES6+ syntax
- [ ] No hardcoded values (uses constants)
- [ ] PropTypes defined for React components
- [ ] No console.log in production code (use proper logging)
- [ ] Code is DRY (Don't Repeat Yourself)
```

---

## Quality Checklist

### Pre-Commit Checklist

```markdown
Before committing code:

- [ ] Code runs without errors
- [ ] No unused imports or variables
- [ ] Console is clear of warnings
- [ ] Comments are up to date
- [ ] No API keys or secrets in code
- [ ] File names follow conventions
- [ ] Git commit message is descriptive
```

### Pre-Deployment Checklist

```markdown
Before deploying to production:

- [ ] All features working as expected
- [ ] Manual testing completed
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] README updated with latest changes
- [ ] Demo data prepared
- [ ] Vercel deployment configured
- [ ] DNS settings verified (if custom domain)
```

---

## Appendix

### VS Code / Cursor Extensions

Recommended extensions for development:

- **ES7+ React/Redux snippets** - Fast component scaffolding
- **Tailwind CSS IntelliSense** - Class name autocomplete
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **GitLens** - Git blame and history
- **Path Intellisense** - File path autocomplete

### Useful Code Snippets

```javascript
// React functional component
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

// Async function with error handling
const functionName = async (param) => {
  try {
    const result = await someAsyncOperation(param);
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    return null;
  }
};

// Custom hook
const useCustomHook = (dependency) => {
  const [value, setValue] = useState(null);
  
  useEffect(() => {
    // Hook logic
  }, [dependency]);
  
  return value;
};
```

---

**Document Status:** v1.0  
**Maintainer:** Vlad (JAX AI Agency)  
**Last Updated:** November 9, 2024  
**Next Review:** Post-POC completion
