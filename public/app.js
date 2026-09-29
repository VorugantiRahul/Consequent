/**
 * Consequent — Enterprise Decision Intelligence Application
 * Core Client Logic & State Orchestration
 */

let currentView = 'view-workspace';
let currentCaseData = null;
let currentAnalytics = null;
let demoStepIndex = 1;
let demoTimer = null;
let selectedOutcomeStatus = 'SUCCESS';

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initFormControls();
  initOutcomePills();
  initDemoWalkthrough();
  initModal();
  initLibraryFilters();

  // Load initial data
  await loadCurrentCase();
  await loadAnalytics();
  await loadExperienceLibrary();
});

// -----------------------------------------------------------------
// 1. Navigation & View Switching
// -----------------------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
  const views = document.querySelectorAll('.view-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.view;
      switchView(targetView);
    });
  });

  const btnNewCase = document.getElementById('btnSidebarNewCase');
  if (btnNewCase) {
    btnNewCase.addEventListener('click', () => {
      switchView('view-workspace');
      resetWorkspaceForm();
      showToast('New case initialized in workspace.');
    });
  }

  // Keyboard shortcut ⌘N or Ctrl+N
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      switchView('view-workspace');
      resetWorkspaceForm();
      showToast('New case initialized.');
    }
  });
}

function switchView(viewId) {
  currentView = viewId;

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === viewId);
  });

  if (viewId === 'view-library') {
    loadExperienceLibrary();
  } else if (viewId === 'view-analytics') {
    loadAnalytics();
  }
}

// -----------------------------------------------------------------
// 2. Workspace Form & Recommendation Evaluation
// -----------------------------------------------------------------
function initFormControls() {
  const btnGenerate = document.getElementById('btnGenerateRec');
  const btnApply = document.getElementById('btnApplyRec');
  const btnRevise = document.getElementById('btnReviseRec');

  btnGenerate.addEventListener('click', async () => {
    await triggerRecommendationGeneration();
  });

  btnApply.addEventListener('click', () => {
    const statusPill = document.getElementById('headerStatus');
    statusPill.className = 'pill pill-status-green';
    statusPill.textContent = 'In Execution (Applied)';
    
    document.getElementById('applyStatusText').textContent = 'Applied at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    showToast('Recommendation applied. Next: Capture operational consequence below.');

    // Smooth scroll to outcome capture card
    document.getElementById('outcomeSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    animateLearningLoop('nodeAction');
  });

  btnRevise.addEventListener('click', () => {
    document.getElementById('problemText').focus();
    showToast('Adjust problem narrative or parameters and re-generate.');
  });
}

async function loadCurrentCase() {
  try {
    const res = await fetch('/api/case/current');
    const data = await res.json();
    currentCaseData = data;
    renderRecommendation(data);
    renderIntelligencePanel(data.intelligence, data.learningState);
  } catch (err) {
    console.error('Error loading current case:', err);
  }
}

async function triggerRecommendationGeneration() {
  const btn = document.getElementById('btnGenerateRec');
  const statusEl = document.getElementById('retrievalStatus');
  
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> <span>Retrieving Hindsight...</span>`;
  statusEl.textContent = 'Querying 23 historical consequences across tiers...';

  // Animate loop node
  animateLearningLoop('nodeRec');

  const payload = {
    caseId: "OL-2048",
    customerName: "Meridian Systems",
    customerTier: document.getElementById('selectTier').value,
    issueCategory: document.getElementById('selectCategory').value,
    urgency: document.getElementById('selectUrgency').value,
    previousActions: document.getElementById('selectPrevAction').value,
    relationshipRisk: document.getElementById('selectRisk').value,
    problemSummary: document.getElementById('problemText').value.trim()
  };

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    currentCaseData = data;
    renderRecommendation(data);
    renderIntelligencePanel(data.intelligence, data.learningState);
    showToast('Recommendation adapted from historical consequence data.');
  } catch (err) {
    showToast('Evaluation error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>Generate recommendation</span>`;
    statusEl.textContent = 'Memory indexed • 18 historical cases queried';
  }
}

function renderRecommendation(data) {
  document.getElementById('recHeadline').textContent = data.recommendationTitle;
  document.getElementById('recConfidence').textContent = `${data.confidence}%`;
  document.getElementById('recWhyThisApproach').textContent = data.whyThisApproach;
  document.getElementById('recRelevantRisks').textContent = data.relevantRisks;
  document.getElementById('recExpectedOutcome').textContent = data.expectedOutcome;

  // Render 3 Action Steps
  const container = document.getElementById('actionStepsContainer');
  container.innerHTML = data.actionSteps.map(step => `
    <div class="action-step-item">
      <div class="step-badge">${step.number}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.description}</div>
      </div>
    </div>
  `).join('');
}

function renderIntelligencePanel(intel, learning) {
  if (!intel) return;

  document.getElementById('intelTotalAnalyzed').textContent = intel.totalSimilarAnalyzed || 18;
  document.getElementById('intelCountSuccess').textContent = `${intel.successfulCount || 11} successful`;
  document.getElementById('intelCountFailure').textContent = `${intel.unsuccessfulCount || 7} unsuccessful`;
  document.getElementById('intelBestRate').textContent = `${intel.bestHistoricalSuccessRate || 78}%`;
  document.getElementById('intelSimilarity').textContent = `${intel.similarityScore || 92}%`;

  const total = (intel.successfulCount || 11) + (intel.unsuccessfulCount || 7);
  const successPct = Math.round(((intel.successfulCount || 11) / total) * 100);
  document.getElementById('intelBarSuccess').style.width = `${successPct}%`;
  document.getElementById('intelBarFailure').style.width = `${100 - successPct}%`;

  document.getElementById('intelBestApproach').textContent = intel.mostEffectiveApproach;
  document.getElementById('intelWarning').textContent = intel.warning;

  if (learning) {
    document.getElementById('learningStateBadge').textContent = learning.insightBadge;
  }
}

// -----------------------------------------------------------------
// 3. Outcome Capture & Real-World Consequence Loop
// -----------------------------------------------------------------
function initOutcomePills() {
  const pills = document.querySelectorAll('.outcome-pill-btn');
  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      pills.forEach(p => p.className = 'outcome-pill-btn');
      selectedOutcomeStatus = btn.dataset.outcome;

      if (selectedOutcomeStatus === 'SUCCESS') {
        btn.classList.add('active-success');
        document.getElementById('inputCustomerResponse').value = 'Customer accepted the 2-hour delivery commitment and verified contract continuation.';
      } else if (selectedOutcomeStatus === 'PARTIALLY_SUCCESSFUL') {
        btn.classList.add('active-partial');
        document.getElementById('inputCustomerResponse').value = 'Customer agreed to wait for the courier, but requested a subsequent quarterly review.';
      } else if (selectedOutcomeStatus === 'FAILED') {
        btn.classList.add('active-failure');
        document.getElementById('inputCustomerResponse').value = 'Customer refused to wait, cited earlier broken promises, and terminated the agreement.';
      } else {
        btn.classList.add('active-pending');
        document.getElementById('inputCustomerResponse').value = 'Courier dispatched; awaiting customer reception confirmation.';
      }
    });
  });

  const btnSaveOutcome = document.getElementById('btnSaveOutcome');
  btnSaveOutcome.addEventListener('click', async () => {
    await saveOutcomeConsequence();
  });
}

async function saveOutcomeConsequence() {
  const btn = document.getElementById('btnSaveOutcome');
  btn.disabled = true;

  const payload = {
    caseCode: "CASE-OL-2048",
    customerName: document.getElementById('headerCustomer').textContent,
    customerTier: document.getElementById('selectTier').value,
    contractValue: document.getElementById('headerValue').textContent,
    issueCategory: document.getElementById('selectCategory').value,
    urgency: document.getElementById('selectUrgency').value,
    problemSummary: document.getElementById('problemText').value,
    recommendedApproach: document.getElementById('recHeadline').textContent,
    actionTaken: "Operations Lead dispatched priority courier with dedicated telemetry. VP scheduled follow-up.",
    outcome: selectedOutcomeStatus,
    resolutionTime: document.getElementById('selectResolutionTime').value,
    customerResponse: document.getElementById('inputCustomerResponse').value.trim(),
    notes: document.getElementById('inputOutcomeNotes').value.trim()
  };

  try {
    const res = await fetch('/api/outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    // Show feedback animation
    const feedbackBox = document.getElementById('feedbackSuccessMessage');
    const feedbackText = document.getElementById('feedbackText');
    feedbackText.textContent = `Recorded as ${data.recordedExperience.id}. Hindsight updated to ${data.updatedAnalytics.totalExperiencesLearned} experiences!`;
    feedbackBox.style.display = 'inline-flex';

    // Animate complete learning loop
    animateLearningLoop('nodeMemory');
    setTimeout(() => animateLearningLoop('nodeDecision'), 800);

    // Update stats across UI immediately
    updateAnalyticsKPIs(data.updatedAnalytics);
    document.getElementById('sidebarLibraryCount').textContent = data.updatedAnalytics.totalExperiencesLearned;
    
    // Update Case status to Resolved
    const statusPill = document.getElementById('headerStatus');
    statusPill.className = selectedOutcomeStatus === 'SUCCESS' ? 'pill pill-status-green' : 'pill pill-priority-red';
    statusPill.textContent = selectedOutcomeStatus === 'SUCCESS' ? 'Resolved (Retained)' : 'Closed (Consequence Logged)';

    showToast(`🔄 Consequence stored in Hindsight (${data.recordedExperience.id}). Future cases now reinforced.`);
  } catch (err) {
    showToast('Error recording outcome: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

function animateLearningLoop(targetNodeId) {
  document.querySelectorAll('.loop-node').forEach(node => node.classList.remove('node-active'));
  const target = document.getElementById(targetNodeId);
  if (target) {
    target.classList.add('node-active');
  }
}

// -----------------------------------------------------------------
// 4. Learning Analytics Screen
// -----------------------------------------------------------------
async function loadAnalytics() {
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    currentAnalytics = data;
    updateAnalyticsKPIs(data);
    renderTrendChart(data.successTrend);
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

function updateAnalyticsKPIs(data) {
  if (!data) return;
  document.getElementById('kpiTotal').textContent = data.totalExperiencesLearned;
  document.getElementById('kpiSuccess').textContent = data.successfulOutcomes;
  document.getElementById('kpiFailed').textContent = data.failedOutcomes;
  document.getElementById('kpiPending').textContent = data.pendingOutcomes;
}

function renderTrendChart(trend) {
  const container = document.getElementById('trendChartBox');
  if (!trend || trend.length === 0) return;

  const width = container.clientWidth || 540;
  const height = 180;
  const padding = 24;

  const points = trend.map((t, idx) => {
    const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
    // Map rate (40% to 100%) to Y
    const y = height - padding - ((t.trendRate - 40) / 60) * (height - padding * 2);
    return { x, y, rate: t.trendRate, caseNum: t.caseNumber };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '');

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <!-- Grid Lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#E5E5E0" stroke-dasharray="3,3" />
      <text x="${padding}" y="${padding - 6}" font-size="10" fill="#8E929C" font-family="Inter">100%</text>

      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="#E5E5E0" stroke-dasharray="3,3" />
      <text x="${padding}" y="${height / 2 - 6}" font-size="10" fill="#8E929C" font-family="Inter">70%</text>

      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#E5E5E0" />
      <text x="${padding}" y="${height - padding + 14}" font-size="10" fill="#8E929C" font-family="Inter">Case #1</text>
      <text x="${width - padding - 40}" y="${height - padding + 14}" font-size="10" fill="#8E929C" font-family="Inter">Case #${trend.length}</text>

      <!-- Trend Line -->
      <path d="${pathD}" fill="none" stroke="#166534" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Data Dots -->
      ${points.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#166534" stroke="#FFFFFF" stroke-width="1.5" />
      `).join('')}
    </svg>
  `;
}

// -----------------------------------------------------------------
// 5. Experience Library (Dense Table & Slide-Over Modal)
// -----------------------------------------------------------------
async function loadExperienceLibrary() {
  const search = document.getElementById('librarySearchInput').value;
  const tier = document.getElementById('filterTier').value;
  const category = document.getElementById('filterCategory').value;
  const outcome = document.getElementById('filterOutcome').value;

  const queryParams = new URLSearchParams({
    query: search,
    tier,
    category,
    outcome
  });

  try {
    const res = await fetch(`/api/experiences?${queryParams.toString()}`);
    const data = await res.json();
    renderLibraryTable(data.experiences);
    document.getElementById('sidebarLibraryCount').textContent = data.totalCount;
  } catch (err) {
    console.error('Error fetching library:', err);
  }
}

function renderLibraryTable(experiences) {
  const tbody = document.getElementById('libraryTableBody');
  if (!experiences || experiences.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-dim);">No historical cases match the selected filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = experiences.map(exp => {
    let outcomePill = '';
    if (exp.outcome === 'SUCCESS') outcomePill = '<span class="pill pill-status-green">SUCCESS</span>';
    else if (exp.outcome === 'FAILED') outcomePill = '<span class="pill pill-priority-red">FAILED</span>';
    else outcomePill = '<span class="pill pill-status-amber">PENDING</span>';

    const dateStr = new Date(exp.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <tr data-id="${exp.id}" onclick="openCaseTimelineModal('${exp.id}')">
        <td class="table-case-id">${exp.id}</td>
        <td>
          <span class="table-cust-title">${exp.customerName}</span>
          <span class="table-prob-sub">${exp.problemSummary}</span>
        </td>
        <td><span class="tier-pill">${exp.customerTier}</span></td>
        <td><div class="table-rec-text">${exp.recommendedApproach}</div></td>
        <td>${outcomePill}</td>
        <td><span class="font-mono font-bold">${exp.confidence}%</span></td>
        <td><span class="font-mono">${exp.similarityScore}%</span></td>
        <td style="color: var(--text-dim); font-size: 11px;">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

function initLibraryFilters() {
  const searchInput = document.getElementById('librarySearchInput');
  const filterTier = document.getElementById('filterTier');
  const filterCategory = document.getElementById('filterCategory');
  const filterOutcome = document.getElementById('filterOutcome');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadExperienceLibrary, 200);
  });

  [filterTier, filterCategory, filterOutcome].forEach(sel => {
    sel.addEventListener('change', loadExperienceLibrary);
  });
}

// -----------------------------------------------------------------
// 6. Slide-Over Timeline Modal
// -----------------------------------------------------------------
function initModal() {
  const modal = document.getElementById('caseModalBackdrop');
  const btnClose = document.getElementById('btnCloseModal');

  btnClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

window.openCaseTimelineModal = async function(id) {
  const modal = document.getElementById('caseModalBackdrop');
  const modalBody = document.getElementById('modalBody');

  try {
    const res = await fetch(`/api/experience/${id}`);
    const exp = await res.json();

    document.getElementById('modalCaseCode').textContent = `${exp.id} • ${exp.caseCode || 'CASE-HISTORICAL'}`;
    document.getElementById('modalCustomerTitle').textContent = exp.customerName;

    modalBody.innerHTML = `
      <!-- Timeline Step 1: Ingestion -->
      <div class="timeline-step">
        <div class="timeline-dot">1</div>
        <div class="timeline-content">
          <div class="timeline-title">Operational Problem Ingested</div>
          <div class="timeline-text">${exp.problemSummary}</div>
          <div style="margin-top: 6px; display: flex; gap: 6px;">
            <span class="tier-pill">${exp.customerTier}</span>
            <span class="tier-pill">${exp.issueCategory}</span>
            <span class="tier-pill">${exp.contractValue}</span>
          </div>
        </div>
      </div>

      <!-- Timeline Step 2: Recommendation -->
      <div class="timeline-step">
        <div class="timeline-dot">2</div>
        <div class="timeline-content">
          <div class="timeline-title">AI Recommendation Dispensed</div>
          <div class="timeline-text"><strong>${exp.recommendedApproach}</strong></div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Assigned confidence: ${exp.confidence}%</div>
        </div>
      </div>

      <!-- Timeline Step 3: Action Taken -->
      <div class="timeline-step">
        <div class="timeline-dot">3</div>
        <div class="timeline-content">
          <div class="timeline-title">Human Action Executed</div>
          <div class="timeline-text">${exp.actionTaken}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Resolution turnaround: ${exp.resolutionTime}</div>
        </div>
      </div>

      <!-- Timeline Step 4: Outcome Consequence -->
      <div class="timeline-step">
        <div class="timeline-dot" style="background-color: ${exp.outcome === 'SUCCESS' ? 'var(--green-deep)' : 'var(--red-muted)'};">4</div>
        <div class="timeline-content" style="border-left: 3px solid ${exp.outcome === 'SUCCESS' ? 'var(--green-deep)' : 'var(--red-muted)'};">
          <div class="timeline-title" style="color: ${exp.outcome === 'SUCCESS' ? 'var(--green-deep)' : 'var(--red-muted)'};">
            Real-World Outcome: ${exp.outcome}
          </div>
          <div class="timeline-text">${exp.customerResponse}</div>
          ${exp.failureReason ? `<div style="font-size: 11px; color: var(--red-text); margin-top: 6px;"><strong>Failure Root Cause:</strong> ${exp.failureReason}</div>` : ''}
        </div>
      </div>

      <!-- Timeline Step 5: Hindsight Memory Takeaway -->
      <div class="timeline-step">
        <div class="timeline-dot" style="background-color: var(--primary-charcoal);">5</div>
        <div class="timeline-content" style="background-color: var(--green-bg); border-color: var(--green-border);">
          <div class="timeline-title font-green">Hindsight Takeaway Inscribed</div>
          <div class="timeline-text" style="color: var(--green-text); font-weight: 500;">"${exp.hindsightTakeaway}"</div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  } catch (err) {
    console.error('Error opening case timeline modal:', err);
  }
};

// -----------------------------------------------------------------
// 7. Interactive 60-Second Walkthrough Stepper
// -----------------------------------------------------------------
function initDemoWalkthrough() {
  const stepBtns = document.querySelectorAll('.demo-step-btn');
  const btnAuto = document.getElementById('btnAutoWalkthrough');

  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      runDemoStep(parseInt(btn.dataset.step, 10));
    });
  });

  btnAuto.addEventListener('click', () => {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
      btnAuto.textContent = '▶ Run Demo';
      showToast('Walkthrough paused.');
    } else {
      btnAuto.textContent = '⏸ Pause Demo';
      let step = 1;
      runDemoStep(step);
      demoTimer = setInterval(() => {
        step++;
        if (step > 5) {
          clearInterval(demoTimer);
          demoTimer = null;
          btnAuto.textContent = '▶ Run Demo';
          showToast('60-second walkthrough complete!');
        } else {
          runDemoStep(step);
        }
      }, 7000);
    }
  });
}

function runDemoStep(stepNum) {
  demoStepIndex = stepNum;
  document.querySelectorAll('.demo-step-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.step, 10) === stepNum);
  });

  switchView('view-workspace');

  if (stepNum === 1) {
    // Step 1: Problem entered
    showToast('Step 1: High-stakes enterprise problem entered.');
    document.getElementById('problemText').value = "An enterprise customer is threatening to cancel after their order was delayed twice. Compensation was already offered, but they remain dissatisfied.";
    document.getElementById('problemText').scrollIntoView({ behavior: 'smooth', block: 'center' });
    animateLearningLoop('nodeProblem');
  } else if (stepNum === 2) {
    // Step 2: AI Recommendation generated
    showToast('Step 2: AI generates high-confidence recommendation.');
    triggerRecommendationGeneration();
    document.getElementById('recommendationCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    animateLearningLoop('nodeRec');
  } else if (stepNum === 3) {
    // Step 3: Apply recommendation and prepare outcome
    showToast('Step 3: Recommendation applied in real operations.');
    document.getElementById('btnApplyRec').click();
  } else if (stepNum === 4) {
    // Step 4: Consequence captured to Hindsight
    showToast('Step 4: Real-world consequence saved to Hindsight.');
    saveOutcomeConsequence();
  } else if (stepNum === 5) {
    // Step 5: Accumulated memory adapts future cases
    showToast('Step 5: Consequent shows updated intelligence across 24 cases.');
    switchView('view-analytics');
  }
}

function resetWorkspaceForm() {
  document.getElementById('problemText').value = "An enterprise customer is threatening to cancel after their order was delayed twice. Compensation was already offered, but they remain dissatisfied.";
  document.getElementById('headerCaseId').textContent = "OL-" + Math.floor(2000 + Math.random() * 900);
  const statusPill = document.getElementById('headerStatus');
  statusPill.className = 'pill pill-status-amber';
  statusPill.textContent = 'Awaiting action';
  document.getElementById('feedbackSuccessMessage').style.display = 'none';
}

// -----------------------------------------------------------------
// 8. Toast Helper
// -----------------------------------------------------------------
function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3800);
}
