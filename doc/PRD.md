# Product Requirements Document (PRD)
## JAX Business Relationship Mapper

**Version:** 1.0.0  
**Status:** POC Phase  
**Owner:** Vlad - JAX AI Agency  
**Target Launch:** December 2024  
**Last Updated:** November 9, 2024

---

## Executive Summary

### Product Vision

Create an AI-powered tool that automatically analyzes business profiles from the JAX Bridges cohort and identifies meaningful partnership opportunities, accelerating business relationship development in the Jacksonville entrepreneurial ecosystem.

### Problem Statement

**Current Pain Points:**
1. JAX Bridges cohort members struggle to identify relevant partnership opportunities among 20+ diverse businesses
2. Manual networking requires 1-on-1 conversations with each business to understand capabilities and needs
3. Valuable synergies are missed due to time constraints and limited visibility
4. No systematic way to evaluate partnership potential or prioritize outreach
5. Business owners spend time on low-potential connections instead of high-value relationships

**Impact:**
- Wasted networking time on mismatched connections
- Missed revenue opportunities from complementary businesses
- Slower business growth due to lack of strategic partnerships
- Cohort members underutilize the network's potential

### Success Metrics (POC)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Relationship Accuracy | 80%+ rated as "relevant" | User survey after demo |
| Time Saved | 10+ hours per cohort member | Estimated vs manual research |
| Partnership Conversions | 3+ actual partnerships formed | Follow-up survey (30 days) |
| Demo Engagement | 15+ cohort members view tool | Analytics tracking |
| AI Confidence Score | Average 70%+ | Analysis output data |

---

## Product Overview

### What It Is

A single-page web application that visualizes business relationships as an interactive 3D network graph, powered by AI analysis that identifies vendor, partner, referral, collaboration, and supply chain opportunities.

### What It Is Not

- ❌ A CRM or contact management system
- ❌ A social network or messaging platform
- ❌ A lead generation or sales automation tool
- ❌ A multi-tenant SaaS product (not yet)
- ❌ A real-time collaboration workspace

### Core User Journey

```
User Flow:

1. User receives link to deployed application
   └─> Lands on 3D network graph view

2. User explores visual network
   ├─> Sees their business as a node
   ├─> Identifies connection density (node size)
   └─> Clicks on their business node

3. User views personalized report
   ├─> Top partnership opportunities ranked by confidence
   ├─> AI-generated reasoning for each match
   ├─> Specific action items to initiate contact
   └─> Value propositions for each relationship

4. User takes action
   ├─> Notes high-priority contacts
   ├─> Reaches out via email/phone
   └─> References AI insights in conversation

5. (Future) User provides feedback
   └─> Ratings improve future analysis accuracy
```

---

## User Personas

### Primary Persona: Sarah - Marketing Agency Owner

**Demographics:**
- Age: 35-45
- Business: Local digital marketing agency (5-10 employees)
- JAX Bridges cohort member
- Tech-savvy, uses modern tools daily

**Goals:**
- Find strategic partners to expand service offerings
- Identify vendors who can white-label specialized services
- Build referral network for non-competing services
- Grow revenue without hiring more staff

**Pain Points:**
- Limited time for networking events
- Difficulty assessing partnership fit before meetings
- Overwhelmed by quantity of cohort members
- Needs concrete next steps, not generic advice

**How This Product Helps:**
- Identifies AI consulting vendors (like JAX AI Agency) instantly
- Shows complementary businesses (web developers, photographers)
- Provides specific talking points for initial outreach
- Prioritizes highest-value relationships first

---

### Secondary Persona: Marcus - Commercial Real Estate Broker

**Demographics:**
- Age: 40-55
- Business: Independent commercial RE broker
- JAX Bridges cohort member
- Moderate tech comfort, prefers simple tools

**Goals:**
- Find service providers to recommend to clients
- Build referral partnerships with complementary businesses
- Establish thought leadership in local market
- Increase deal flow through strategic relationships

**Pain Points:**
- Doesn't know what most cohort businesses actually do
- Misses opportunities because he doesn't recognize synergies
- Wastes time on coffee meetings with poor fit
- Needs to justify time investment in networking

**How This Product Helps:**
- Maps which businesses serve CRE clients (his referral targets)
- Identifies businesses needing CRE services (potential clients)
- Shows vendor relationships (legal, construction, design)
- Gives confidence scores to prioritize limited time

---

### Tertiary Persona: Vlad - AI Consultant & Tool Creator

**Demographics:**
- Age: 30-40
- Business: JAX AI Agency (AI consulting & automation)
- JAX Bridges cohort member & product creator
- High technical expertise

**Goals:**
- Identify white-label partnership opportunities with agencies
- Find businesses that need AI solutions
- Demonstrate AI capabilities to attract clients
- Position as thought leader and connector in cohort

**Pain Points:**
- Technical services are abstract—hard to explain value
- Many businesses don't know they need AI services
- Cold outreach lacks personalization
- Needs proof points that AI delivers ROI

**How This Product Helps:**
- Automatically identifies marketing agencies needing AI vendor
- Provides specific use cases per business type
- Serves as live demo of AI capabilities
- Creates warm introductions through shared insights

---

## Functional Requirements

### FR-1: Data Input & Management

**FR-1.1: CSV Data Import**
- **Priority:** P0 (Must Have)
- **Description:** System accepts CSV file with business profile data
- **Acceptance Criteria:**
  - CSV contains minimum required columns: Business Name, Industry, Services, Target Market, Business Model, Needs, Looking For, Contact
  - File placed manually in `data/businesses.csv` directory
  - Parser handles missing/empty cells gracefully (default to "Not specified")
  - Generates unique UUID for each business record
  - Validates minimum 2 businesses present (graph requires edges)

**FR-1.2: Data Persistence**
- **Priority:** P0 (Must Have)
- **Description:** Business and relationship data stored in JSON format
- **Acceptance Criteria:**
  - `data/businesses.json` created from CSV parse
  - `data/relationships.json` generated by analysis script
  - Files committed to Git repository
  - React app imports JSON files as static assets
  - Changes require rebuild/redeploy (no live updates)

---

### FR-2: AI Relationship Analysis

**FR-2.1: Pairwise Business Comparison**
- **Priority:** P0 (Must Have)
- **Description:** Analyze every business pair to identify relationships
- **Acceptance Criteria:**
  - Compare all unique pairs: n(n-1)/2 where n = business count
  - Each comparison generates 0-5 relationship candidates
  - Analysis completes for 20 businesses in <10 minutes
  - Progress logged to console during execution
  - Handles API failures with retry logic (3 attempts)

**FR-2.2: Relationship Type Detection**
- **Priority:** P0 (Must Have)
- **Description:** AI categorizes relationships into defined types
- **Acceptance Criteria:**
  - Identifies 5 relationship types: vendor, partner, referral, collaboration, supply_chain
  - Each relationship has single primary type
  - Type determination includes directional flow (A→B vs B→A)
  - Confidence score ranges 0-100 per relationship
  - Returns empty array if no meaningful relationship exists

**FR-2.3: Relationship Scoring & Reasoning**
- **Priority:** P0 (Must Have)
- **Description:** AI assigns confidence scores and generates explanations
- **Acceptance Criteria:**
  - Confidence score represents relationship strength (0-100)
  - Reasoning explains WHY relationship makes sense (2-3 sentences)
  - Value proposition states specific business benefit
  - 3-5 concrete action items provided per relationship
  - Estimated value tier assigned: high, medium, low

**FR-2.4: Analysis Script Execution**
- **Priority:** P0 (Must Have)
- **Description:** Node.js CLI script orchestrates analysis workflow
- **Acceptance Criteria:**
  - Runs via `npm run analyze` command
  - Reads from `data/businesses.csv`
  - Outputs to `data/relationships.json`
  - Prints progress and summary statistics
  - Execution time <15 minutes for 20 businesses
  - Handles Ctrl+C gracefully (saves partial results)

---

### FR-3: Network Visualization

**FR-3.1: 3D Force Graph Display**
- **Priority:** P0 (Must Have)
- **Description:** Interactive 3D graph shows business network
- **Acceptance Criteria:**
  - Each business renders as 3D node/sphere
  - Node size reflects connection count (more connections = larger)
  - Relationships render as lines between nodes
  - Graph auto-arranges using force-directed layout
  - Smooth camera navigation (drag, zoom, rotate)
  - Renders 50 nodes + 200 edges at 30+ FPS

**FR-3.2: Node Visual Encoding**
- **Priority:** P1 (Should Have)
- **Description:** Node appearance conveys business information
- **Acceptance Criteria:**
  - Node color represents industry (consistent color mapping)
  - Node label shows business name on hover
  - Selected node highlights in brand color (#00D9FF)
  - JAX AI Agency node distinctly marked
  - Minimum 10px spacing between nodes (no overlap)

**FR-3.3: Edge Visual Encoding**
- **Priority:** P1 (Should Have)
- **Description:** Edge appearance conveys relationship details
- **Acceptance Criteria:**
  - Edge color represents relationship type (5 distinct colors)
  - Edge thickness reflects confidence score (thicker = higher)
  - Directional edges for vendor/supply_chain types
  - Non-directional edges for partner/referral types
  - Edge labels show on hover (relationship type + score)

**FR-3.4: Graph Interactions**
- **Priority:** P0 (Must Have)
- **Description:** Users can interact with graph elements
- **Acceptance Criteria:**
  - Click node → Shows business detail panel
  - Hover node → Displays business name tooltip
  - Hover edge → Shows relationship summary
  - Click background → Deselects current node
  - Graph responds to interactions <100ms

---

### FR-4: Business Reports

**FR-4.1: Individual Business View**
- **Priority:** P0 (Must Have)
- **Description:** Detailed report for single business
- **Acceptance Criteria:**
  - Shows business profile (name, industry, services, etc.)
  - Lists all relationships (both directions)
  - Sorted by confidence score (highest first)
  - Displays relationship type badge
  - Shows reasoning, value prop, and action items
  - Includes contact information for next steps

**FR-4.2: Opportunity Ranking**
- **Priority:** P0 (Must Have)
- **Description:** Relationships ranked by strategic value
- **Acceptance Criteria:**
  - Primary sort: confidence score (descending)
  - Secondary sort: estimated value tier (high > medium > low)
  - Top 5 opportunities highlighted visually
  - Filter by relationship type (vendor, partner, etc.)
  - Filter by confidence threshold (e.g., show only >70%)

**FR-4.3: Actionable Insights**
- **Priority:** P1 (Should Have)
- **Description:** Clear next steps for each relationship
- **Acceptance Criteria:**
  - 3-5 action items per relationship
  - Action items are specific (not generic advice)
  - Includes suggested outreach language
  - Links to contact information where available
  - Copy-to-clipboard functionality for action items

---

### FR-5: Network Analytics

**FR-5.1: Summary Statistics Dashboard**
- **Priority:** P1 (Should Have)
- **Description:** High-level metrics about network
- **Acceptance Criteria:**
  - Total business count
  - Total relationship count
  - Breakdown by relationship type (chart/table)
  - Confidence score distribution (histogram)
  - Most connected businesses (top 5)
  - Average connections per business

**FR-5.2: Analysis Metadata**
- **Priority:** P2 (Nice to Have)
- **Description:** Information about analysis run
- **Acceptance Criteria:**
  - Timestamp of last analysis
  - Number of API calls made
  - Estimated cost of analysis
  - Analysis duration (execution time)
  - OpenAI model used
  - Success rate (% relationships found)

---

## Non-Functional Requirements

### NFR-1: Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Graph render time | <3 seconds | Time to interactive |
| Page load time | <2 seconds | Lighthouse score |
| Analysis script (20 biz) | <10 minutes | Wall clock time |
| UI responsiveness | <100ms | Click to visual feedback |
| Mobile performance | Usable on tablet | Manual testing |

### NFR-2: Usability

**Accessibility:**
- Keyboard navigation supported for all interactions
- Color contrast meets WCAG AA standards
- Graph provides text alternative (table view)
- Font sizes minimum 14px for body text

**User Experience:**
- Zero-click to value: Graph visible on page load
- No authentication required (public demo)
- Works on Chrome, Firefox, Safari (latest versions)
- Responsive design: desktop (optimal), tablet (functional), mobile (readable)

### NFR-3: Reliability

**Availability:**
- 99% uptime (Vercel SLA)
- Graceful degradation if JSON files missing

**Error Handling:**
- Analysis script continues on single API failure
- Frontend shows friendly error if data malformed
- Console logs capture all errors for debugging

### NFR-4: Maintainability

**Code Quality:**
- Clear component separation (single responsibility)
- Inline comments for complex logic
- No external API calls from frontend (security)
- Environment variables for configuration

**Documentation:**
- README with setup instructions
- Inline JSDoc comments for functions
- ARCHITECTURE.md explains system design
- CODING-GUIDELINES.md defines standards

### NFR-5: Security

**POC Security Posture:**
- OpenAI API key stored in `.env` (server-side only)
- No user authentication (acceptable for demo)
- HTTPS enforced (Vercel default)
- No sensitive business data (public cohort info)

**Future Hardening:**
- API key proxy (hide from client)
- Input sanitization for CSV uploads
- Rate limiting on analysis runs

---

## User Stories

### Epic 1: Data Onboarding

**US-1.1: Upload Business Data**
- **As a** cohort organizer
- **I want to** manually update the CSV file with new business profiles
- **So that** the analysis reflects current cohort membership

**Acceptance Criteria:**
- CSV file replaced in `data/` directory
- Format validated during next script run
- Invalid rows logged but don't stop processing

---

**US-1.2: Run Analysis**
- **As a** cohort organizer
- **I want to** execute the analysis script via command line
- **So that** relationship data is generated from business profiles

**Acceptance Criteria:**
- Command runs: `npm run analyze`
- Progress shown in terminal with ETA
- Summary statistics printed on completion
- New `relationships.json` file created

---

### Epic 2: Network Exploration

**US-2.1: View Business Network**
- **As a** cohort member
- **I want to** see all businesses visualized as an interactive 3D graph
- **So that** I can understand the overall network structure

**Acceptance Criteria:**
- Graph renders on page load
- Businesses appear as nodes with labels
- Can rotate, zoom, and pan the graph
- Performance smooth with 20+ nodes

---

**US-2.2: Identify My Business**
- **As a** cohort member
- **I want to** quickly find my business in the graph
- **So that** I can see my connections at a glance

**Acceptance Criteria:**
- Search/filter by business name
- Node highlighting on hover
- Click node to select and zoom
- My business visually distinct (color or marker)

---

**US-2.3: Explore Relationships**
- **As a** cohort member
- **I want to** click on connections between businesses
- **So that** I can understand what type of relationship is suggested

**Acceptance Criteria:**
- Edge displays relationship type on hover
- Click edge shows detailed explanation modal
- Color coding distinguishes relationship types
- Confidence score visible

---

### Epic 3: Partnership Discovery

**US-3.1: View My Opportunities**
- **As a** cohort member
- **I want to** see all businesses I could partner with
- **So that** I can prioritize my outreach efforts

**Acceptance Criteria:**
- Click my business node → Opens report panel
- List shows all relationships (outbound + inbound)
- Sorted by confidence score (highest first)
- Relationship type badge displayed
- Shows partner business name and industry

---

**US-3.2: Understand Relationship Value**
- **As a** cohort member
- **I want to** read AI-generated reasoning for each partnership
- **So that** I can evaluate if it's worth pursuing

**Acceptance Criteria:**
- Each relationship card shows 2-3 sentence reasoning
- Specific value proposition stated
- Mutual benefit indicated (yes/no)
- Examples of how partnership could work

---

**US-3.3: Get Actionable Next Steps**
- **As a** cohort member
- **I want to** see specific actions I can take to start this relationship
- **So that** I'm not stuck wondering "what do I do now?"

**Acceptance Criteria:**
- 3-5 action items listed per relationship
- Items are specific (not generic networking advice)
- Contact information provided (email/phone)
- Suggested outreach message template

---

### Epic 4: Network Insights

**US-4.1: See Network Statistics**
- **As a** cohort organizer
- **I want to** view aggregate statistics about the network
- **So that** I can measure cohort connectivity and engagement

**Acceptance Criteria:**
- Dashboard shows total businesses, relationships
- Breakdown by relationship type (chart)
- Most connected businesses highlighted
- Average connections per business calculated

---

**US-4.2: Filter Relationships**
- **As a** cohort member
- **I want to** filter relationships by type or confidence
- **So that** I can focus on my highest-priority opportunities

**Acceptance Criteria:**
- Filter by relationship type (vendor, partner, etc.)
- Filter by confidence threshold (slider or input)
- Filter by value tier (high, medium, low)
- Filters apply to both graph and report views

---

## UI/UX Requirements

### Visual Design

**Brand Colors (JAX AI Agency):**
- Primary: Cyan/Teal `#00D9FF`
- Secondary: Dark Navy `#0A1628`
- Accent: White `#FFFFFF`
- Graph backgrounds: Dark gradients (navy → black)

**Typography:**
- Headers: Modern sans-serif (Inter, Poppins, or system)
- Body: Readable sans-serif (16px minimum)
- Code/Data: Monospace (for IDs, technical details)

**Layout:**
- Desktop: 3D graph (70% width) + side panel (30%)
- Tablet: Stacked sections, collapsible panel
- Mobile: Single column, graph above list

### Key Screens

**Screen 1: Network Graph (Landing)**
```
┌─────────────────────────────────────────────────────────┐
│  [Header: JAX Bridges Business Network]    [🔍][⚙️]    │
├─────────────────────────────────────────────────────────┤
│                                            │            │
│                                            │  Stats:    │
│         3D Force Graph                     │  - 20 Biz  │
│         (Interactive)                      │  - 47 Rel  │
│                                            │            │
│                                            │  Filters:  │
│                                            │  □ Vendor  │
│                                            │  □ Partner │
│                                            │            │
└─────────────────────────────────────────────────────────┘
```

**Screen 2: Business Detail Report**
```
┌─────────────────────────────────────────────────────────┐
│  [← Back to Graph]         JAX AI Agency                │
├─────────────────────────────────────────────────────────┤
│  Industry: AI Consulting                                │
│  Services: AI agents, automation, custom solutions      │
│  Target: Marketing agencies, CRE, SMBs                  │
├─────────────────────────────────────────────────────────┤
│  Partnership Opportunities (7)                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [VENDOR] Creative Marketing Co.         92%        │ │
│  │ Digital marketing agency seeking AI automation     │ │
│  │                                                     │ │
│  │ 💡 Value: White-label AI services for their clients│ │
│  │ ✅ Actions:                                         │ │
│  │    1. Schedule intro call...                       │ │
│  │    2. Share wholesale pricing...                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Show More...]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Constraints

### Must Use

- React 18+ (functional components + hooks)
- Vite for build tooling
- Tailwind CSS for styling
- react-force-graph-3d for visualization
- OpenAI GPT-4 for analysis
- Vercel for hosting

### Must Not Use

- No backend server (static hosting only)
- No database (file-based storage)
- No authentication system
- No real-time features (WebSockets, etc.)
- No external dependencies beyond listed above

### Environment Constraints

- Node.js 18+ required for script execution
- Modern browser required (Chrome 90+, Firefox 88+, Safari 14+)
- Desktop/tablet recommended (mobile functional but suboptimal)

---

## Dependencies & Integrations

### External Services

**OpenAI API**
- **Purpose:** Generate relationship analysis
- **Model:** GPT-4 Turbo or GPT-4o
- **Rate Limit:** 60 requests/minute (handled by script)
- **Cost:** ~$0.03 per relationship analysis
- **Fallback:** None (manual analysis if API fails)

**Vercel**
- **Purpose:** Static site hosting & deployment
- **Plan:** Free tier (sufficient for POC)
- **Features:** Auto-deploy on Git push, HTTPS, CDN
- **Limitations:** No server-side code execution

### Internal Dependencies

**JAX Bridges Cohort Data**
- **Source:** Google Forms response CSV
- **Update Frequency:** Manual (as needed)
- **Data Owner:** JAX Bridges program coordinator
- **Privacy:** Public business information only

---

## Success Criteria

### POC Success (Launch)

**Must Achieve:**
- ✅ 20 JAX Bridges businesses loaded and analyzed
- ✅ 3D graph renders and is interactive
- ✅ At least 30 relationships identified
- ✅ Average confidence score 60%+
- ✅ Deployed to public URL (Vercel)
- ✅ Demo-ready presentation created

**Should Achieve:**
- ⭐ 10+ cohort members view the tool
- ⭐ 5+ members provide feedback
- ⭐ 80%+ rate relationships as "relevant"
- ⭐ 1-2 actual partnerships initiated

**Nice to Achieve:**
- 🎯 Featured in JAX Bridges newsletter
- 🎯 Interest from other cohorts/organizations
- 🎯 Media coverage (local business press)

---

### Post-POC Success (30 Days)

**Business Impact:**
- 3+ confirmed partnerships formed via tool
- 10+ intro calls scheduled between members
- JAX AI Agency gains 2+ client leads
- Tool used in cohort networking event

**Product Validation:**
- 70%+ accuracy on relationship suggestions
- Average user session 5+ minutes
- 50%+ of cohort uses tool at least once
- Feature requests collected for v2

---

## Future Enhancements (Out of Scope for POC)

### Phase 2 Features (Q1 2025)

**User Uploads:**
- CSV upload UI component (no manual file replacement)
- In-browser analysis trigger (no CLI script)
- Progress bar during analysis

**Enhanced Reporting:**
- Export individual reports to PDF
- Email digest of top opportunities
- Partnership "heat map" view

**Improved UX:**
- Search businesses by name/industry
- Save favorite/starred relationships
- Notes field for each business

### Phase 3 Features (Q2 2025)

**Multi-Tenant:**
- User authentication
- Multiple cohorts/workspaces
- Admin dashboard for organizers

**Advanced Analysis:**
- Incremental analysis (only new businesses)
- ML-based ranking (learn from feedback)
- Industry-specific relationship models

**Integrations:**
- Google Sheets sync
- Email introduction templates
- CRM export (HubSpot, Salesforce)

### Phase 4 Features (Q3+ 2025)

**AI Chat Interface:**
- "Find me partners in X industry"
- "Who can help with Y challenge?"
- Natural language queries over network

**Collaboration Features:**
- Share insights with specific members
- Group discussions on partnerships
- Event coordination (mixer planning)

**White-Label Product:**
- Rebrandable for chambers of commerce
- Multi-organization support
- SaaS pricing model

---

## Risks & Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenAI API rate limits | Medium | High | Implement exponential backoff, batch processing |
| Graph performance issues | Low | Medium | Limit to 50 nodes, optimize rendering |
| CSV format changes | High | Low | Validate schema, provide clear docs |
| Analysis produces poor matches | Medium | High | Iterate on prompts, test with sample data |
| Browser compatibility | Low | Medium | Test on major browsers, provide fallbacks |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Present at cohort meeting, create demo video |
| Privacy concerns | Low | Medium | Only use public business data, no PII |
| Inaccurate relationships | Medium | High | Disclaimer on AI-generated content, encourage validation |
| Insufficient ROI | Medium | Medium | Track actual partnerships formed, collect testimonials |
| Competition from existing tools | Low | Low | Emphasize AI automation + local focus |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data maintenance burden | High | Medium | Document update process, provide templates |
| Script execution failures | Medium | Medium | Robust error handling, save partial results |
| Cost overruns (OpenAI) | Low | Low | Monitor usage, set budget alerts |
| Lack of ongoing updates | Medium | High | Plan update schedule, assign owner |

---

## Open Questions

### To Be Resolved Before Development

1. **Data Access:**
   - Can we get sanitized version of JAX Bridges form responses?
   - Are there any data privacy restrictions?
   - Who is official owner of cohort member data?

2. **Scope Validation:**
   - Is 3D graph necessary or is 2D sufficient?
   - Should we include cohort members who graduated (past cohorts)?
   - Do we need export functionality for initial launch?

3. **Distribution:**
   - How will cohort members discover this tool?
   - Should we present at next cohort meeting?
   - Do we need a landing page explaining the tool?

4. **Feedback Loop:**
   - How will we collect user feedback post-launch?
   - Who will monitor for issues and respond?
   - When will we iterate based on learnings?

---

## Appendix

### Competitive Analysis

**Existing Solutions:**
- LinkedIn: Generic social graph, not AI-powered analysis
- Crunchbase: Focused on startups/funding, not SMB partnerships
- Alignable: Local networking, but manual browsing only
- BNI: Structured referral network, but requires membership/fees

**Our Differentiation:**
- AI-powered relationship detection (not manual)
- Specific to JAX Bridges cohort (trusted network)
- Free and open to cohort members
- Visual graph interface (not just list)
- Actionable insights (not just contact info)

### Reference Materials

- JAX Bridges program overview: [link]
- Form responses template: [link to sanitized CSV]
- OpenAI API documentation: https://platform.openai.com/docs
- react-force-graph: https://github.com/vasturiano/react-force-graph

### Glossary

| Term | Definition |
|------|------------|
| **Cohort** | Group of ~20 businesses in JAX Bridges program |
| **Relationship** | AI-identified connection between two businesses |
| **Confidence Score** | 0-100 rating of relationship strength |
| **Node** | Business representation in graph |
| **Edge** | Relationship connection in graph |
| **Vendor Relationship** | One business provides services to another |
| **Partner Relationship** | Mutual collaboration on offerings |
| **Referral Relationship** | Shared audience, non-competing |

---

**Document Status:** Draft v1.0  
**Sign-Off Required:** Vlad (Product Owner)  
**Next Review:** Post-POC demo feedback  
**Change Log:** Initial draft - November 9, 2024
