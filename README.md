# 🚀 Consequent

> **“Most AI agents remember conversations. Consequent remembers consequences.”**

An enterprise AI decision-support agent designed for Customer Success and Operations Leads handling high-value customer escalations. Consequent learns directly from the real-world operational consequences of its past recommendations.

---

## 🏛️ Enterprise Visual & UX Architecture

Built with a sophisticated editorial design system inspired by high-reliability operational platforms (Linear, Stripe, Datadog):
- **Warm off-white surfaces** (`#FBFBFA`, `#F7F7F5`, `#FFFFFF`)
- **Charcoal typography** (`#18191B`, `#34373E`)
- **Semantic consequence coding**:
  - Deep Forest Green (`#166534`) for successful retentions
  - Muted Crimson (`#991B1B`) for contract failures & churn
  - Warm Amber (`#B45309`) for active pending cycles
- Restrained 1px borders, subtle soft shadows, and clean 6–8px corner radii.
- **Zero cartoon art, zero neon AI effects, and zero purple gradients.**

---

## 🖥️ Layout & Core Modules

### 1. Slim Left Navigation Sidebar
- Identity mark & Consequent branding
- **New Case** (`⌘N` shortcut)
- **Active Cases** (Badge count)
- **Experience Library** (Dense scannable case history)
- **Learning Analytics** (Strategic trends & empirical patterns)
- **Hindsight Connected** live status indicator
- User profile: **Arjun Mehta — Customer Success Lead**

### 2. Main Decision Workspace (Center)
- **Case Header**: Case ID `OL-2048`, Customer `Meridian Systems`, Account Value `₹2,00,000`, Priority `Critical`, Status `Awaiting action`.
- **Problem Input Area**: Professional narrative text area with structured context controls: Customer Tier, Issue Category, Urgency, Previous Actions, and Relationship Risk.
- **AI Recommendation Engine**:
  - High-confidence recommendation: *“Escalate directly to the regional operations lead, provide a confirmed delivery commitment within two hours, and schedule an executive follow-up with the customer.”*
  - **87% Empirical Confidence**
  - Three numbered operational action steps
  - Structured “Why this approach” justification
  - Relevant risks & expected outcome
  - Action buttons: *Apply recommendation* and *Revise*
- **Outcome Capture Workflow**:
  - Centrally featured feedback loop directly below the recommendation.
  - Quick outcome selectors: *Successful*, *Partially successful*, *Failed*, *Still pending*.
  - Customer response field, resolution turnaround, and operational notes.
  - Primary button: **Save outcome to Hindsight** (immediately increments experience counter and recalibrates future decisions).

### 3. Experience Intelligence Panel (Right Sidebar)
- Header: *What Consequent remembers*
- **18 similar experiences analyzed** (11 successful, 7 unsuccessful, 78% win rate, 92% similarity)
- Most effective approach: *Confirmed delivery commitment + direct escalation*
- Failure warning: *“Compensation alone failed in 4 of 5 comparable high-value accounts.”*
- Three compact retrieved case cards (*Apex Logistics, Zenith Retail, Kalyan Global Freight*)
- Continuous Hindsight cycle visualizer: `Problem → Recommendation → Action → Outcome → Memory → Better decision`
- Adaptation comparison:
  - Previous Generic Approach: *“Apologize and offer compensation.”*
  - Outcome-Informed Approach: *“Confirm delivery ownership, escalate internally, and involve an executive sponsor.”*

### 4. Experience Library Screen
- Dense, scannable operational table with live search and multi-attribute filters (Tier, Category, Outcome).
- Interactive slide-over modal displaying the full 5-stage chronological timeline for any case: Ingestion → AI Recommendation → Human Action → Real-World Consequence → Hindsight Inscription.

### 5. Learning Analytics Screen
- **23 Total Experiences Learned** (14 Successful, 7 Failed, 2 Pending)
- Cumulative decision accuracy trend line
- Outcome breakdown by customer tier (Enterprise vs Mid-Market vs SMB)
- Operational patterns associated with failure (e.g. *80% failure rate for discounts during delays*)
- Most effective strategic interventions (e.g. *86% success for confirmed 2h SLAs*)

---

## ⏱️ The 60-Second Walkthrough

The top navigation bar features a built-in **60S Walkthrough Stepper** with 1-click execution:

1. **Problem**: Enter high-stakes escalation (*Meridian Systems ₹2,00,000*).
2. **Recommend**: Agent generates recommendation (*87% confidence, 3 steps*).
3. **Apply & Log**: Manager applies action and inputs customer reaction.
4. **Consequence**: Click *Save outcome to Hindsight* — watch total experiences increase immediately from 23 to 24.
5. **Adapt**: See how accumulated historical outcomes permanently steer future recommendations away from failure patterns.

---

## 🚀 Quickstart & Local Execution

```bash
cd C:\Users\RAHUL\Downloads\project\OutcomeLoop
npm start
```
Open your browser at:
👉 **`http://localhost:3000`**
