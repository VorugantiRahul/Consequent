const express = require('express');
const cors = require('cors');
const path = require('path');
const hindsightMemory = require('./src/engine/hindsightMemory');
const decisionEngine = require('./src/engine/decisionEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const hindsightService = require('./src/services/hindsightService');

// 1. Health & status
app.get('/api/status', (req, res) => {
  const analytics = hindsightMemory.getAnalytics();
  const hindsightStatus = hindsightService.getStatus();
  res.json({
    status: 'ONLINE',
    system: 'Consequent Decision Engine',
    hindsightConnected: true,
    hindsightStatus,
    tagline: 'Most AI agents remember conversations. Consequent remembers consequences.',
    analytics
  });
});

// Hindsight Engine Endpoints
app.get('/api/hindsight/status', (req, res) => {
  res.json(hindsightService.getStatus());
});

app.post('/api/hindsight/configure', async (req, res) => {
  const { apiKey, baseUrl, bankId } = req.body;
  const status = hindsightService.configure({ apiKey, baseUrl, bankId });
  const testResult = await hindsightService.testConnection();
  res.json({
    success: testResult.success,
    status,
    testResult
  });
});

app.post('/api/hindsight/sync', async (req, res) => {
  const allExperiences = hindsightMemory.getAll();
  const result = await hindsightService.syncBatch(allExperiences);
  res.json(result);
});

// 2. Default target case (OL-2048: Meridian Systems)
app.get('/api/case/current', (req, res) => {
  const evaluation = decisionEngine.evaluateCase({
    caseId: "OL-2048",
    customerName: "Meridian Systems",
    customerTier: "Enterprise",
    contractValue: "₹2,00,000",
    issueCategory: "Delivery Delay",
    urgency: "Critical",
    previousActions: "Compensation already offered (₹5,000 credit)",
    relationshipRisk: "High (Imminent churn risk)",
    problemSummary: "An enterprise customer is threatening to cancel after their order was delayed twice. Compensation was already offered, but they remain dissatisfied."
  });
  res.json(evaluation);
});

// 3. Generate recommendation dynamically for any problem
app.post('/api/recommend', (req, res) => {
  try {
    const evaluation = decisionEngine.evaluateCase(req.body);
    res.json(evaluation);
  } catch (err) {
    console.error('Error in /api/recommend:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Save Outcome to Hindsight (The feedback loop!)
app.post('/api/outcome', (req, res) => {
  try {
    const outcomeData = req.body;
    const result = hindsightMemory.addOutcome(outcomeData);
    res.json({
      success: true,
      message: 'Consequence successfully committed to Hindsight Memory store.',
      recordedExperience: result.newRecord,
      updatedAnalytics: result.updatedAnalytics
    });
  } catch (err) {
    console.error('Error saving outcome:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Experience Library: list with search and filters
app.get('/api/experiences', (req, res) => {
  let experiences = hindsightMemory.getAll();
  const { query, tier, category, outcome } = req.query;

  if (query) {
    const q = query.toLowerCase();
    experiences = experiences.filter(e =>
      e.customerName.toLowerCase().includes(q) ||
      e.problemSummary.toLowerCase().includes(q) ||
      e.recommendedApproach.toLowerCase().includes(q) ||
      e.caseCode.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q)
    );
  }

  if (tier && tier !== 'ALL') {
    experiences = experiences.filter(e => e.customerTier.toLowerCase() === tier.toLowerCase());
  }

  if (category && category !== 'ALL') {
    experiences = experiences.filter(e => e.issueCategory.toLowerCase() === category.toLowerCase());
  }

  if (outcome && outcome !== 'ALL') {
    experiences = experiences.filter(e => e.outcome.toLowerCase() === outcome.toLowerCase());
  }

  res.json({
    totalCount: experiences.length,
    experiences
  });
});

// 6. Experience Library: single case detail
app.get('/api/experience/:id', (req, res) => {
  const experiences = hindsightMemory.getAll();
  const found = experiences.find(e => e.id === req.params.id || e.caseCode === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  res.json(found);
});

// 7. Learning Analytics
app.get('/api/analytics', (req, res) => {
  const analytics = hindsightMemory.getAnalytics();
  res.json(analytics);
});

// 8. Reset to Seed State
app.post('/api/reset', (req, res) => {
  const analytics = hindsightMemory.resetSeed();
  res.json({
    success: true,
    message: 'Hindsight Memory reset to initial 23 experience seed state.',
    analytics
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Consequent Intelligence Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   "Most AI agents remember conversations.`);
    console.log(`    Consequent remembers consequences."`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
